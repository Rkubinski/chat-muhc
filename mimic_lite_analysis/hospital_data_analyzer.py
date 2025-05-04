#!/usr/bin/env python3
import os
import sys
import argparse
import gzip
import json
import pandas as pd
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
import pytz
import shutil

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def get_est_timestamp():
    """
    Returns a timestamp string in Eastern Time Zone format
    """
    est = pytz.timezone('US/Eastern')
    now = datetime.now(est)
    return now.strftime('%Y%m%d_%H%M')

def create_annotation_run_folder():
    """
    Creates a timestamped folder for this annotation run
    """
    timestamp = get_est_timestamp()
    run_folder = Path('annotation_runs') / f'annotation_run_{timestamp}'
    
    # Create the directory if it doesn't exist
    run_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"Created annotation run folder: {run_folder}")
    return run_folder

def init_summary_df():
    """
    Initializes a DataFrame to track results of the analysis
    """
    # Create DataFrame with columns
    summary_df = pd.DataFrame(columns=[
        'Filename', 
        'File Type', 
        'File Path', 
        'Analysis JSON Path',
        'Description Summary',
        'Number of Questions',
        'Timestamp',
        'Description',  # Full description
        'Administrative_Questions', # Questions for hospital administrators
        'Research_Questions',       # Questions for researchers 
        'Clinical_Questions',       # Questions for doctors/clinicians
        'Full_Description',         # Same as Description but explicitly named for clarity
        'Full_Questions',           # Raw questions data as JSON string
        'Raw_JSON'                  # Complete JSON response
    ])
    
    return summary_df

def process_gz_file(gz_file_path, run_folder, summary_df):
    """
    Unpacks a gzip file and returns the extracted content
    """
    print(f"Processing .gz file: {gz_file_path}")
    
    # Create output filename by removing .gz extension
    output_file = gz_file_path.with_suffix('')
    
    # Create a copy in the run folder
    run_output_file = run_folder / output_file.name
    
    # Extract the file
    with gzip.open(gz_file_path, 'rb') as f_in:
        with open(run_output_file, 'wb') as f_out:
            f_out.write(f_in.read())
    
    print(f"Extracted to: {run_output_file}")
    
    # If the extracted file is a CSV, process it
    if run_output_file.suffix.lower() == '.csv':
        return process_csv_file(run_output_file, run_folder, summary_df, original_path=gz_file_path)
    
    # Add entry to summary DataFrame for non-CSV files
    new_row = pd.DataFrame({
        'Filename': [output_file.name],
        'File Type': ['Extracted from GZ'],
        'File Path': [str(gz_file_path)],
        'Analysis JSON Path': ['N/A'],
        'Description Summary': ['Not analyzed (not a CSV)'],
        'Number of Questions': [0],
        'Timestamp': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        'Description': [''],
        'Administrative_Questions': [''],
        'Research_Questions': [''],
        'Clinical_Questions': [''],
        'Full_Description': [''],
        'Full_Questions': [''],
        'Raw_JSON': ['']
    })
    
    return None, new_row

