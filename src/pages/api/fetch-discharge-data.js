import Database from "better-sqlite3";
import path from "path";

export default async function handler(req, res) {
  try {
    const { subject_id, admission_id } = req.query;

    // Validate required parameters
    if (!subject_id) {
      return res.status(400).json({ error: "subject_id is required" });
    }

    // Connect to the dc_data.db database
    const dbPath = path.resolve(process.cwd(), "db", "dc_data.db");
    const db = new Database(dbPath);

    try {
      // Prepare the query
      let query = "SELECT * FROM discharge WHERE subject_id = ?";
      let params = [subject_id];

      // Add admission_id to the query if provided
      if (admission_id) {
        query += " AND admission_id = ?";
        params.push(admission_id);
      }

      // Execute the query
      const rows = db.prepare(query).all(params);

      console.log(
        `Fetched ${rows.length} discharge records for subject_id ${subject_id}`
      );

      // Return the fetched discharge data
      return res.status(200).json({
        data: rows,
        subject_id: subject_id,
        admission_id: admission_id || null,
      });
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);
      return res.status(400).json({
        error: "SQL execution failed",
        sqlError: sqlError.message,
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
