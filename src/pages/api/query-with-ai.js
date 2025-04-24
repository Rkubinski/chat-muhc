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
async function formatResultsWithAI(apiKey, results, userQuery, sqlQuery) {
  try {
    const system_prompt = `
      You are an assistant that formats database query results into readable HTML.
      Your task is to analyze the query results and present them in a clear, readable format.
      Use HTML to format the response, with <span style="font-weight: bold;"> tags to highlight important elements.
      If generating a list - make the <li> tags have a left margin of 10px.
      Focus on making the data understandable to non-technical users.
    `;

    const user_prompt = `
      USER QUESTION: ${userQuery}
      
      QUERY RESULTS: ${JSON.stringify(results, null, 2)}
      
      Please format these results in a readable way using HTML. Highlight key information with <span style="font-weight: bold;"> tags.
      Only include the formatted HTML in your response, no explanations or markdown.
    `;

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
          model: "gpt-4o-mini", // Or any appropriate model
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
          temperature: 0.3,
          max_tokens: 1000,
        }),
      }
    );

    const formattingData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI formatting error:", formattingData);
      return null;
    }

    // Extract formatted HTML from OpenAI response
    return formattingData.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error formatting results:", error);
    return null;
  }
}

// Function to read the schema file
const getSchemaContent = () => {
  const schemaPath = path.resolve(process.cwd(), "db", "schema.md");
  return fs.readFileSync(schemaPath, "utf8");
};

export default async function handler(req, res) {
  try {
    const userQuery = req.body.query;

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

    // Prepare the prompt for OpenAI
    const system_prompt = `
      You are an SQLite expert helping to generate valid SQLite queries based on a natural language question.
      
      Here is the database schema information:
      ${schemaContent}

      When asked about lab results - you need to use labevents table with the subject_id to fetch the relevant rows.
      Then use the itemid to join with d_labitems to get the item name (using the labels column).
      Using the label, you can then use columns valuenum and valueuom to get the numeric value and unit of the lab result from the labevents table.

      When asked for the discharge summary, include relevant microbiology results, lab results, chart events, hospital events, a diagnosis and anything else you deem necessary from the schema.


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

      // Format the results with OpenAI
      const formattedHtml = await formatResultsWithAI(
        apiKey,
        rows,
        userQuery,
        parsedSQL
      );

      console.log("Formatted HTML:", formattedHtml);

      return res.status(200).json({
        data: rows,
        sql: parsedSQL,
        originalQuery: userQuery,
        formattedHtml: formattedHtml,
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
