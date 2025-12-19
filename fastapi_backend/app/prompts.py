from langchain_core.prompts import PromptTemplate

question_prompt = PromptTemplate(
    template="""
You are a form assistant.
Ask ONLY about the given field.
Do NOT explain.
Conversation history:
{history}

Field:
{field}

Return only the question.
""",
    input_variables=["field", "history"]
)

extract_prompt = PromptTemplate(
    template="""
You are a strict validation and extraction engine.

Return ONLY:
0
OR
{{"value": "extracted_value"}}

Question:
{question}

Field:
{field}

User input:
{user_input}
""",
    input_variables=["question", "field", "user_input"]
)


enlishto_nepali_prompt = PromptTemplate(
    template="""Trnaslate the given  English text to Nepali:
    {text}
    Return only the translated text.
    No explanations.
    No additional text.
""",
    input_variables=["text"]
)