def process_csv_file(csv_file_path, run_folder, summary_df, original_path=None):
    """
    Reads a CSV file, extracts the header and first 20 lines, 
    and sends them to OpenAI for interpretation
    """
    print(f"Processing CSV file: {csv_file_path}")
    
    try:
        # Read the CSV file
        df = pd.read_csv(csv_file_path)
        
        # Get the header and first 20 rows
        header = list(df.columns)
        first_20_rows = df.head(20).to_string(index=False)
        
        # Construct the data sample
        data_sample = f"Header: {header}\n\nFirst 20 rows:\n{first_20_rows}"
        
        # Send to OpenAI for interpretation
        result = analyze_with_openai(data_sample, csv_file_path.name)
        
        # Generate output paths
        if original_path is None:
            original_path = csv_file_path
            
            # If input file is not already in the run folder, copy it there
            if run_folder not in str(csv_file_path):
                dest_file = run_folder / csv_file_path.name
                shutil.copy2(csv_file_path, dest_file)
                csv_file_path = dest_file
        
        # Save the result
        output_json = run_folder / f"{csv_file_path.stem}.analysis.json"
        with open(output_json, 'w') as f:
            json.dump(result, f, indent=4)
        
        print(f"Analysis saved to: {output_json}")
        
        # Extract the description and questions
        description = result.get('description', '')
        admin_questions = result.get('administrative_questions', [])
        research_questions = result.get('research_questions', [])
        clinical_questions = result.get('clinical_questions', [])
        
        
    
        # Count total number of questions
        num_questions = (
            len(admin_questions) + 
            len(research_questions) + 
            len(clinical_questions)
        ) if isinstance(admin_questions, list) and isinstance(research_questions, list) and isinstance(clinical_questions, list) else 'N/A'
        
        # Determine file type
        file_type = 'CSV from GZ' if original_path and original_path.suffix.lower() == '.gz' else 'CSV'
        

        
        # Format the questions for each category as bulleted lists
        admin_questions_str = '\n'.join([f"- {q}" for q in admin_questions]) if isinstance(admin_questions, list) else str(admin_questions)
        research_questions_str = '\n'.join([f"- {q}" for q in research_questions]) if isinstance(research_questions, list) else str(research_questions)
        clinical_questions_str = '\n'.join([f"- {q}" for q in clinical_questions]) if isinstance(clinical_questions, list) else str(clinical_questions)
        
        # Add entry to summary DataFrame
        new_row = pd.DataFrame({
            'Filename': [csv_file_path.name],
            'File Type': [file_type],
            'File Path': [str(original_path)],
            'Analysis JSON Path': [str(output_json)],
            'Timestamp': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            'Description': [description],
            'Administrative_Questions': [admin_questions_str],
            'Research_Questions': [research_questions_str],
            'Clinical_Questions': [clinical_questions_str],
            'Full_Description': [description],
            

        })
        
        return result, new_row
        
    except Exception as e:
        print(f"Error processing CSV file {csv_file_path}: {str(e)}")
        
        # Add error entry to summary DataFrame
        new_row = pd.DataFrame({
            'Filename': [csv_file_path.name],
            'File Type': ['CSV (Error)'],
            'File Path': [str(original_path or csv_file_path)],
            'Analysis JSON Path': ['N/A'],
            
            'Number of Questions': [0],
            'Timestamp': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            'Description': [''],
            'Administrative_Questions': [''],
            'Research_Questions': [''],
            'Clinical_Questions': [''],
            'Full_Description': [''],
      
        })
        
        return None, new_row

def parse_questions(questions_data):
    """
    Parse and categorize questions from the AI response
    Returns: (admin_questions, research_questions, clinical_questions, all_questions_display)
    """
    # Default empty lists
    admin_questions = []
    research_questions = []
    clinical_questions = []
    
    try:
        # Handle case where questions_data is a string that needs parsing
        if isinstance(questions_data, str):
            # Check if it's a markdown code block with JSON
            if "```json" in questions_data:
                # Extract json from markdown code block
                json_match = questions_data.split("```json")[1].split("```")[0].strip()
                questions_dict = json.loads(json_match)
            else:
                # Try to extract JSON if it's present without markdown
                json_start = questions_data.find('{')
                json_end = questions_data.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = questions_data[json_start:json_end]
                    questions_dict = json.loads(json_str)
                else:
                    # If no JSON structure, return the string as is for all types
                    return questions_data, questions_data, questions_data, questions_data
            
            # Extract categories from the JSON
            # Check both naming conventions (with or without "_questions" suffix)
            admin_questions = questions_dict.get("administrative_questions", questions_dict.get("administrative", []))
            research_questions = questions_dict.get("research_questions", questions_dict.get("research", []))
            clinical_questions = questions_dict.get("clinical_questions", questions_dict.get("clinical", []))
            
            # Create combined display of all questions
            all_questions = []
            if admin_questions:
                all_questions.append("Administrative Questions:")
                all_questions.extend([f"- {q}" for q in admin_questions])
                all_questions.append("")  # Empty line for separation
            
            if research_questions:
                all_questions.append("Research Questions:")
                all_questions.extend([f"- {q}" for q in research_questions])
                all_questions.append("")  # Empty line for separation
            
            if clinical_questions:
                all_questions.append("Clinical Questions:")
                all_questions.extend([f"- {q}" for q in clinical_questions])
            
            all_questions_display = "\n".join(all_questions)
            
        # Handle case where questions_data is already a dictionary
        elif isinstance(questions_data, dict):
            # Check both naming conventions
            admin_questions = questions_data.get("administrative_questions", questions_data.get("administrative", []))
            research_questions = questions_data.get("research_questions", questions_data.get("research", []))
            clinical_questions = questions_data.get("clinical_questions", questions_data.get("clinical", []))
            
            # Create combined display
            all_questions = []
            if admin_questions:
                all_questions.append("Administrative Questions:")
                all_questions.extend([f"- {q}" for q in admin_questions])
                all_questions.append("")  # Empty line
            
            if research_questions:
                all_questions.append("Research Questions:")
                all_questions.extend([f"- {q}" for q in research_questions])
                all_questions.append("")  # Empty line
            
            if clinical_questions:
                all_questions.append("Clinical Questions:")
                all_questions.extend([f"- {q}" for q in clinical_questions])
            
            all_questions_display = "\n".join(all_questions)
            
        # Handle case where questions_data is a list (old format)
        elif isinstance(questions_data, list):
            # In this case, we don't have categorization, so leave admin/research/clinical empty
            all_questions_display = "\n".join([f"- {q}" for q in questions_data])
            
        else:
            # Handle unexpected type
            all_questions_display = str(questions_data)
            
    except Exception as e:
        print(f"Error parsing questions: {str(e)}")
        admin_questions = []
        research_questions = []
        clinical_questions = []
        all_questions_display = str(questions_data)
    
    return admin_questions, research_questions, clinical_questions, all_questions_display

