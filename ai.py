import os
from openai import OpenAI
from fastapi import APIRouter, Depends, HTTPException, Response, status

ENV = os.getenv("ENV", "development")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


if not OPENAI_API_KEY:
    if ENV == "production":
        raise RuntimeError("OPENAI_API_KEY is missing in production environment")


client = OpenAI(api_key=OPENAI_API_KEY)

def get_lesson_summary(content: str) -> str:
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Lesson has no content to summarize")
    try:
        response = client.chat.completions.create(model="gpt-4o-mini",messages=[
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

        summary = response.choices[0].message.content
        return summary
    except Exception as e:
        raise HTTPException(status_code=502,detail=f"OpenAI API Error: {str(e)}")