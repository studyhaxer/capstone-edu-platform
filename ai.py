import os
from groq import Groq
from fastapi import HTTPException

ENV = os.getenv("ENV", "development")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    if ENV == "production":
        raise RuntimeError("GROQ_API_KEY is missing in production environment")

client = Groq(api_key=GROQ_API_KEY)


def get_lesson_summary(content: str) -> str:
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Lesson has no content to summarize")
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a teaching assistant for an online education platform. "
                        "Summarize the lesson in 3-5 clear bullet points using simple language. "
                        "Focus only on the most important concepts."
                    )
                },
                {
                    "role": "user",
                    "content": content
                }
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API Error: {str(e)}")