def analyze_with_openai(data_sample, filename):
    """
    Sends data to OpenAI API for interpretation using a two-step chained prompting approach:
    1. First generates a description of the data
    2. Then uses that description along with the original data to generate questions
    """
    print(f"Sending data from {filename} to OpenAI for analysis...")
    
    # Step 1: Generate description
    description = generate_description(data_sample, filename)
    
    # Step 2: Generate questions using the description and data
    questions_data = generate_questions(data_sample, filename, description)
    
    # Parse questions into categories
    admin_questions, research_questions, clinical_questions, _ = parse_questions(questions_data)
    
    # Combine results with separate question categories
    result = {
        "description": description,
        "administrative_questions": admin_questions,
        "research_questions": research_questions,
        "clinical_questions": clinical_questions,
        
    }
    
    return result

def generate_description(data_sample, filename):
    """
    First step: Generate a description of the data
    """
    print(f"Step 1: Generating description for {filename}...")
    
    system_prompt = """
You are a healthcare data analysis expert. Your goal is to read tabular hospital data and provide a clear and comprehensive description of the data.

#Precise Instructions
You will be provided with hospital data (headers and sample rows).
Generate a detailed description of the data that includes:
1. The purpose/function of this dataset in a hospital context
2. Description of key columns, examples of data points/values and their significance
3. The type of data captured and how it would be used in a hospital setting
4. Explain any abbreviations or acronyms used in the data

Your description should be thorough (1-2 paragraphs) and demonstrate a deep understanding of healthcare data.
"""

    user_prompt = f"""
File: {filename}

{data_sample}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5
        )
        
        description = response.choices[0].message.content.strip()
        print(f"✓ Description generated ({len(description)} chars)")
        return description
        
    except Exception as e:
        print(f"Error generating description: {str(e)}")
        return f"Error generating description: {str(e)}"

def generate_questions(data_sample, filename, description):
    """
    Second step: Generate questions based on the description and original data
    """
    print(f"Step 2: Generating questions for {filename} based on description...")
    
    system_prompt = """
You are a healthcare data analysis expert. You goal is to generate 3 types of questions based on the description and the data sample.

#Precise Instructions
You will be provided with:
1. Hospital data (headers and sample rows)
2. A description of the data

Based on this information, generate a comprehensive LIST of questions that:
- A doctor might ask to gain clinical insights for a specific individual patient
- A hospital administrator might ask for operational/management insights
- A researcher might ask to identify biomedically relevant patterns or research opportunities 

#Examples of questions
## Administrative questions
- How many patients were admitted with a certain diagnosis?
- How many patients were readmitted with a certain diagnosis?
- Average length of stay for patients with a certain diagnosis?
- Average length of stay in a certain unit?

