#!/usr/bin/env python3
import os
import sys
import argparse
import json
import pandas as pd
from pathlib import Path

def find_json_files(directory):
    """
    Recursively find all JSON files in a directory
    """
    json_files = []
    directory_path = Path(directory)
    
    for path in directory_path.rglob('*.json'):
        json_files.append(path)
    
    return json_files

def extract_base_name(filename):
    """
    Extract the base name from an analysis JSON file
    For example, 'admissions.analysis.json' -> 'admissions'
    """
    # Get the stem (filename without extension)
    name = Path(filename).stem
    
    # If the name has multiple parts separated by dots, take the first part
    if '.' in name:
        return name.split('.')[0]
    return name

def process_json_files(directory, csv_path, output_path):
    """
    Process all JSON files in the directory and update the CSV
    """
    # Find all JSON files
    json_files = find_json_files(directory)
    print(f"Found {len(json_files)} JSON files")
    
    # Read the input CSV
    try:
        df = pd.read_csv(csv_path)
        print(f"Read CSV with {len(df)} rows")
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)
    
    # Check if required columns exist
    if 'Filename' not in df.columns:
        print("Error: CSV file does not have a 'Filename' column")
        sys.exit(1)
    
    # Add columns for description and questions if they don't exist
    if 'Description' not in df.columns:
        df['Description'] = ''
    if 'Questions' not in df.columns:
        df['Questions'] = ''
    if 'Full_Description' not in df.columns:  # Add column for full description
        df['Full_Description'] = ''
    if 'Full_Questions' not in df.columns:   # Add column for full questions
        df['Full_Questions'] = ''
    if 'Raw_JSON' not in df.columns:         # Add column for raw JSON content
        df['Raw_JSON'] = ''
    
    # Track how many files were processed
    processed_count = 0
    
    # Process each JSON file
    for json_path in json_files:
        try:
            # Extract base name
            base_name = extract_base_name(json_path.name)
            csv_filename = f"{base_name}.csv"
            
            print(f"Processing: {json_path.name} (looking for {csv_filename})")
            
            # Find matching rows in DataFrame
            matching_rows = df['Filename'] == csv_filename
            
            if not matching_rows.any():
                print(f"  No matching row found for {csv_filename}")
                continue
            
            # Read the JSON file
            with open(json_path, 'r') as f:
                json_data = json.load(f)
                raw_json = json.dumps(json_data)  # Store the full JSON content
            
            # Extract description and questions
            description = json_data.get('description', '')
            questions = json_data.get('questions', '')
            
            # If questions is a list, convert to string for display
            questions_display = questions
            if isinstance(questions_display, list):
                questions_display = '\n'.join([f"- {q}" for q in questions_display])
            
            # Update the DataFrame
            df.loc[matching_rows, 'Description'] = description
            df.loc[matching_rows, 'Questions'] = questions_display
            df.loc[matching_rows, 'Full_Description'] = description
            df.loc[matching_rows, 'Full_Questions'] = questions if isinstance(questions, str) else json.dumps(questions)
            df.loc[matching_rows, 'Raw_JSON'] = raw_json
            
            processed_count += 1
            print(f"  Updated information for {csv_filename}")
            
        except Exception as e:
            print(f"  Error processing {json_path}: {e}")
    
    # Save the updated DataFrame
    try:
        df.to_csv(output_path, index=False)
        print(f"\nSuccessfully processed {processed_count} files")
        print(f"Updated CSV saved to: {output_path}")
    except Exception as e:
        print(f"Error saving output CSV: {e}")
        sys.exit(1)

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Process analysis JSON files and update CSV')
    parser.add_argument('directory', type=str, help='Directory containing JSON files to process')
    parser.add_argument('csv_path', type=str, help='Path to the CSV file to update')
    parser.add_argument('output_path', type=str, help='Path where the updated CSV will be saved')
    args = parser.parse_args()
    
    # Check if input directory exists
    if not os.path.isdir(args.directory):
        print(f"Error: Directory '{args.directory}' does not exist")
        sys.exit(1)
    
    # Check if input CSV exists
    if not os.path.isfile(args.csv_path):
        print(f"Error: CSV file '{args.csv_path}' does not exist")
        sys.exit(1)
    
    # Process the files
    process_json_files(args.directory, args.csv_path, args.output_path)

if __name__ == "__main__":
    main() 