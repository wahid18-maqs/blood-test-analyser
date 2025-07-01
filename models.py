from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class AnalysisResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    file_name: str
    query: str
    analysis: str
    analysis_type: str
    timestamp: datetime = Field(default_factory=datetime)
    
