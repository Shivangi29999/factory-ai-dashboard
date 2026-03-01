from pydantic import BaseModel
from datetime import datetime

class EventCreate(BaseModel):
    timestamp: datetime
    worker_id: str
    workstation_id: str
    event_type: str
    confidence: float
    count: int = 1

class WorkerBase(BaseModel):
    id: str
    name: str

class WorkstationBase(BaseModel):
    id: str
    name: str