from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from typing import List

from database import engine, Base, get_db
from models import Worker, Workstation, Event
from schemas import EventCreate
from metrics import get_factory_metrics, get_worker_metrics, get_workstation_metrics

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Factory AI Dashboard API")

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SEEDING LOGIC ---
def seed_data(db: Session):
    if db.query(Worker).first(): 
        return False
    
    workers = [
        Worker(id="W1", name="John Smith"),
        Worker(id="W2", name="Sarah Johnson"),
        Worker(id="W3", name="Mike Brown"),
        Worker(id="W4", name="Emily Davis"),
        Worker(id="W5", name="Chris Wilson"),
        Worker(id="W6", name="Amanda Lee")
    ]
    
    stations = [
        Workstation(id="S1", name="Assembly Line A"),
        Workstation(id="S2", name="Assembly Line B"),
        Workstation(id="S3", name="Quality Control"),
        Workstation(id="S4", name="Packaging Unit 1"),
        Workstation(id="S5", name="Packaging Unit 2"),
        Workstation(id="S6", name="Shipping Dock")
    ]
    
    db.add_all(workers + stations)
    db.commit()
    return True

@app.on_event("startup")
def startup():
    db = next(get_db())
    seeded = seed_data(db)
    if seeded:
        print("✅ Database seeded with metadata.")

# ==================== API ROUTES ====================

@app.get("/")
def root():
    return {"message": "Factory AI Dashboard API", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- SEED ENDPOINT ---
@app.post("/api/seed")
def seed_endpoint(db: Session = Depends(get_db)):
    """Manually trigger database seeding"""
    seeded = seed_data(db)
    if seeded:
        return {"status": "seeded", "message": "Database has been seeded with workers and workstations"}
    return {"status": "already_seeded", "message": "Database already contains data"}

# --- METADATA ---
@app.get("/api/workers")
def get_workers(db: Session = Depends(get_db)):
    return db.query(Worker).all()

@app.get("/api/workstations")
def get_workstations(db: Session = Depends(get_db)):
    return db.query(Workstation).all()

# --- EVENTS ---
@app.post("/api/events")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return {"status": "received", "event_id": db_event.id}

@app.post("/api/events/bulk")
def create_bulk_events(events: List[EventCreate], db: Session = Depends(get_db)):
    db_events = [Event(**e.dict()) for e in events]
    db.add_all(db_events)
    db.commit()
    return {"status": "received", "count": len(db_events)}

@app.post("/api/events/generate")
def generate_random_events(days: int = 1, db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    stations = db.query(Workstation).all()
    
    if not workers or not stations:
        raise HTTPException(status_code=400, detail="Seed data missing")
    
    now = datetime.now()
    start_time = now - timedelta(days=days, hours=8)
    new_events = []
    
    num_events = 500 * days
    
    for i in range(num_events):
        rand_seconds = random.randint(0, int((now - start_time).total_seconds()))
        ts = start_time + timedelta(seconds=rand_seconds)
        
        w = random.choice(workers)
        s = random.choice(stations)
        
        r = random.random()
        if r < 0.65: etype = "working"
        elif r < 0.85: etype = "idle"
        elif r < 0.95: etype = "product_count"
        else: etype = "absent"
        
        count = random.randint(1, 10) if etype == "product_count" else 0
        
        new_events.append(Event(
            timestamp=ts, 
            worker_id=w.id, 
            workstation_id=s.id,
            event_type=etype, 
            confidence=round(random.uniform(0.85, 0.99), 2), 
            count=count
        ))
        
    db.add_all(new_events)
    db.commit()
    return {"status": "generated", "count": len(new_events)}

# Alias for frontend compatibility
@app.post("/api/events/generate-random")
def generate_random_events_alias(days: int = 1, db: Session = Depends(get_db)):
    """Alias for /api/events/generate for frontend compatibility"""
    return generate_random_events(days=days, db=db)

@app.post("/api/events/reset")
def reset_events(db: Session = Depends(get_db)):
    db.query(Event).delete()
    db.commit()
    return {"status": "events cleared"}

# --- METRICS (using metrics.py functions) ---
@app.get("/api/metrics/factory")
def get_factory_metrics_endpoint(db: Session = Depends(get_db)):
    """Get factory-wide metrics using metrics.py functions"""
    return get_factory_metrics(db)

@app.get("/api/metrics/workers")
def get_worker_metrics_endpoint(db: Session = Depends(get_db)):
    """Get worker metrics using metrics.py functions"""
    return get_worker_metrics(db)

@app.get("/api/metrics/workstations")
def get_station_metrics_endpoint(db: Session = Depends(get_db)):
    """Get workstation metrics using metrics.py functions"""
    return get_workstation_metrics(db)
