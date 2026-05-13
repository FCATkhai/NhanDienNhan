from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
from typing import List
from model import extract_text_from_image, extract_product_info

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5527",
        "http://127.0.0.1:5527",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/invoke")
async def invoke_agent(files: List[UploadFile] = File(...)):
    """
    Process multiple images for a single product:
    1. Accept multiple image files
    2. Extract text from each image using OCR
    3. Combine extracted texts
    4. Call LLM to extract structured product information
    5. Return product info as JSON
    """
    print(f"Received {len(files)} files for processing.")
    # Validate at least one file is provided
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="At least one image file is required")
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    
    temp_dir = None
    temp_files = []
    
    try:
        # Create temporary directory for storing uploaded files
        temp_dir = tempfile.mkdtemp()
        
        # Validate and save uploaded files
        for file in files:
            # Ensure filename is a str for splitext
            filename = file.filename or ""
            if not filename:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file missing filename"
                )
            # Validate file extension
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type: {filename}. Allowed: jpg, jpeg, png, webp"
                )
            
            # Save file to temp directory
            temp_path = os.path.join(temp_dir, filename)
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_files.append(temp_path)
        
        # Extract text from each image sequentially
        extracted_texts = []
        for temp_path in temp_files:
            try:
                texts = extract_text_from_image(temp_path)
                if texts:
                    extracted_texts.extend(texts)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"OCR extraction failed for {os.path.basename(temp_path)}: {str(e)}"
                )
        
        # Check if any text was extracted
        if not extracted_texts:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the provided images"
            )
        
        # Combine all extracted texts
        combined_text = " ".join(extracted_texts)
        
        # Call LLM to extract product information
        try:
            # print("Extracted Text:", combined_text[:500])  # Log first 500 chars of extracted text
            product_info = await extract_product_info(combined_text)
            return JSONResponse(content=product_info, status_code=200)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"LLM processing failed: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
    finally:
        # Clean up temporary files and directory
        if temp_dir and os.path.exists(temp_dir):
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                except Exception as e:
                    print(f"Warning: Could not delete temp file {temp_file}: {e}")
            try:
                os.rmdir(temp_dir)
            except Exception as e:
                print(f"Warning: Could not delete temp directory {temp_dir}: {e}")