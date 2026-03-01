#!/usr/bin/env python3
"""
Seed script for Factory AI Dashboard
Creates workers, workstations, and generates sample events
"""

import sqlite3
import random
from datetime import datetime, timedelta
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "factory.db"

def init_database():
    """Initialize the database with tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workstations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            worker_id TEXT NOT NULL,
            workstation_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            confidence REAL NOT NULL,
            count INTEGER DEFAULT 1,
            FOREIGN KEY (worker_id) REFERENCES workers (id),
            FOREIGN KEY (workstation_id) REFERENCES workstations (id)
        )
    """)
    
    # Create indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_worker ON events (worker_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_station ON events (workstation_id)")
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

def seed_workers_and_stations():
    """Seed workers and workstations"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM workers")
    if cursor.fetchone()[0] > 0:
        print("ℹ️ Workers and workstations already seeded")
        conn.close()
        return
    
    # Seed Workers
    workers = [
        ("W1", "John Smith"),
        ("W2", "Sarah Johnson"),
        ("W3", "Mike Brown"),
        ("W4", "Emily Davis"),
        ("W5", "Chris Wilson"),
        ("W6", "Amanda Lee")
    ]
    
    cursor.executemany("INSERT INTO workers (id, name) VALUES (?, ?)", workers)
    
    # Seed Workstations
    workstations = [
        ("S1", "Assembly Line A"),
        ("S2", "Assembly Line B"),
        ("S3", "Quality Control"),
        ("S4", "Packaging Unit 1"),
        ("S5", "Packaging Unit 2"),
        ("S6", "Shipping Dock")
    ]
    
    cursor.executemany("INSERT INTO workstations (id, name) VALUES (?, ?)", workstations)
    
    conn.commit()
    conn.close()
    print("✅ Seeded 6 workers and 6 workstations")

def generate_sample_events(num_events=500):
    """Generate sample AI events"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get workers and stations
    cursor.execute("SELECT id FROM workers")
    worker_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM workstations")
    station_ids = [row[0] for row in cursor.fetchall()]
    
    if not worker_ids or not station_ids:
        print("❌ Please run seed_workers_and_stations first")
        conn.close()
        return
    
    # Clear existing events
    cursor.execute("DELETE FROM events")
    
    # Generate events over the last 8 hours
    now = datetime.now()
    start_time = now - timedelta(hours=8)
    
    events = []
    event_types = ["working", "working", "working", "idle", "idle", "product_count", "product_count", "absent"]
    
    for i in range(num_events):
        # Random timestamp within the 8-hour window
        rand_seconds = random.randint(0, int((now - start_time).total_seconds()))
        timestamp = start_time + timedelta(seconds=rand_seconds)
        
        worker_id = random.choice(worker_ids)
        workstation_id = random.choice(station_ids)
        event_type = random.choice(event_types)
        confidence = round(random.uniform(0.85, 0.99), 2)
        count = random.randint(1, 10) if event_type == "product_count" else 1
        
        events.append((
            timestamp.isoformat(),
            worker_id,
            workstation_id,
            event_type,
            confidence,
            count
        ))
    
    cursor.executemany("""
        INSERT INTO events (timestamp, worker_id, workstation_id, event_type, confidence, count)
        VALUES (?, ?, ?, ?, ?, ?)
    """, events)
    
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM events")
    count = cursor.fetchone()[0]
    
    conn.close()
    print(f"✅ Generated {count} sample events")

def clear_events():
    """Clear all events (keep workers and stations)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events")
    conn.commit()
    conn.close()
    print("✅ Cleared all events")

def show_stats():
    """Show database statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM workers")
    workers_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM workstations")
    stations_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM events")
    events_count = cursor.fetchone()[0]
    
    print(f"\n📊 Database Stats:")
    print(f"   Workers: {workers_count}")
    print(f"   Workstations: {stations_count}")
    print(f"   Events: {events_count}")
    
    # Show event type distribution
    cursor.execute("""
        SELECT event_type, COUNT(*) 
        FROM events 
        GROUP BY event_type
    """)
    print("\n   Event Type Distribution:")
    for event_type, count in cursor.fetchall():
        print(f"      {event_type}: {count}")
    
    conn.close()

if __name__ == "__main__":
    import sys
    
    print("\n" + "="*50)
    print("🏭 Factory AI Dashboard - Seed Script")
    print("="*50 + "\n")
    
    # Initialize database
    init_database()
    
    # Seed workers and workstations
    seed_workers_and_stations()
    
    # Generate sample events
    generate_sample_events(500)
    
    # Show stats
    show_stats()
    
    print("\n✅ Seed complete! Run the application to see the dashboard.")
    print("\n📝 To regenerate data with different amount:")
    print("   python seed.py --events 1000")
    print("\n📝 To clear events only:")
    print("   python seed.py --clear")