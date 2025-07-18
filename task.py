## Importing libraries and files
from crewai import Task
from agents import doctor, verifier
from tools import search_tool, blood_test_tool

## Creating a task to help solve user's query
help_patients = Task(
    description="Interpret a user's health-related query based on their blood test report.\n\
Use the uploaded blood test document to identify any anomalies and respond with thoughtful medical insights.\n\
If the report lacks sufficient data, offer general guidance based on best practices or recent research.",

    expected_output="""Your response should include:
- A brief summary of key findings from the blood report
- Interpretation of any unusual markers or results
- Personalized health suggestions or medical advice
- Additional resources or references (real or sample links for demo)""",

    agent=doctor,
    tools=[blood_test_tool, search_tool],
    async_execution=False,
)

## Creating a nutrition analysis task
nutrition_analysis = Task(
    description="Evaluate the patient's blood test report to determine dietary adjustments.\n\
Focus on markers like glucose, lipids, vitamin levels, and iron to suggest nutrition strategies.\n\
Address any deficiencies or risks using evidence-based diet planning.",

    expected_output="""Include the following in the response:
- Nutritional deficiencies or imbalances detected
- Recommended foods or dietary changes to address those
- Suggested supplements if necessary
- Example meals or food groups
- Links to reputable sources (real or educational placeholders)""",

    agent=doctor,
    tools=[blood_test_tool],
    async_execution=False,
)

## Creating an exercise planning task
exercise_planning = Task(
    description="Design an exercise routine tailored to the patient's health status as reflected in the blood report.\n\
Consider cardiovascular health, inflammation markers, or overall fitness when creating the plan.",

    expected_output="""Your response should cover:
- Appropriate exercise types (e.g., cardio, strength, flexibility)
- Frequency and intensity recommendations
- Safety notes or health conditions to consider
- Progress tracking suggestions
- References to exercise guidelines or research (real or placeholder)""",

    agent=doctor,
    tools=[blood_test_tool],
    async_execution=False,
)

## Creating a verification task
verification = Task(
    description="Verify whether the uploaded document is a valid blood test report.\n\
Attempt to parse test names, values, units, and reference ranges.\n\
If the document is invalid or lacks required data, report it clearly.",

    expected_output="""Provide:
- Validation status (Valid/Invalid)
- Extracted medical values and units (if any)
- Format issues or errors found
- Confidence score or notes on reliability""",

    agent=verifier,
    tools=[blood_test_tool],
    async_execution=False
)