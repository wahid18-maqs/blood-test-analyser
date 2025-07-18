from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import os
import uuid
from dotenv import load_dotenv
import datetime
from typing import List
from crewai import Crew, Process
from agents import doctor
from task import help_patients
from db import reports_collection
from langchain_community.document_loaders import PyPDFLoader


load_dotenv()

app = FastAPI(title="Blood Test Report Analyser")

def extract_text_from_pdf(file_path: str) -> str:
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        return "\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print("Error reading PDF:", str(e))
        return ""



def run_crew(query: str, report: str):
    medical_crew = Crew(
        agents=[doctor],
        tasks=[help_patients],
        process=Process.sequential,
    )
    return medical_crew.kickoff({
        "query": query,
        "report": report  
    })


#  Root health check
@app.get("/")
async def root():
    return {"message": "Blood Test Report Analyser API is running"}

@app.post("/analyze")
async def analyze_blood_report(
    file: UploadFile = File(...),
    query: str = Form(default="Summarise my Blood Test Report")
):
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_path = f"data/blood_test_report_{file_id}.pdf"

    try:
        os.makedirs("data", exist_ok=True)

        # Save uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Default query fallback
        if not query.strip():
            query = "Summarise my Blood Test Report"

        #  Extract PDF content
        report_text = extract_text_from_pdf(file_path)

        if not report_text.strip():
            return {
                "status": "error",
                "message": "The PDF appears to be empty or unreadable."
            }

        # Process with CrewAI
        response = run_crew(query=query.strip(), report=report_text)

        # Save to MongoDB
        reports_collection.insert_one({
            "query": query,
            "analysis": str(response),
            "file_name": file.filename,
            "timestamp": datetime.datetime.utcnow()
        })

        return {
            "status": "success",
            "query": query,
            "analysis": str(response),
            "file_processed": file.filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    finally:
        # Cleanup uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass


# Get latest 10 reports from history
@app.get("/history")
async def get_history():
    try:
        records = reports_collection.find().sort("timestamp", -1).limit(10)
        return [
            {
                "file": r.get("file_name"),
                "query": r.get("query"),
                "analysis": r.get("analysis"),
                "timestamp": r.get("timestamp")
            } for r in records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History fetch error: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
