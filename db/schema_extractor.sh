#!/usr/bin/env bash

DB_FILE="./data.db"
DESC_FILE="data/table_descriptions.csv"
OUTPUT_FILE="schema.md"

if [ ! -f "$DB_FILE" ]; then
  echo "❌ Database not found at $DB_FILE"
  exit 1
fi

if [ ! -f "$DESC_FILE" ]; then
  echo "❌ Description CSV not found at $DESC_FILE"
  exit 1
fi

echo "# SQLite Database Schema" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_Generated on $(date)_" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# ✅ Declare associative array
declare -A TABLE_DESCRIPTIONS

# ✅ Load table descriptions (columns: 1 = Filename, 8 = Description)
while IFS=',' read -r filename c2 c3 c4 c5 c6 c7 description; do
  table="${filename%.csv}"
  # Skip empty filenames (e.g. bad lines)
  if [[ -n "$table" ]]; then
    TABLE_DESCRIPTIONS["$table"]="$description"
  fi
done < <(tail -n +2 "$DESC_FILE")

# ✅ Get all tables from the SQLite DB
TABLES=$(sqlite3 "$DB_FILE" ".tables")

for TABLE in $TABLES; do
  echo "## Table: \`$TABLE\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  DESC="${TABLE_DESCRIPTIONS[$TABLE]}"
  if [ -n "$DESC" ]; then
    echo "**Description:** $DESC" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi

  echo "**Columns:**" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  sqlite3 "$DB_FILE" "PRAGMA table_info($TABLE);" | \
  awk -F'|' 'BEGIN { printf "| Column | Type | PK |\n|--------|------|----|\n" }
             { printf "| `%s` | `%s` | %s |\n", $2, $3, ($6 == 1 ? "✅" : "") }' >> "$OUTPUT_FILE"

  echo -e "\n" >> "$OUTPUT_FILE"
done

echo "✅ Schema exported to $OUTPUT_FILE"
