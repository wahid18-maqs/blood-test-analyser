# Blood Test Report Analyser

A FastAPI-based application that analyzes blood test reports (PDF) using **Google Gemini** AI agents for medical, nutrition, and exercise recommendations. Results are cached and stored in a local SQLite database.

---

## Features

- **Upload PDF blood test reports** for AI-powered analysis.
- **Google Gemini AI agents**: Doctor, Verifier, Nutritionist, and Exercise Specialist.
- **Comprehensive and simple analysis** endpoints.
- **Nutrition and exercise recommendations** based on report content.
- **Caching** with Redis for faster repeated queries.
- **Analysis history** stored in Mongodb.

---

## Screenshot
<img width="1864" height="895" alt="blood-test-analyse-result" src="https://github.com/user-attachments/assets/213602b6-4f4c-407d-83cd-f69f5425c081" />


## Getting Started

### 1. Install Required Libraries

```sh
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file with your Google Gemini API key ,Serper API Key and MONGODB_URI .

### 3. Start Redis Server

Make sure Redis is running locally on the default port (6379).

### 4. Run the Application

```sh
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

---

## Notes

- **PDFs only:** Only PDF files are accepted for analysis.
- **Disclaimer:** All analyses are for informational purposes only and do not replace professional medical advice.
- **API Keys:** You need a valid Google Gemini API key and Serper API Key for full functionality.

