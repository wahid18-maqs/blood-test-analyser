# Blood Test Report Analyser

A FastAPI-based application that analyzes blood test reports (PDF) using **Google Gemini** AI agents for medical, nutrition, and exercise recommendations. Results are cached and stored in a local SQLite database.

---

## Features

- **Upload PDF blood test reports** for AI-powered analysis.
- **Google Gemini AI agents**: Doctor, Verifier, Nutritionist, and Exercise Specialist.
- **Comprehensive and simple analysis** endpoints.
- **Nutrition and exercise recommendations** based on report content.
- **Caching** with Redis for faster repeated queries.
- **Analysis history** stored in SQLite and viewable via API.

---

## Getting Started

### 1. Install Required Libraries

```sh
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file with your Google Gemini API key and Redis configuration.

### 3. Start Redis Server

Make sure Redis is running locally on the default port (6379).

### 4. Run the Application

```sh
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

---

## API Endpoints

- `POST /analyze`: Upload a PDF and get a comprehensive analysis.
- `POST /analyze-simple`: Upload a PDF and get a simple summary.
- `GET /history`: Retrieve analysis history from the database.
- `GET /health`: Health check endpoint.

---

## Notes

- **PDFs only:** Only PDF files are accepted for analysis.
- **Disclaimer:** All analyses are for informational purposes only and do not replace professional medical advice.
- **API Keys:** You need a valid Google Gemini API key and Serper API Key for full functionality.

