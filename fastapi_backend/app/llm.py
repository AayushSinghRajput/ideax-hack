from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.config import GOOGLE_API_KEY, GROQ_API_KEY
from dotenv import load_dotenv

load_dotenv()

gemini = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    
)

groq = ChatGroq(
    model_name="openai/gpt-oss-20b",
    temperature=0.7
)


