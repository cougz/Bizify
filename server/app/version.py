import os
import json
from pathlib import Path

VERSION_FILE = Path(__file__).parent.parent / "version.json"

def get_version():
    """Get the current application version"""
    if not os.path.exists(VERSION_FILE):
        # Default version if file doesn't exist
        return {"version": "0.1.0", "db_schema_version": 1}
    
    with open(VERSION_FILE, "r") as f:
        return json.load(f)

def update_version(version=None, db_schema_version=None):
    """Update the application version"""
    current = get_version()
    
    if version:
        current["version"] = version
    
    if db_schema_version:
        current["db_schema_version"] = db_schema_version
    
    with open(VERSION_FILE, "w") as f:
        json.dump(current, f, indent=2)
    
    return current
