
# app/main.py (FIXED CORS)
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
import uuid
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Configure CORS properly - ALLOW EXPO DEVELOPMENT SERVER
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"                          # Allow all for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Create uploads directory if it doesn't exist
os.makedirs("data/uploads", exist_ok=True)

@app.get("/")
def root():
    return {"message": "FastAPI backend is running", "status": "ok", "cors": "enabled"}

@app.post("/start")
def start_session():
    return {"session_id": str(uuid.uuid4())}

@app.get("/next")
def get_next_question(session_id: str = "1"):
    try:
        # Import here to avoid circular imports
        from app.agent import process_step
        return process_step(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/next")
def submit_answer(
    session_id: str = Form(...),
    audio: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    try:
        # Import here to avoid circular imports
        from app.agent import process_step
        
        if not audio and not text:
            return {"error": "Provide either audio or text"}

        audio_path = None
        if audio:
            # Generate unique filename
            filename = f"{uuid.uuid4()}_{audio.filename}"
            audio_path = f"data/uploads/{filename}"
            with open(audio_path, "wb") as f:
                shutil.copyfileobj(audio.file, f)

        result = process_step(
            session_id=session_id,
            audio_path=audio_path,
            text_input=text
        )
        
        # Clean up audio file if it exists
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except:
                pass
                
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)