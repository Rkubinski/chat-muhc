// API endpoint for detecting query type
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

    // Prepare the prompt for OpenAI
    const system_prompt = `
      You are an expert at categorizing healthcare queries.
      Your task is to analyze a user's question about hospital data and classify it into one of these categories:
      
      1. discharge_summary: If the user is asking for a discharge summary or comprehensive patient report
      2. lab_results: If the user is asking for lab results for an individual patient
      3. demographics: If the user is asking general questions about the hospital population
      4. administrative: If the user is asking about hospital bed occupancy, transit between services, etc.
      5. procedures: If the user is asking specific questions about 1 patient's procedures
      6. Clinical: If the user is asking any other questions unrelated to lab results or procedures about clinical care for a specific patient
      
      Respond with ONLY the singularcategory name, without any additional text or explanation.
    `;

    const user_prompt = `
      USER QUESTION: ${userQuery}
      
      Please categorize this question into one of these types: discharge_summary, lab_results, demographics, administrative, procedures, clinical.
    `;

    console.log("user_prompt", user_prompt);

    // Make request to OpenAI API to categorize the query
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using the same model as query-with-ai.js
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
          max_tokens: 50, // Short response is sufficient for category names
        }),
      }
    );

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", openaiData);
      return res.status(openaiResponse.status).json({
        error: "Failed to categorize query",
        details: openaiData,
      });
    }

    // Extract category from OpenAI response and clean it
    const category = openaiData.choices[0].message.content.trim().toLowerCase();

    // Validate that we got a recognized category
    const validCategories = [
      "discharge_summary",
      "lab_results",
      "demographics",
      "administrative",
      "procedures",
      "clinical",
    ];

    let detectedCategory = category;

    // If the response doesn't exactly match one of our categories, attempt to normalize it
    if (!validCategories.includes(category)) {
      // Look for partial matches (e.g., "this is a lab_results query" -> "lab_results")
      for (const validCategory of validCategories) {
        if (category.includes(validCategory)) {
          detectedCategory = validCategory;
          break;
        }
      }

      // If still no match, default to a sensible fallback
      if (!validCategories.includes(detectedCategory)) {
        detectedCategory = "demographics"; // default fallback
      }
    }

    // Return the detected query type
    return res.status(200).json({
      queryType: detectedCategory,
      originalQuery: userQuery,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: error.message });
  }
}
