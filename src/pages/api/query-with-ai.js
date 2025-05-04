import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Function to parse SQL from markdown code blocks
function parseSQL(input) {
  // Check if the input contains SQL code blocks
  const sqlCodeBlockRegex = /```(?:sql)?\s*([\s\S]*?)\s*```/;
  const match = input.match(sqlCodeBlockRegex);

  if (match && match[1]) {
    // Return the content inside the code block
    return match[1].trim();
  }

  // If no code block is found, return the original input
  return input;
}

// Function to format query results using OpenAI
async function formatResultsWithAI(
  apiKey,
  results,
  userQuery,
  queryType,
  needsGraph
) {
  console.log("queryType", queryType);
  console.log("needsGraph", needsGraph);
  try {
    const typeGuidance = (() => {
      switch (queryType) {
        case "discharge_summary":
          return `
      These are instructions for a discharge summary format. Make sure each of these sections are present in the response.
      
      Admission ID
      Subject ID
      Discharge Summary
      Admission Date [admission date]
      Discharge Date [discharge date]

      Diagnosis
      List of relevant diagnoses - order by severity.

       Hospital Course
      Combine the procedures, transfers, medications/prescriptions received during admission and physician orders into a single section called "hospital course". Write it as a story, for example : 
     
      ** Example **
       The patient was admitted on [admission date] for surgical 
management of his coronary artery disease. He was worked-up in 
the usual preoperative manner. 

      The patient was taken to the Operating Room where he 
underwent coronary artery bypass grafting. Please see 
operative note for details. Postoperatively he was taken to the 
Intensive Care Unit for monitoring. Over the next several hours, 
he awoke neurologically intact and was extubated. He was 
transfused a unit of red blood cells for postoperative anemia. 
He remained in atrial fibrillation which was treated with 
Amiodarone. On postoperative day two, he was transferred to the 
step down unit for further recovery.

      Discharge disposition
      Use the admissions table discharge_location field

      Discharge instructions.
      Write example discharge instructions based on the relevant patient information - if surgical, write about owund care otherwise also write about when to return to hospital (given what symptoms) 
      Follow up instructions.
      Write example follow up instructions based on the relevant patient information.
          `;
        case "lab_results":
          return `
      When writing out lab results, generate a nice table with lots of whitespace for each cell.
          `;
        default:
          return "";
      }
    })();

    // Add graph-specific guidance if needed
    const graphGuidance = needsGraph
      ? `
      The user has requested visualization of the provided data. Generate a chart specification based on the query results.
      The chart specification should be provided as a JSON object in a specific format that can be directly used by Chart.js.
      
      Here is the format for the chart data:
      {
        "type": "One of: 'line', 'bar', or 'pie', depending on what best fits the data",
        "title": "A descriptive title for the chart",
        "labels": ["List of labels for the x-axis or pie segments"],
        "datasets": [
          {
            "label": "Dataset name",
            "data": [Array of numeric values],
            "backgroundColor": "Color or array of colors for the chart elements",
            "borderColor": "Color or array of colors for the borders",
            "borderWidth": 1
          }
        ]
      }
      
      For time series data, use line charts with dates as labels.
      For comparing categories, use bar charts.
      For showing proportions of a whole, use pie charts.
      
      IMPORTANT: Always use a blue color palette for all visualizations. Here are the specific blue shades to use:
      - For line charts: Use "#0d47a1" (dark blue) for the line color with a border width of 2
      - For bar charts: Use an array of different blue shades ["#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1", "#0a3880"] for different categories
      - For pie charts: Use an array of different blue shades ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1"]
      
      For dataset backgrounds that need transparency (like in line charts), use rgba format with transparency: "rgba(33, 150, 243, 0.2)" (light blue with transparency).
      `
      : "";

    const system_prompt = needsGraph
      ? `${graphGuidance}`
      : `
      You are an assistant that formats database query results into readable HTML.
      Your task is to analyze the query results and present them in a clear, readable format.
      Use HTML to format the response, with <span style="font-weight: bold;"> tags to highlight important elements.
      If generating a list - make the <li> tags have a left margin of 25px. 
      <ul> tags should have a top and bottom margin of 5px.
      For specific instructions on the format that should be presented, see below.

      ${typeGuidance}

       Focus on making the data understandable to non-technical users.
    `;

    console.log("SYSTEM PROMPT");
    console.log(system_prompt);

    const user_prompt = `
      USER QUESTION: ${userQuery}
      
      QUERY RESULTS: ${JSON.stringify(results, null, 2)}
      
      Please format these results ${
        needsGraph
          ? "by providing a chart specification in the requested JSON format for visualizing this data."
          : `in a readable way using HTML. Highlight key information with <span style="font-weight: bold;"> tags.`
      }  
      
      Only include the formatted response, no explanations or markdown.
    `;

    console.log("USER PROMPT");
    console.log(user_prompt);

    // Make request to OpenAI API to format results
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "o4-mini", // Or any appropriate model
          messages: [
            {
              role: "system",
              content: system_prompt,
            },
            {
              role: "user",
              content: user_prompt,
            },
          ],
          max_completion_tokens: 10000,
          temperature: 1,
        }),
      }
    );

    const formattingData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI formatting error:", formattingData);
      return null;
    }

    const content = formattingData.choices[0].message.content.trim();

    console.log("CONTENT");
    console.log(content);

    // Extract formatted HTML from OpenAI response
    return {
      formattedHtml: needsGraph ? null : content,
      chartData: needsGraph ? extractChartData(content) : null,
    };
  } catch (error) {
    console.error("Error formatting results:", error);
    return null;
  }
}

