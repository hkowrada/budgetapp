from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JSON file path for data storage
DATA_FILE = ROOT_DIR / 'expenses_data.json'

# Initialize data file if it doesn't exist
if not DATA_FILE.exists():
    initial_data = {
        "categories": ["Rent", "Electricity", "Groceries", "Transport", "Entertainment"],
        "expenses": []
    }
    with open(DATA_FILE, 'w') as f:
        json.dump(initial_data, f, indent=2)

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Expense(BaseModel):
    id: Optional[str] = None
    amount: float
    category: str
    date: str
    description: str
    member: str

class Category(BaseModel):
    name: str

class ExpensesData(BaseModel):
    categories: List[str]
    expenses: List[dict]


# Helper functions
def read_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)


# API Routes
@api_router.get("/data")
async def get_all_data():
    """Get all expenses and categories"""
    return read_data()

@api_router.post("/expenses")
async def add_expense(expense: Expense):
    """Add a new expense"""
    data = read_data()
    
    # Generate ID
    expense_dict = expense.model_dump()
    expense_dict['id'] = str(len(data['expenses']) + 1)
    
    data['expenses'].append(expense_dict)
    write_data(data)
    
    return {"message": "Expense added successfully", "expense": expense_dict}

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    """Delete an expense"""
    data = read_data()
    
    original_length = len(data['expenses'])
    data['expenses'] = [e for e in data['expenses'] if e['id'] != expense_id]
    
    if len(data['expenses']) == original_length:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    write_data(data)
    return {"message": "Expense deleted successfully"}

@api_router.post("/categories")
async def add_category(category: Category):
    """Add a new category"""
    data = read_data()
    
    if category.name in data['categories']:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    data['categories'].append(category.name)
    write_data(data)
    
    return {"message": "Category added successfully", "category": category.name}

@api_router.delete("/categories/{category_name}")
async def delete_category(category_name: str):
    """Delete a category"""
    data = read_data()
    
    if category_name not in data['categories']:
        raise HTTPException(status_code=404, detail="Category not found")
    
    data['categories'].remove(category_name)
    write_data(data)
    
    return {"message": "Category deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

# Serve static files
static_dir = ROOT_DIR / 'static'
static_dir.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
async def serve_index():
    """Serve the main HTML file"""
    index_file = static_dir / 'index.html'
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Expense Dashboard API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)