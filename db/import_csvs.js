const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const csv = require("csv-parser");

const db = new sqlite3.Database("./data.db");
const csvDir = "./data";

function importCSV(filePath, tableName) {
  return new Promise((resolve, reject) => {
    const rows = [];

    console.log(`Reading file: ${filePath}`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => {
        if (rows.length === 0) {
          console.warn(`⚠️ Skipping empty file: ${tableName}`);
          return resolve();
        }

        const columns = Object.keys(rows[0]);

        db.serialize(() => {
          db.run(`DROP TABLE IF EXISTS "${tableName}"`, (err) => {
            if (err) return reject(err);
            const createStmt = `CREATE TABLE "${tableName}" (${columns
              .map((c) => `"${c}" TEXT`)
              .join(", ")})`;

            db.run(createStmt, (err) => {
              if (err) return reject(err);

              const insertStmt = db.prepare(
                `INSERT INTO "${tableName}" (${columns
                  .map((c) => `"${c}"`)
                  .join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`
              );

              for (const row of rows) {
                insertStmt.run(columns.map((c) => row[c]));
              }

              insertStmt.finalize((err) => {
                if (err) return reject(err);
                console.log(`✅ Imported table: ${tableName}`);
                resolve();
              });
            });
          });
        });
      })
      .on("error", (err) => {
        console.error(`❌ Error reading ${tableName}:`, err);
        reject(err);
      });
  });
}

async function runImport() {
  const files = fs.readdirSync(csvDir).filter((f) => f.endsWith(".csv"));

  for (const file of files) {
    const filePath = path.join(csvDir, file);
    const tableName = path.basename(file, ".csv");

    try {
      await importCSV(filePath, tableName);
    } catch (err) {
      console.error(`❌ Failed to import ${file}:`, err);
    }
  }

  db.close(() => {
    console.log("📦 All imports complete. Database closed.");
  });
}

runImport();
