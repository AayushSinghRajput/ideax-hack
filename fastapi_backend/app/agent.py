# app/agent.py
import json
from typing import Optional
from app.prompts import question_prompt, extract_prompt
from app.llm import groq
from app.whisper_stt import transcribe_audio
from app.utils import normalize_text_input
from typing import Optional
from app.utils import english_to_nepali

# FIELDS = [
#     {"key": "name", "description": "name of the person"},
#     {"key": "age", "description": "age of the person"},
#     {"key": "phone", "description": "phone number"},
#     {"key": "address", "description": "address"},
# ]

FIELDS = [
    {"key": "toolName", "description": "Name of the machine/tool"},
    {"key": "category", "description": "Category of the machine (Tractor, Tiller, Harvester)"},
    {"key": "rentalPricePerHour", "description": "Rental price per hour"},
    {"key": "availableFrom", "description": "Start date when the machine is available"},
    {"key": "availableTo", "description": "End date when the machine is available"},
    {"key": "location", "description": "Location where the machine is available"},
    {"key": "pickupOption", "description": "Pickup option (Delivery, Self-Pickup, Both)"},
    {"key": "rentalTerms", "description": "Rental terms and conditions"},
    {"key": "machineImage", "description": "URL of the machine image"},
    {"key": "cloudinaryId", "description": "Cloudinary public_id for image deletion"},
]



# In-memory session store
SESSIONS = {}

# def process_step(session_id: str, audio_path: Optional[str] = None):
def process_step(
    session_id: str,
    audio_path: Optional[str] = None,
    text_input: Optional[str] = None
):
    # -------------------------------
    # Initialize session
    # -------------------------------
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "index": 0,
            "data": {},
            "history": [],
            "last_question": None,
        }

    session = SESSIONS[session_id]

    # -------------------------------
    # All fields done
    # -------------------------------
    if session["index"] >= len(FIELDS):
        return {
            "done": True,
            "data": session["data"],
            
        }

    field = FIELDS[session["index"]]

    # -------------------------------
    # ASK MODE  ✅ (NO INPUT REQUIRED)
    # -------------------------------
    if audio_path is None and text_input is None:
        question = groq.invoke(
            question_prompt.format(
                field=field["description"],
                history=session["history"],
            )
        ).content.strip()

        session["last_question"] = question
        question = english_to_nepali(question)
        print("Asking:", question)
        return {
            "question": question,
            "field": field["key"],
        }

    # -------------------------------
    # ANSWER MODE  ✅ (INPUT REQUIRED)
    # -------------------------------
    if audio_path:
        user_input = transcribe_audio(audio_path)["text"]

    elif text_input:
        user_input = normalize_text_input(text_input)

    else:
        return {"error": "Provide either audio or text"}

    response = groq.invoke(
        extract_prompt.format(
            question=session["last_question"],
            field=field["description"],
            user_input=user_input,
        )
    ).content.strip()

    # Invalid → ask same question again
    if response == "0":
        return {
            "question": session["last_question"],
            "error": "Invalid input",
        }

    # Valid → extract value
    value = json.loads(response)["value"]

    session["data"][field["key"]] = value
    session["history"].append(value)
    session["index"] += 1
    session["last_question"] = None

    return {
        "success": True,
        "data": session["data"],
    }
