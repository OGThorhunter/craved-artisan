from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import uuid
import asyncio
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Receipt OCR Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TextParseRequest(BaseModel):
    text: str

class ReceiptLine(BaseModel):
    name: str
    qty: float
    unit: str
    unit_price: Optional[float] = None
    line_total: Optional[float] = None
    supplier: Optional[str] = None
    batch: Optional[str] = None
    expiry: Optional[str] = None

class ReceiptHeader(BaseModel):
    vendor: Optional[str] = None
    date: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None

class ParsedReceipt(BaseModel):
    header: ReceiptHeader
    lines: List[ReceiptLine]

class ParseResponse(BaseModel):
    jobId: str
    status: str
    parsed_json: Optional[ParsedReceipt] = None
    error: Optional[str] = None

# In-memory storage for demo (in production, use Redis or database)
parse_jobs = {}

def normalize_unit(unit: str) -> str:
    """Normalize units to ISO-like standards"""
    unit_map = {
        'lb': 'kg', 'lbs': 'kg', 'pound': 'kg', 'pounds': 'kg',
        'oz': 'g', 'ounce': 'g', 'ounces': 'g',
        'gal': 'L', 'gallon': 'L', 'gallons': 'L',
        'qt': 'L', 'quart': 'L', 'quarts': 'L',
        'pt': 'ml', 'pint': 'ml', 'pints': 'ml',
        'fl oz': 'ml', 'fluid ounce': 'ml', 'fluid ounces': 'ml',
        'piece': 'ea', 'pieces': 'ea', 'each': 'ea', 'item': 'ea', 'items': 'ea',
        'box': 'box', 'boxes': 'box', 'case': 'case', 'cases': 'case',
        'bag': 'bag', 'bags': 'bag', 'bottle': 'bottle', 'bottles': 'bottle',
        'can': 'can', 'cans': 'can', 'jar': 'jar', 'jars': 'jar'
    }
    return unit_map.get(unit.lower(), unit.lower())

def extract_receipt_data(text: str) -> ParsedReceipt:
    """Extract structured data from receipt text using simple parsing"""
    lines = text.strip().split('\n')
    
    header = ReceiptHeader()
    receipt_lines = []
    
    # Simple parsing logic (in production, use more sophisticated NLP)
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for vendor name (usually first line or contains "STORE", "MARKET", etc.)
        if not header.vendor and any(keyword in line.upper() for keyword in ['STORE', 'MARKET', 'SHOP', 'CO.', 'INC.', 'LLC']):
            header.vendor = line
            
        # Look for date patterns
        if not header.date and any(char.isdigit() for char in line) and ('/' in line or '-' in line or ' ' in line):
            header.date = line
            
        # Look for totals
        if 'TOTAL' in line.upper() or 'AMOUNT' in line.upper():
            # Extract number from total line
            import re
            numbers = re.findall(r'\d+\.?\d*', line)
            if numbers:
                header.total = float(numbers[-1])
                
        # Look for tax
        if 'TAX' in line.upper():
            import re
            numbers = re.findall(r'\d+\.?\d*', line)
            if numbers:
                header.tax = float(numbers[-1])
                
        # Look for subtotal
        if 'SUBTOTAL' in line.upper():
            import re
            numbers = re.findall(r'\d+\.?\d*', line)
            if numbers:
                header.subtotal = float(numbers[-1])
    
    # Parse item lines (lines with quantities and prices)
    for line in lines:
        line = line.strip()
        if not line or any(keyword in line.upper() for keyword in ['TOTAL', 'TAX', 'SUBTOTAL', 'STORE', 'DATE', 'RECEIPT']):
            continue
            
        # Look for patterns like "2 x Item Name $10.00" or "Item Name 2 $10.00"
        import re
        
        # Pattern 1: "qty x name $price"
        match1 = re.match(r'(\d+(?:\.\d+)?)\s*x\s*(.+?)\s*\$?(\d+(?:\.\d+)?)', line)
        if match1:
            qty, name, price = match1.groups()
            receipt_lines.append(ReceiptLine(
                name=name.strip(),
                qty=float(qty),
                unit='ea',
                unit_price=float(price),
                line_total=float(qty) * float(price)
            ))
            continue
            
        # Pattern 2: "name qty $price"
        match2 = re.match(r'(.+?)\s+(\d+(?:\.\d+)?)\s*\$?(\d+(?:\.\d+)?)', line)
        if match2:
            name, qty, price = match2.groups()
            receipt_lines.append(ReceiptLine(
                name=name.strip(),
                qty=float(qty),
                unit='ea',
                unit_price=float(price),
                line_total=float(qty) * float(price)
            ))
            continue
            
        # Pattern 3: "name $price" (assume qty=1)
        match3 = re.match(r'(.+?)\s*\$?(\d+(?:\.\d+)?)', line)
        if match3 and len(receipt_lines) < 20:  # Limit to avoid parsing headers/footers
            name, price = match3.groups()
            receipt_lines.append(ReceiptLine(
                name=name.strip(),
                qty=1.0,
                unit='ea',
                unit_price=float(price),
                line_total=float(price)
            ))
    
    return ParsedReceipt(header=header, lines=receipt_lines)

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "receipt-ocr", "timestamp": datetime.utcnow().isoformat()}