// Function to extract chart data from the OpenAI response
function extractChartData(content) {
  console.log("EXTRACTING CHART DATA");

  try {
    // Look for JSON content within the response
    const jsonMatch = content.match(/\{[\s\S]*"type"[\s\S]*\}/);

    if (jsonMatch) {
      const jsonString = jsonMatch[0];

      // Try to parse the JSON
      try {
        const chartData = JSON.parse(jsonString);
        console.log("CHART DATA");
        console.log(chartData);

        // Validate that it has the required properties
        if (chartData.type && chartData.labels && chartData.datasets) {
          console.log("Successfully extracted chart data:", chartData);
          return chartData;
        }
      } catch (parseError) {
        console.error("Error parsing chart JSON:", parseError);
      }
    }

    // If chart data JSON not found or invalid, try to extract it from a code block
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        const chartData = JSON.parse(codeBlockMatch[1]);
        if (chartData.type && chartData.labels && chartData.datasets) {
          console.log(
            "Successfully extracted chart data from code block:",
            chartData
          );
          return chartData;
        }
      } catch (parseError) {
        console.error("Error parsing chart JSON from code block:", parseError);
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting chart data:", error);
    return null;
  }
}

// Function to read the schema file
const getSchemaContent = () => {
  const schemaPath = path.resolve(process.cwd(), "db", "schema.md");
  return fs.readFileSync(schemaPath, "utf8");
};

// Function to extract admission ID from query results
function extractAdmissionId(results) {
  if (!results || results.length === 0) return null;

  // Try different field names that might contain admission ID
  const admissionIdFields = [
    "hadm_id",
    "admission_id",
    "admissionid",
    "adm_id",
  ];

  for (const field of admissionIdFields) {
    if (results[0][field]) {
      return String(results[0][field]);
    }
  }

  return null;
}

