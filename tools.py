## Importing libraries and files
import os
from dotenv import load_dotenv
load_dotenv()

from crewai_tools import tools
from crewai_tools import SerperDevTool
from langchain.document_loaders import PyPDFLoader
from typing import Type
from pydantic import BaseModel, Field
import re
from crewai.tools import BaseTool

## Creating search tool
search_tool = SerperDevTool()

class BloodTestReportInput(BaseModel):
    """Input schema for BloodTestReportTool."""
    path: str = Field(default='data/sample.pdf', description="Path of the PDF file to read")

## Creating custom pdf reader tool
class BloodTestReportTool(BaseTool):
    name: str = "read_blood_test_report"
    description: str = "Tool to read and extract data from a blood test report PDF file"
    args_schema: Type[BaseModel] = BloodTestReportInput

    def _run(self, path: str = 'data/sample.pdf') -> str:
        """Tool to read data from a pdf file from a path

        Args:
            path (str, optional): Path of the pdf file. Defaults to 'data/sample.pdf'.

        Returns:
            str: Full Blood Test report file content or instruction to upload PDF
        """
        try:
            # Check if file exists
            if not os.path.exists(path):
                # Instead of showing error, return instruction to upload PDF
                return "Please upload a blood test report PDF file to get a detailed analysis of your results."
            
            if not path.lower().endswith('.pdf'):
                return "Please upload a valid PDF file containing your blood test report."

            # Load PDF using PyPDFLoader
            loader = PyPDFLoader(file_path=path)
            docs = loader.load()

            full_report = ""
            for doc in docs:
                # Clean and format the report data
                content = doc.page_content
                
                # More efficient whitespace cleaning using regex
                content = re.sub(r'\n{2,}', '\n', content)  # Replace multiple newlines with single
                content = re.sub(r' {2,}', ' ', content)    # Replace multiple spaces with single
                content = content.strip()
                
                full_report += content + "\n"
            
            if not full_report.strip():
                return "The uploaded PDF appears to be empty or unreadable. Please ensure you've uploaded a valid blood test report."
                
            return full_report.strip()
            
        except Exception as e:
            return f"Unable to read the PDF file. Please ensure you've uploaded a valid blood test report in PDF format."
        
class NutritionAnalysisInput(BaseModel):
    """Input schema for NutritionTool."""
    blood_report_data: str = Field(description="Blood report data to analyze for nutrition recommendations")

## Creating Nutrition Analysis Tool
class NutritionTool(BaseTool):
    name: str = "analyze_nutrition"
    description: str = "Analyze blood test results and provide evidence-based nutrition recommendations"
    args_schema: Type[BaseModel] = NutritionAnalysisInput

    def _run(self, blood_report_data: str) -> str:
        """Analyze blood report data and provide nutrition recommendations"""
        try:
            if not blood_report_data or not blood_report_data.strip():
                return "Please upload a blood test report to receive personalized nutrition recommendations."

            # Check if this is just an instruction message (no actual report data)
            if "please upload" in blood_report_data.lower():
                return "Upload your blood test report to get personalized nutrition advice based on your specific lab values and health markers."

            # Basic analysis logic (this would be expanded with real medical knowledge)
            analysis_results = []
            data_lower = blood_report_data.lower()
            
            # Example analysis patterns (simplified)
            if 'hemoglobin' in data_lower or 'hb' in data_lower:
                analysis_results.append("• Monitor iron levels - consider iron-rich foods like spinach, lean meats, and legumes")
            
            if 'cholesterol' in data_lower:
                analysis_results.append("• Consider heart-healthy diet with omega-3 fatty acids, fiber-rich foods, and reduced saturated fats")
            
            if 'glucose' in data_lower or 'sugar' in data_lower:
                analysis_results.append("• Monitor carbohydrate intake and consider complex carbohydrates over simple sugars")
            
            if 'vitamin' in data_lower:
                analysis_results.append("• Ensure adequate vitamin intake through balanced diet and consider consulting with healthcare provider about supplementation")

            if not analysis_results:
                analysis_results.append("• Maintain a balanced diet with variety of fruits, vegetables, whole grains, and lean proteins")
            
            # Add disclaimer
            disclaimer = "\n\nDISCLAIMER: This is for informational purposes only. Always consult with a qualified healthcare provider or registered dietitian for personalized medical and nutritional advice."
            
            return "NUTRITION RECOMMENDATIONS:\n" + "\n".join(analysis_results) + disclaimer
            
        except Exception as e:
            return "Unable to analyze nutrition data. Please ensure you've uploaded a valid blood test report."

class ExercisePlanInput(BaseModel):
    """Input schema for ExerciseTool."""
    blood_report_data: str = Field(description="Blood report data to analyze for exercise recommendations")

## Creating Exercise Planning Tool
class ExerciseTool(BaseTool):
    name: str = "create_exercise_plan"
    description: str = "Create safe, evidence-based exercise recommendations based on blood test results"
    args_schema: Type[BaseModel] = ExercisePlanInput

    def _run(self, blood_report_data: str) -> str:
        """Create exercise plan based on blood report data"""
        try:
            if not blood_report_data or not blood_report_data.strip():
                return "Please upload a blood test report to receive personalized exercise recommendations."

            # Check if this is just an instruction message (no actual report data)
            if "please upload" in blood_report_data.lower():
                return "Upload your blood test report to get personalized exercise recommendations based on your health markers and lab values."

            exercise_recommendations = []
            data_lower = blood_report_data.lower()
            
            # Basic exercise recommendations (simplified)
            if 'cholesterol' in data_lower or 'lipid' in data_lower:
                exercise_recommendations.append("• Cardiovascular exercise: 150 minutes moderate-intensity or 75 minutes vigorous-intensity per week")
            
            if 'glucose' in data_lower or 'diabetes' in data_lower:
                exercise_recommendations.append("• Regular aerobic exercise and resistance training to improve insulin sensitivity")
            
            if 'blood pressure' in data_lower or 'hypertension' in data_lower:
                exercise_recommendations.append("• Low to moderate intensity aerobic activities like walking, swimming, or cycling")
            
            # General recommendations
            exercise_recommendations.extend([
                "• Start slowly and gradually increase intensity",
                "• Include both aerobic and strength training exercises",
                "• Ensure adequate warm-up and cool-down periods",
                "• Stay hydrated and listen to your body"
            ])

            # Add important disclaimers
            disclaimer = "\n\nIMPORTANT DISCLAIMERS:\n• Always consult with your healthcare provider before starting any new exercise program\n• Stop exercising and seek medical attention if you experience chest pain, shortness of breath, or dizziness\n• These are general recommendations and may not be suitable for all individuals"
            
            return "EXERCISE RECOMMENDATIONS:\n" + "\n".join(exercise_recommendations) + disclaimer
            
        except Exception as e:
            return "Unable to create exercise plan. Please ensure you've uploaded a valid blood test report."

# Create tool instances for use in agents
blood_test_tool = BloodTestReportTool()
nutrition_tool = NutritionTool()
exercise_tool = ExerciseTool()