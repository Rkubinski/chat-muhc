# MUHC Clinical Data Chat Interface

This repository contains a Next.js-based clinical data chat interface that allows healthcare professionals to query patient data using natural language. The system combines a React frontend with SQLite database integration and AI-powered chat functionality.

## Project Structure

```
.
├── chat-muhc/                 # Main Next.js web application
│   ├── src/                   # Source code for the web app
│   │   ├── components/        # React components
│   │   ├── pages/             # Next.js pages and API routes
│   │   └── styles/            # CSS and styling
│   ├── db/                    # Database files and import scripts (contact ryszard.kubinski@mail.mcgill.ca for access as files too big for upload)
│   └── public/                # Static assets
├── annotation_runs/           # Output from AI annotation processes
├── datasets/                  # Clinical datasets
├── scripts/                   # Utility scripts for data processing
└── requirements.txt           # Python dependencies
```

## Stack and Technologies

### Frontend

- **Next.js**: React framework for the web application
- **React**: UI library
- **Material UI**: Component library with custom styling
- **TypeScript**: Type-safe JavaScript

### Backend

- **Next.js API Routes**: API endpoints for data querying
- **SQLite (better-sqlite3)**: Database for storing clinical data
- **OpenAI API**: AI model integration for natural language processing

### Data Processing

- **Python**: Scripts for data analysis and processing
- **Pandas**: Data manipulation and analysis

## Setup and Installation

### Prerequisites

- Node.js 18.x or later
- Python 3.9 or later
- OpenAI API key

### Web Application Setup

1. Navigate to the chat-muhc directory:

   ```bash
   cd chat-muhc
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Python Environment Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Test your environment setup:
   ```bash
   python test_env.py
   ```

## Database Setup

The application uses SQLite databases to store clinical data:

1. The main database files are located in the `chat-muhc/db/` directory
2. To import CSV data into the database, use the provided import scripts:
   ```bash
   cd chat-muhc/db
   python import_csvs.py  # or node import_csvs.js
   ```

## Features

- **Natural Language Querying**: Ask questions about patient data in plain English
- **Chat Interface**: Conversational UI for interacting with clinical data
- **Discharge Summary Comparison**: Compare discharge summaries across patients
- **Subject ID Detection**: Automatically detects when users are asking about specific patients
- **Query Type Detection**: Classifies queries to provide appropriate responses

## Annotation Runs

The system includes functionality for running AI annotations on clinical data. Output from these annotation processes is stored in the `annotation_runs/` directory, with each run timestamped.

## Development

### Adding New Components

Place new React components in the `chat-muhc/src/components/` directory.

### API Routes

Backend API endpoints are located in `chat-muhc/src/pages/api/`.

### Database Schema

The database schema is documented in `chat-muhc/db/schema.md`.
