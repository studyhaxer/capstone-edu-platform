from fastapi import FastAPI
from database import engine
import models
from routers import auth as auth_router
from routers import users as user_router
from routers import courses as courses_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduPlatform API")

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(courses_router.router)


@app.get("/")
def root():
    return {"message": "EduPlatform API Running"}