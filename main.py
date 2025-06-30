from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import os
import logging
import uuid
import asyncio
import redis.asyncio as aioredis
import hashlib
import json
from crewai import Crew, Process
from database import init_db
from database import get_session
from models import AnalysisResult
from agents import doctor, verifier, nutritionist, exercise_specialist
from task import help_patients, nutrition_analysis, exercise_planning, verification
import re

init_db()

# Redis Async Client
cache = aioredis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Blood Test Report Analyser")

# Directory to store uploaded files
UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit
ALLOWED_EXTENSIONS = ['.pdf']

def generate_cache_key(query: str, file_bytes: bytes) -> str:
    hash_digest = hashlib.md5(file_bytes).hexdigest()
    normalized_query = query.strip().lower()[:200]
    return f"{hash_digest}:{normalized_query}"

def validate_file(file: UploadFile) -> bool:
    if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed")
    return True

def run_crew(query: str, file_path: str) -> dict:
    try:
        medical_crew = Crew(
            agents=[doctor, verifier, nutritionist, exercise_specialist],
            tasks=[help_patients, nutrition_analysis, exercise_planning, verification],
            process=Process.sequential,
            verbose=True,
            memory=True,
        )
        result = medical_crew.kickoff({'query': query, 'file_path': file_path})
        return {
            'status': True,
            'result': str(result),
            'analysis_type': 'comprehensive',
        }
    except Exception as e:
        logger.error(f"Error running crew: {str(e)}")
        return {
            'status': False,
            'error': str(e),
            'analysis_type': 'failed',
        }

@app.get("/")
async def root():
    return {
        "message": "Blood Test Report Analyser API is running",
        "version": "1.0.0",
        "status": "Healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "ai_agents": "ready",
            "file_processing": "ready"
        }
    }

@app.post("/analyze")
async def analyze_blood_report(
    file: UploadFile = File(...),
    query: str = Form(default="Please provide a comprehensive analysis of my blood test report")
):
    file_path = None
    try:
        validate_file(file)

        if not query or not query.strip():
            query = "Please provide a comprehensive analysis of my blood test report"
        query = query.strip()

        file_id = str(uuid.uuid4())
        original_filename = os.path.basename(file.filename)
        original_filename = re.sub(r'[^\w\-_\.]', '_', original_filename)
        file_path = os.path.join(UPLOAD_DIR, f"blood_test_report_{file_id}_{original_filename}")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size too large")

        cache_key = generate_cache_key(query, content)
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for query: {query[:100]}")
            return json.loads(cached)

        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"Starting analysis for file: {original_filename}")
        crew_result = await asyncio.to_thread(run_crew, query=query, file_path=file_path)

        if not crew_result['status']:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {crew_result['error']}")

        with get_session() as session:
            analysis_result = AnalysisResult(
                file_name=original_filename,
                query=query,
                analysis=crew_result['result'],
                analysis_type=crew_result['analysis_type']
            )
            session.add(analysis_result)
            session.commit()

        response = {
            "status": "success",
            "query": query,
            "file_processed": original_filename,
            "analysis": crew_result['result'],
            "analysis_type": crew_result['analysis_type'],
            "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for medical decisions."
        }

        await cache.set(cache_key, json.dumps(response), ex=3600)  # 1 hour
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up file {file_path}: {str(e)}")

@app.post("/analyze-simple")
async def analyze_simple(
    file: UploadFile = File(...),
    query: str = Form(default="Summarize my blood test report")
):
    file_path = None
    try:
        validate_file(file)

        file_id = str(uuid.uuid4())
        original_filename = os.path.basename(file.filename)
        original_filename = re.sub(r'[^\w\-_\.]', '_', original_filename)
        file_path = os.path.join(UPLOAD_DIR, f"simple_analysis_{file_id}_{original_filename}")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size too large")

        cache_key = generate_cache_key(query, content)
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for simple analysis: {query[:100]}")
            return json.loads(cached)

        with open(file_path, "wb") as f:
            f.write(content)

        simple_crew = Crew(
            agents=[doctor, verifier],
            tasks=[verification, help_patients],
            process=Process.sequential,
            verbose=True
        )

        result = await asyncio.to_thread(simple_crew.kickoff, {
            'query': query.strip() if query else "Summarize my blood test report",
            'file_path': file_path
        })

        with get_session() as session:
            analysis_result = AnalysisResult(
                file_name=original_filename,
                query=query,
                analysis=str(result),
                analysis_type="simple"
            )
            session.add(analysis_result)
            session.commit()

        response = {
            "status": "success",
            "query": query,
            "file_processed": original_filename,
            "analysis": str(result),
            "analysis_type": "simple",
            "disclaimer": "This analysis is for informational purposes only. Consult healthcare providers for medical advice."
        }

        await cache.set(cache_key, json.dumps(response), ex=3600)
        return response

    except Exception as e:
        logger.error(f"Error in simple analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Cleanup failed: {str(e)}")

@app.get("/history", response_model=list[AnalysisResult])
def get_analysis_history():
    with get_session() as session:
        results = session.query(AnalysisResult).order_by(AnalysisResult.timestamp.desc()).all()
        return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
