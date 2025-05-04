# Hospital Data Analyzer

This script recursively searches through a directory for .gz and .csv files that contain hospital data. It processes these files and uses OpenAI to analyze and interpret the data, generating useful descriptions and potential questions that healthcare professionals might ask about the data.

## Features

- Recursively scans directories for .gz and .csv files
- Unpacks .gz files and processes any CSV files inside
- Reads CSV files and extracts the header and first 20 rows
- Uses OpenAI to interpret the data and generate:
  - A description of the data's purpose, format, and content
  - A list of questions that doctors or hospital administrators might ask about the data
- Saves analysis results as JSON files alongside the original data files

## Requirements

- Python 3.8 or higher
- OpenAI API key
- Dependencies:
  - openai
  - pandas
  - and other standard libraries

## Installation

1. Make sure you have a Python virtual environment activated:

   ```bash
   source venv/bin/activate
   ```

2. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY='your-api-key-here'
   ```

## Usage

Run the script by providing a directory path as an argument:

```bash
python hospital_data_analyzer.py /path/to/hospital/data
```

The script will:

1. Recursively search for .gz and .csv files in the specified directory
2. Unpack any .gz files it finds
3. Analyze all CSV files (including those extracted from .gz files)
4. Generate .analysis.json files containing descriptions and questions

## Example Output

For each CSV file processed, the script will generate a JSON file with the following structure:

```json
{
  "description": "This dataset contains patient admission records including dates, diagnoses, and treatment details...",
  "questions": [
    "What is the average length of stay for patients with cardiovascular conditions?",
    "How do readmission rates vary by age group and diagnosis?",
    "Which treatments show the highest success rates for specific conditions?",
    ...
  ]
}
```

## Notes

- The script uses the OpenAI GPT-4 Turbo model by default. You may need to change this based on your API access.
- Large CSV files are only analyzed based on their headers and first 20 rows to stay within API limits.
- Make sure your OpenAI API key has sufficient quota for the number of files you plan to analyze.
