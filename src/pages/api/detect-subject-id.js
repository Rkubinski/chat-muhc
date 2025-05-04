// API endpoint for detecting subject_id mentions in user queries
export default async function handler(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
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
      You are a healthcare system assistant that extracts patient IDs (subject_id) from user queries.
      When a user mentions a patient by their ID, extract the ID and respond with only the ID number.
      
      Examples of messages that contain subject_ids:
      - "Show me labs for patient 12345" -> "12345"
      - "What's the diagnosis for subject_id 54321?" -> "54321"
      - "Get the discharge summary for patient ID 98765" -> "98765"
      - "I need information about the patient with ID 10293" -> "10293"
      
      If the query doesn't contain a specific subject_id, respond with "null".
      Your response should be exactly the ID number or "null", nothing else.
    `;

    const user_prompt = `
      User query: "${query}"
      
      Extract any patient/subject ID mentioned in this query. Return only the ID number or "null" if none exists.
    `;

    // Make request to OpenAI API to detect subject_id
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
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
          temperature: 0,
          max_tokens: 50,
        }),
      }
    );

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", openaiData);
      return res.status(openaiResponse.status).json({
        error: "Failed to analyze query",
        details: openaiData,
      });
    }

    // Extract subject_id from OpenAI response
    const detectedId = openaiData.choices[0].message.content.trim();

    // If the response is "null" or not a number, return null
    const subjectId =
      detectedId === "null" || isNaN(detectedId) ? null : detectedId;

    console.log("Detected subject_id:", subjectId);

    // Return the detected subject_id
    return res.status(200).json({
      subjectId: subjectId,
      originalQuery: query,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: error.message });
  }
}
