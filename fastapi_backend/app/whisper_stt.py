import os
from groq import Groq
from app.config import GROQ_API_KEY
from dotenv import load_dotenv
load_dotenv()
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def transcribe_audio(audio_path: str) -> dict:
    with open(audio_path, "rb") as audio_file:
        result = client.audio.translations.create(
            file=(audio_path, audio_file.read()),
            model="whisper-large-v3",
            # language="ne",
            response_format="json"
        )
    return {
        "text": result.text,
        "language": "ne"
    }


# result = transcribe_audio("app/test_audio4.mp3")
# print(result["text"])   










# GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# print("GROQ_API_KEY:", GROQ_API_KEY)

# client = Groq(api_key=GROQ_API_KEY)

# def transcribe_audio(audio_path: str) -> dict:
#     with open(audio_path, "rb") as audio_file:
#         translation = client.audio.translations.create(
#             file=(audio_path, audio_file.read()),
#             model="whisper-large-v3",
#             # language="ne",            # source language
#             response_format="json",
#             temperature=0.0
#         )

#     return {
#         "text": translation.text,
#         "language": "ne"
#     }


# result = transcribe_audio("/content/test_audio4.mp3")
# print(result["text"])
