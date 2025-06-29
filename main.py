from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import os
import logging
import uuid
import asyncio

from crewai import Crew, Process
from agents import doctor,verifier, nutritionist, exercise_specialist
from task import help_patients,nutrition_analysis, exercise_planning, verification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Blood Test Report Analyser")

# Directory to store uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit
ALLOWED_EXTENSIONS = ['.pdf']
UPLOAD_DIR = "data"

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    # Check file extension
    if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed")
    
    return True

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal attacks"""
    import re
    # Remove path components and keep only the filename
    filename = os.path.basename(filename)
    # Remove potentially dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    return filename

def run_crew(query: str, file_path: str) -> dict:
    """To run the whole crew"""
    try:
        medical_crew = Crew(
            agents=[doctor, verifier, nutritionist, exercise_specialist],
            tasks=[help_patients, nutrition_analysis, exercise_planning, verification],
            process=Process.sequential,
            verbose=True,
            memory=True,
        )
        result = medical_crew.kickoff({'query': query,'file_path': file_path })
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
    """Health check endpoint"""
    return {"message": "Blood Test Report Analyser API is running",
            "version": "1.0.0",
            "status": "Healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
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
    file: UploadFile = File(..., description="Blood test report PDF file"),
    query: str = Form(default="Please provide a comprehensive analysis of my blood test report", description="Specific question about the blood test")
):
    """
    Analyze blood test report and provide comprehensive health recommendations
    
    Returns:
    - Medical analysis of blood test results
    - Nutritional recommendations based on results
    - Exercise recommendations considering health status
    - Document verification status
    """
    
    file_path = None
    
    try:
        # Validate input
        validate_file(file)
        
        # Validate and sanitize query
        if not query or not query.strip():
            query = "Please provide a comprehensive analysis of my blood test report"
        query = query.strip()
        
        # Generate secure filename
        file_id = str(uuid.uuid4())
        original_filename = sanitize_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, f"blood_test_report_{file_id}_{original_filename}")
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save uploaded file securely
        try:
            with open(file_path, "wb") as f:
                content = await file.read()
                if len(content) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="File size too large")
                f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")
        
        # Log analysis start
        logger.info(f"Starting analysis for file: {original_filename}, query: {query[:100]}...")
        
        # Process the blood report with all specialists
        crew_result = await asyncio.to_thread(run_crew, query=query, file_path=file_path)
        
        if not crew_result['success']:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {crew_result['error']}")
        
        # Prepare response
        response = {
            "status": "success",
            "query": query,
            "file_processed": original_filename,
            "analysis": crew_result['result'],
            "analysis_type": crew_result['analysis_type'],
            "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for medical decisions."
        }
        
        logger.info(f"Analysis completed successfully for file: {original_filename}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze_blood_report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    finally:
        # Clean up uploaded file
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
    """Simplified analysis endpoint with just medical interpretation"""
    
    file_path = None
    
    try:
        validate_file(file)
        
        # Generate secure filename
        file_id = str(uuid.uuid4())
        original_filename = sanitize_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, f"simple_analysis_{file_id}_{original_filename}")
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Simple crew with just doctor and verifier
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
        
        return {
            "status": "success",
            "query": query,
            "file_processed": original_filename,
            "analysis": str(result),
            "analysis_type": "simple",
            "disclaimer": "This analysis is for informational purposes only. Consult healthcare providers for medical advice."
        }
        
    except Exception as e:
        logger.error(f"Error in simple analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    finally:
        # Clean up
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)