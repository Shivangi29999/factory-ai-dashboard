"""
Metrics calculation module for Factory AI Dashboard
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from models import Event, Worker, Workstation

def get_factory_metrics(db: Session):
    """Calculate factory-wide metrics"""
    now = datetime.now()
    last_8_hours = now - timedelta(hours=8)
    
    # Get events from last 8 hours
    recent_events = db.query(Event).filter(Event.timestamp >= last_8_hours).all()
    
    if not recent_events:
        return {
            "total_workers": db.query(Worker).count(),
            "total_stations": db.query(Workstation).count(),
            "total_events": 0,
            "active_workers": 0,
            "average_confidence": 0.0,
            "working_percentage": 0.0,
            "idle_percentage": 0.0,
            "absent_percentage": 0.0,
            "product_count_total": 0
        }
    
    # Calculate metrics
    total_events = len(recent_events)
    active_workers = len(set(e.worker_id for e in recent_events))
    avg_confidence = sum(e.confidence for e in recent_events) / total_events if total_events > 0 else 0.0
    
    working_count = len([e for e in recent_events if e.event_type == "working"])
    idle_count = len([e for e in recent_events if e.event_type == "idle"])
    absent_count = len([e for e in recent_events if e.event_type == "absent"])
    product_count = len([e for e in recent_events if e.event_type == "product_count"])
    
    working_pct = (working_count / total_events * 100) if total_events > 0 else 0.0
    idle_pct = (idle_count / total_events * 100) if total_events > 0 else 0.0
    absent_pct = (absent_count / total_events * 100) if total_events > 0 else 0.0
    
    total_products = sum(e.count for e in recent_events if e.event_type == "product_count")
    
    return {
        "total_workers": db.query(Worker).count(),
        "total_stations": db.query(Workstation).count(),
        "total_events": total_events,
        "active_workers": active_workers,
        "average_confidence": float(round(avg_confidence, 2)),
        "working_percentage": float(round(working_pct, 2)),
        "idle_percentage": float(round(idle_pct, 2)),
        "absent_percentage": float(round(absent_pct, 2)),
        "product_count_total": total_products
    }

def get_worker_metrics(db: Session):
    """Get metrics for each worker"""
    now = datetime.now()
    last_8_hours = now - timedelta(hours=8)
    
    workers = db.query(Worker).all()
    metrics = []
    
    for worker in workers:
        worker_events = db.query(Event).filter(
            Event.worker_id == worker.id,
            Event.timestamp >= last_8_hours
        ).all()
        
        if not worker_events:
            metrics.append({
                "id": worker.id,
                "name": worker.name,
                "total_events": 0,
                "working_count": 0,
                "idle_count": 0,
                "absent_count": 0,
                "average_confidence": 0.0,
                "status": "no_data"
            })
            continue
        
        total = len(worker_events)
        working = len([e for e in worker_events if e.event_type == "working"])
        idle = len([e for e in worker_events if e.event_type == "idle"])
        absent = len([e for e in worker_events if e.event_type == "absent"])
        avg_conf = sum(e.confidence for e in worker_events) / total if total > 0 else 0.0
        
        # Determine status based on most recent event
        last_event = max(worker_events, key=lambda e: e.timestamp)
        status = last_event.event_type
        
        metrics.append({
            "id": worker.id,
            "name": worker.name,
            "total_events": total,
            "working_count": working,
            "idle_count": idle,
            "absent_count": absent,
            "average_confidence": float(round(avg_conf, 2)),
            "status": status
        })
    
    return metrics

def get_workstation_metrics(db: Session):
    """Get metrics for each workstation"""
    now = datetime.now()
    last_8_hours = now - timedelta(hours=8)
    
    stations = db.query(Workstation).all()
    metrics = []
    
    for station in stations:
        station_events = db.query(Event).filter(
            Event.workstation_id == station.id,
            Event.timestamp >= last_8_hours
        ).all()
        
        if not station_events:
            metrics.append({
                "id": station.id,
                "name": station.name,
                "total_events": 0,
                "workers_count": 0,
                "average_confidence": 0.0,
                "product_count": 0
            })
            continue
        
        total = len(station_events)
        workers_count = len(set(e.worker_id for e in station_events))
        avg_conf = sum(e.confidence for e in station_events) / total if total > 0 else 0.0
        product_count = sum(e.count for e in station_events if e.event_type == "product_count")
        
        metrics.append({
            "id": station.id,
            "name": station.name,
            "total_events": total,
            "workers_count": workers_count,
            "average_confidence": float(round(avg_conf, 2)),
            "product_count": product_count
        })
    
    return metrics
