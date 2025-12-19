# app/utils.py
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import GOOGLE_API_KEY
from dotenv import load_dotenv
from app.prompts import enlishto_nepali_prompt

load_dotenv()

translator = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash"
)

def detect_language(text: str) -> str:
    """
    Very lightweight detection:
    returns 'ne' or 'en'
    """
    for ch in text:
        if '\u0900' <= ch <= '\u097F':
            return "ne"
    return "en"


def nepali_to_english(text: str) -> str:
    """
    Translate Nepali text to English
    """
    prompt = f"Translate the following Nepali text to English:\n{text}"
    result = translator.invoke(prompt)
    return result.content.strip()


def normalize_text_input(text: str) -> str:
    """
    Final normalized user input in English
    """
    lang = detect_language(text)
    if lang == "ne":
        return nepali_to_english(text)
    return text


def english_to_nepali(text: str) -> str:
    """
    Translate English text to Nepali
    """
    prompt = enlishto_nepali_prompt.format(text=text)
    result = translator.invoke(prompt)
    return result.content.strip()