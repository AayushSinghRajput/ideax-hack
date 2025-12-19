# app/main.py
from fastapi import FastAPI, UploadFile, File, Form
from typing import Optional
import uuid
import shutil
from app.agent import process_step

app = FastAPI()

@app.post("/start")
def start_session():
    return {"session_id": str(uuid.uuid4())}

@app.get("/next")
def get_next_question(session_id: str):
    return process_step(session_id)

@app.post("/next")
def submit_answer(
    session_id: str = Form(...),
    audio: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    if not audio and not text:
        return {"error": "Provide either audio or text"}

    audio_path = None
    if audio:
        audio_path = f"data/uploads/{audio.filename}"
        with open(audio_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)

    return process_step(
        session_id=session_id,
        audio_path=audio_path,
        text_input=text
    )
