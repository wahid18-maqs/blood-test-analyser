import os
import re
from typing import Type
from dotenv import load_dotenv
from crewai_tools import SerperDevTool
from pydantic import BaseModel, Field
from langchain_community.document_loaders import PyPDFLoader
from crewai.tools import BaseTool

load_dotenv()

search_tool = SerperDevTool()

# 1. Blood Test Report Reading Tool
class BloodTestReportInput(BaseModel):
    path: str = Field(default='data/sample.pdf', description="Path to the PDF blood test report")

class BloodTestReportTool(BaseTool):
    name: str = "read_blood_test_report"
    description: str = "Reads and extracts data from a blood test report PDF file"
    args_schema: Type[BaseModel] = BloodTestReportInput

    def _run(self, path: str = 'data/sample.pdf') -> str:
        try:
            if not os.path.exists(path):
                return "Please upload a blood test report PDF file."

            if not path.lower().endswith('.pdf'):
                return "Invalid file type. Please upload a PDF."

            loader = PyPDFLoader(file_path=path)
            docs = loader.load()

            full_report = ""
            for doc in docs:
                content = doc.page_content
                content = re.sub(r'\n{2,}', '\n', content)
                content = re.sub(r' {2,}', ' ', content)
                full_report += content.strip() + "\n"

            if not full_report.strip():
                return "The uploaded PDF appears empty or unreadable."

            return full_report.strip()

        except Exception:
            return "Failed to read the blood test report. Make sure it is a valid PDF file."


#  2. Nutrition Recommendation Tool
class NutritionAnalysisInput(BaseModel):
    blood_report_data: str = Field(description="Blood report data to analyze")

class NutritionTool(BaseTool):
    name: str = "analyze_nutrition"
    description: str = "Analyzes blood test data and recommends nutrition"
    args_schema: Type[BaseModel] = NutritionAnalysisInput

    def _run(self, blood_report_data: str) -> str:
        if not blood_report_data or "please upload" in blood_report_data.lower():
            return "Upload your blood test report to get personalized nutrition advice."

        suggestions = []
        text = blood_report_data.lower()

        if 'hemoglobin' in text or 'hb' in text:
            suggestions.append("• Monitor iron intake with foods like spinach, meats, and lentils.")
        if 'cholesterol' in text:
            suggestions.append("• Choose heart-healthy fats like olive oil, and reduce saturated fats.")
        if 'glucose' in text or 'sugar' in text:
            suggestions.append("• Control sugar intake. Prefer complex carbs over simple sugars.")
        if 'vitamin' in text:
            suggestions.append("• Consider multivitamins or food-based vitamin sources.")

        if not suggestions:
            suggestions.append("• Maintain a balanced diet with fruits, vegetables, and whole grains.")

        disclaimer = "\n\nDISCLAIMER: This is educational content. Consult a registered dietitian for personalized advice."
        return "NUTRITION RECOMMENDATIONS:\n" + "\n".join(suggestions) + disclaimer


#  3. Exercise Plan Tool
class ExercisePlanInput(BaseModel):
    blood_report_data: str = Field(description="Blood report data to analyze")

class ExerciseTool(BaseTool):
    name: str = "create_exercise_plan"
    description: str = "Creates exercise recommendations based on blood report"
    args_schema: Type[BaseModel] = ExercisePlanInput

    def _run(self, blood_report_data: str) -> str:
        if not blood_report_data or "please upload" in blood_report_data.lower():
            return "Upload your blood test report to get exercise recommendations."

        plan = []
        text = blood_report_data.lower()

        if 'cholesterol' in text or 'lipid' in text:
            plan.append("• Do 150 mins/week of moderate cardio (e.g., brisk walking, cycling).")
        if 'glucose' in text or 'diabetes' in text:
            plan.append("• Add strength training twice a week to improve insulin response.")
        if 'blood pressure' in text or 'hypertension' in text:
            plan.append("• Engage in low-impact activities like swimming or walking.")

        plan.extend([
            "• Start slow and gradually increase intensity.",
            "• Alternate cardio and strength days.",
            "• Stay hydrated and listen to your body."
        ])

        disclaimer = "\n\nDISCLAIMER: Consult a healthcare provider before starting new exercises."
        return "EXERCISE PLAN:\n" + "\n".join(plan) + disclaimer


blood_test_tool = BloodTestReportTool()
nutrition_tool = NutritionTool()
exercise_tool = ExerciseTool()
