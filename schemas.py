from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class LessonOut(BaseModel):
    id: int
    title: str
    content: str
    course_id: int
    model_config = {"from_attributes": True}


class LessonCreate(BaseModel):
    title: str
    content: str


class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    lessons: List[LessonOut] = []
    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["student", "teacher", "admin"] = "student"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    courses: List[CourseOut] = []  # nested list of courses
    model_config = {"from_attributes": True}


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[int] = None