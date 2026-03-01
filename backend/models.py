from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base

class Worker(Base):
    __tablename__ = "workers"
    id = Column(String, primary_key=True, index=True) # e.g., "W1"
    name = Column(String)

class Workstation(Base):
    __tablename__ = "workstations"
    id = Column(String, primary_key=True, index=True) # e.g., "S1"
    name = Column(String)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime)
    worker_id = Column(String, index=True)
    workstation_id = Column(String, index=True)
    event_type = Column(String) # working, idle, absent, product_count
    confidence = Column(Float)
    count = Column(Integer, default=1) # For product_count