export default async function handler(req, res) {
  try {
    const userQuery = req.body.query;
    const queryType = req.body.queryType; // Get the query type from the request
    const needsGraph = req.body.needsGraph || false; // Get the graph flag from the request

    if (!userQuery) {
      return res.status(400).json({ error: "User query is required" });
    }

    // Get the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured" });
    }

    // Get database schema
    const schemaContent = getSchemaContent();

    // Prepare the prompt for OpenAI - add guidance based on query type
    let typeGuidance = "";

    if (queryType) {
      // Add specific guidance based on the query type
      switch (queryType) {
        case "discharge_summary":
          typeGuidance = `
            This is a discharge summary query. Fetch the most recent admission for a patient first, then use that admission id for all other queries.

            Always use the subject_id provided and the most recent admission id (hadm_id) to filter relevant queries 
            Focus on retrieving comprehensive patient information.

            Follow this format and methods to fetch the relevant data: 
            Admission Date: [admission date] - you need to use the admissions table filtered by subject_id to get the admission date.
            Discharge Date: [discharge date] - you need to use the admissions table filtered by subject_id to get the discharge date.
            
            Include the following sections in the discharge summary:
            Medications, procedures, diagnoses, physician orders.

          `;
          break;

        case "lab_results":
          typeGuidance = `

          When asked about lab results - you need to use labevents table with the subject_id to fetch the relevant rows.
          Then use the itemid to join with d_labitems to get the item name (using the labels column).
          Using the label, you can then use columns valuenum and valueuom to get the numeric value and unit of the lab result from the labevents table.

  

            This is a lab results query for an individual patient. Focus on the labevents table 
            and join with d_labitems to get meaningful labels. Include valueuom (units of measure) 
            in the results and sort by charttime to show chronological progression.
          `;
          break;

        case "demographics":
          typeGuidance = `
            This is a demographics query about the hospital population. Focus on aggregate functions (COUNT, AVG, etc.) 
            and grouping to provide statistical insights. Consider including breakdowns by age, gender, 
            ethnicity, or other demographic factors.
          `;
          break;

        case "administrative":
          typeGuidance = `
            This is an administrative query about hospital operations. Focus on bed occupancy, patient transfers, 
            length of stay, or service transitions. Include date/time information and consider trends over time.

            If asked about patient transfers - you need to use the admissions table and the services table.

            
            
          `;
          break;

        case "procedures":
          typeGuidance = `
            This is a query about procedures for a specific patient. Focus on the procedures_icd table 
            and join with d_icd_procedures to get procedure names. Include dates and other relevant clinical context.
          `;
          break;

        case "clinical":
          typeGuidance = `
            This is a clinical query about a specific patient. 
          `;
          break;
      }
    }

    // Prepare the prompt for OpenAI
    const system_prompt = `
      You are an SQLite expert helping to generate valid SQLite queries based on a natural language question.
      
      Here is the database schema information:
      ${schemaContent}

      ${typeGuidance}

      For all queries, always review the schema carefully to ensure you are using the correct table and column names.

      As general guide for how this database works, here are some examples:
      Diagnoses: [list of diagnoses] - you need to use the diagnoses_icd table filtered by subject_id joined with d_icd_diagnoses by "icd_code" to get the diagnosis name.
      Procedures: [list of procedures] - you need to use the procedures_icd table filtered by subject_id and ordered by seq_num, joined with d_icd_procedures by "icd_code" to get the procedure names. 
      Physician Orders: [list of physician orders] - Always join poe_detail table with the poe table first, before joining with recent_adm. You need to use the poe_detail table filtered by subject_id, ordered by poe_seq to retrieve the relevant physician orders. 
      Medications: [list of medications] - filter the prescriptions table by subject_id and hadm_id to get the relevant medications.
            

      Based on this schema and the following user question, please generate a valid SQLite query for the following natural language request.
      Remember, SQLite does not support using DISTINCT and a custom separator together in group_concat(). 
      If you need DISTINCT and want a custom separator, use a subquery to remove duplicates first, then group_concat:

    `;

    const user_prompt = `
      USER QUESTION: ${userQuery}
      
      Please respond with only the SQL query without any explanation. The query should be valid SQLite syntax.
    `;

    let model = "o4-mini";

    let params = {
      model: model, // Or any appropriate model
      messages: [
        {
          role: "system",
          content: system_prompt,
        },
        {
          role: "user",
          content: user_prompt,
        },
      ],
    };

    if (model === "o4-mini") {
      params.max_completion_tokens = 5000;
      params.temperature = 1;
    } else {
      temperature: 0, (params.max_tokens = 5000);
    }

    // Make request to OpenAI API to generate SQL
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", openaiData);
      return res.status(openaiResponse.status).json({
        error: "Failed to generate SQL query",
        details: openaiData,
      });
    }

    // Extract SQL query from OpenAI response
    const generatedSQL = openaiData.choices[0].message.content.trim();
    console.log("Generated SQL:", generatedSQL);

    // Parse SQL from markdown code blocks if present
    const parsedSQL = parseSQL(generatedSQL);
    console.log("Parsed SQL:", parsedSQL);

    // Execute the generated SQL query against the database
    const dbPath = path.resolve(process.cwd(), "db", "data.db");
    const db = new Database(dbPath);

    try {
      // Execute the SQL query
      const rows = db.prepare(parsedSQL).all();

      console.log("Rows:", rows);

      // Format the results using OpenAI for enhanced readability
      let formattedHtml = null;
      let chartData = null;

      const formattingResult = await formatResultsWithAI(
        apiKey,
        rows,
        userQuery,
        queryType,
        needsGraph
      );

      if (formattingResult) {
        formattedHtml = formattingResult.formattedHtml;
        chartData = formattingResult.chartData;
      }

      // Extract subject ID from query results if available
      let extractedSubjectId = null;
      if (rows && rows.length > 0 && rows[0].subject_id) {
        extractedSubjectId = String(rows[0].subject_id);
      }

      // Extract admission ID from query results if available
      const extractedAdmissionId = extractAdmissionId(rows);

      // Update response to include query type and extracted subject_id
      return res.status(200).json({
        data: rows,
        sql: parsedSQL,
        originalQuery: userQuery,
        queryType: queryType,
        formattedHtml: formattedHtml,
        extractedSubjectId: extractedSubjectId,
        extractedAdmissionId: extractedAdmissionId,
        chartData: chartData,
      });
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);

      // If SQL execution fails, return the error with the generated SQL
      return res.status(400).json({
        error: "SQL execution failed",
        sqlError: sqlError.message,
        sql: parsedSQL,
        originalQuery: userQuery,
      });
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: error.message });
  }
}
