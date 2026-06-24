from fastapi import FastAPI
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduPlatform API")


@app.get("/")
def root():
    return {"message": "EduPlatform API Running"}