@app.post("/parse", response_model=ParseResponse)
async def parse_receipt(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """Parse receipt from uploaded file or text input"""
    try:
        job_id = str(uuid.uuid4())
        
        if file:
            # Handle file upload
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
                
            # Read file content
            content = await file.read()
            
            # For demo purposes, we'll simulate OCR by extracting text from filename
            # In production, use PaddleOCR here
            logger.info(f"Processing file: {file.filename}")
            
            # Simulate OCR result (replace with actual PaddleOCR)
            simulated_text = f"""
            {file.filename.replace('.', ' ').upper()} STORE
            Date: {datetime.now().strftime('%m/%d/%Y')}
            
            Item 1    2    $5.99
            Item 2    1    $3.50
            Item 3    3    $2.25
            
            Subtotal: $20.22
            Tax: $1.62
            Total: $21.84
            """
            
            parsed_receipt = extract_receipt_data(simulated_text)
            
        elif text:
            # Handle text input
            parsed_receipt = extract_receipt_data(text)
            
        else:
            raise HTTPException(status_code=400, detail="Either file or text must be provided")
        
        # Store the job result
        parse_jobs[job_id] = {
            "status": "DONE",
            "parsed_json": parsed_receipt.dict(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return ParseResponse(
            jobId=job_id,
            status="DONE",
            parsed_json=parsed_receipt
        )
        
    except Exception as e:
        logger.error(f"Error parsing receipt: {str(e)}")
        job_id = str(uuid.uuid4())
        parse_jobs[job_id] = {
            "status": "FAILED",
            "error": str(e),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return ParseResponse(
            jobId=job_id,
            status="FAILED",
            error=str(e)
        )

@app.get("/parse/{job_id}")
async def get_parse_status(job_id: str):
    """Get the status and result of a parse job"""
    if job_id not in parse_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = parse_jobs[job_id]
    return {
        "jobId": job_id,
        "status": job["status"],
        "parsed_json": job.get("parsed_json"),
        "error": job.get("error"),
        "created_at": job["created_at"]
    }

@app.post("/parse-text", response_model=ParseResponse)
async def parse_text(request: TextParseRequest):
    """Parse receipt from text input (JSON endpoint)"""
    try:
        job_id = str(uuid.uuid4())
        parsed_receipt = extract_receipt_data(request.text)
        
        # Store the job result
        parse_jobs[job_id] = {
            "status": "DONE",
            "parsed_json": parsed_receipt.dict(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return ParseResponse(
            jobId=job_id,
            status="DONE",
            parsed_json=parsed_receipt
        )
        
    except Exception as e:
        logger.error(f"Error parsing text: {str(e)}")
        job_id = str(uuid.uuid4())
        parse_jobs[job_id] = {
            "status": "FAILED",
            "error": str(e),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return ParseResponse(
            jobId=job_id,
            status="FAILED",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9001)
