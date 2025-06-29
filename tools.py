## Importing libraries and files
import os
from dotenv import load_dotenv
load_dotenv()

from crewai_tools import tools
from crewai_tools.tools.serper_dev_tool import SerperDevTool
from crewai_tools import BaseTool
from langchain.document_loaders import PyPDFLoader
from typing import Type
from pydantic import BaseModel, Field
import re

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
            str: Full Blood Test report file content
        """
        try:
            # Validate file exists and is PDF
            if not os.path.exists(path):
                return f"Error: File not found at path: {path}"
            
            if not path.lower().endswith('.pdf'):
                return f"Error: File must be a PDF. Received: {path}"

            # Load PDF using PyPDFLoader (Fixed: Correct class name)
            loader = PyPDFLoader(file_path=path)
            docs = loader.load()

            full_report = ""
            for doc in docs:
                # Clean and format the report data
                content = doc.page_content
                
                # Fixed: More efficient whitespace cleaning using regex
                content = re.sub(r'\n{2,}', '\n', content)  # Replace multiple newlines with single
                content = re.sub(r' {2,}', ' ', content)    # Replace multiple spaces with single
                content = content.strip()
                
                full_report += content + "\n"
            
            if not full_report.strip():
                return "Warning: No readable content found in the PDF file"
                
            return full_report.strip()
            
        except Exception as e:
            return f"Error reading PDF file: {str(e)}"
        
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
                return "Error: No blood report data provided for nutrition analysis"

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
            return f"Error in nutrition analysis: {str(e)}"

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
                return "Error: No blood report data provided for exercise planning"

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
            return f"Error in exercise planning: {str(e)}"

# Create tool instances for use in agents
blood_test_tool = BloodTestReportTool()
nutrition_tool = NutritionTool()
exercise_tool = ExerciseTool()
