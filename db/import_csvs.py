import os
import pandas as pd
import sqlite3

# Path to your CSV folder and output DB file
csv_dir = './dc_data'
sqlite_db = './dc_data.db'

# Connect to SQLite database (it'll be created if it doesn't exist)
conn = sqlite3.connect(sqlite_db)

# Loop through all CSV files
for filename in os.listdir(csv_dir):
    if filename.endswith('.csv'):
        table_name = os.path.splitext(filename)[0]
        file_path = os.path.join(csv_dir, filename)

        print(f'📥 Importing {filename} into table: {table_name}')

        try:
            # Load the CSV into a pandas DataFrame
            df = pd.read_csv(file_path, dtype=str).fillna('')  # keep all as text for safety

            print(f'→ {len(df)} rows, columns: {list(df.columns)}')

            # Import to SQLite
            df.to_sql(table_name, conn, if_exists='replace', index=False)
            print(f'✅ Imported table: {table_name}\n')
        except Exception as e:
            print(f'❌ Failed to import {filename}: {e}\n')

# Done
conn.close()
print("🏁 All imports complete. Database saved to:", sqlite_db)