## Research questions
- What is the relationship between the length of stay and the severity of the illness?
- Demographics of patients with a certain diagnosis?
- What is the relationship between the length of stay and the mortality rate?
- What is the relationship between the length of stay and the readmission rate?

## Clinical questions
 - How long has patient X been in the hospital?
 - What are lab values for patient X?
 - How many previous admissions has patient X had?
 - What procedures has patient X had?


Focus on questions that would require analysis of the data and would provide actionable insights to the doctor, administrator, or researcher.
The questions should be specific to the data columns available and overall relevant to the description of the data.

Return your response as a JSON object with three keys (administrative, research, clinical), each containing an array of strings with the questions.
For example: 
{
    "administrative_questions": ["Question 1?", "Question 2?", "Question 3?"],
    "research_questions": ["Question 4?", "Question 5?", "Question 6?"],
    "clinical_questions": ["Question 7?", "Question 8?", "Question 9?"]
}

Do not include any other text in your response - ONLY output the JSON object.
"""

    user_prompt = f"""
File: {filename}

DATA SAMPLE:
{data_sample}

DESCRIPTION OF THE DATA:
{description}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Try to parse as JSON 
        try:
            # Check for markdown code block
            if content.startswith("```") and "```" in content[3:]:
                # Extract content from code block
                json_content = content.split("```")[1]
                if json_content.startswith("json\n"):
                    json_content = json_content[5:]
                parsed_content = json.loads(json_content)
                print(f"✓ Questions generated from markdown code block")
                return parsed_content
            
            # Try to parse as direct JSON object
            if content.startswith("{") and content.endswith("}"):
                parsed_content = json.loads(content)
                if isinstance(parsed_content, dict):
                    print(f"✓ Questions generated in correct JSON format")
                    return parsed_content
            
            # Look for JSON structure within text
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                parsed_content = json.loads(json_str)
                if isinstance(parsed_content, dict):
                    print(f"✓ Questions generated and extracted from text")
                    return parsed_content
        
        except json.JSONDecodeError as e:
            print(f"Could not parse questions as JSON: {e}")
        
        # If we get here, we couldn't parse it as a JSON object
        # Return the raw content so the parse_questions function can try to handle it
        print(f"✓ Questions generated as text - will attempt to parse ({len(content)} chars)")
        return content
        
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return f"Error generating questions: {str(e)}"

def scan_directory(directory_path, run_folder, summary_df):
    """
    Recursively scans a directory for .gz and .csv files and processes them
    """
    dir_path = Path(directory_path)
    results = []
    
    print(f"Scanning directory: {dir_path}")
    
    # Walk through all files in the directory and its subdirectories
    for root, _, files in os.walk(dir_path):
        root_path = Path(root)
        
        for file in files:
            file_path = root_path / file
            
            # Process based on file extension
            if file.lower().endswith('.gz'):
                result, new_row = process_gz_file(file_path, run_folder, summary_df)
                summary_df = pd.concat([summary_df, new_row], ignore_index=True)
                if result:
                    results.append(result)
            elif file.lower().endswith('.csv'):
                result, new_row = process_csv_file(file_path, run_folder, summary_df)
                summary_df = pd.concat([summary_df, new_row], ignore_index=True)
                if result:
                    results.append(result)
    
    return results, summary_df

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Process hospital data files')
    parser.add_argument('directory', type=str, help='Directory containing data files')
    args = parser.parse_args()
    
    # Check if OPENAI_API_KEY is set
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please set it in your .env file or export it with: export OPENAI_API_KEY='your-api-key'")
        sys.exit(1)
    
    # Create annotation run folder
    run_folder = create_annotation_run_folder()
    
    # Initialize summary DataFrame
    summary_df = init_summary_df()
    
    # Process the directory
    results, summary_df = scan_directory(args.directory, run_folder, summary_df)
    
    # Save the summary DataFrame to CSV
    summary_csv_path = run_folder / 'analysis_summary.csv'
    summary_df.to_csv(summary_csv_path, index=False)
    
    # Print summary
    print(f"\nSummary: Processed {len(results)} files")
    print(f"Results saved to: {run_folder}")
    print(f"Summary CSV: {summary_csv_path}")
    print(f"\nThe CSV includes full descriptions and questions, so there's no need to run process_analysis_results.py separately.")

if __name__ == "__main__":
    main() 