from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, require_any_role
from models import Course,User,Lesson
from schemas import LessonCreate, LessonOut, SummaryOut
from ai import get_lesson_summary

course_lessons_router = APIRouter(prefix="/courses", tags=["lessons"])

lesson_router = APIRouter(prefix="/lessons", tags=["lessons"])



@course_lessons_router.post("/{course_id}/lessons", response_model=LessonOut, status_code=201)
def create_lesson(course_id: int, data:LessonCreate, db: Session = Depends(get_db),current_user: User = Depends(require_any_role("teacher"))):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    new_lesson = Lesson(
        title=data.title,
        content=data.content,
        course_id=course_id,
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson
    
@course_lessons_router.get("/{course_id}/lessons", response_model=list[LessonOut])
def fetch_course_lesson(course_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course.lessons

@lesson_router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(lesson_id: int, data: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(require_any_role("teacher"))):
    fetch_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not fetch_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if fetch_lesson.course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your Lesson")
    fetch_lesson.title = data.title
    fetch_lesson.content = data.content
    db.commit()
    db.refresh(fetch_lesson)
    return fetch_lesson

@lesson_router.delete("/{lesson_id}", status_code=204)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_any_role("teacher"))):
    fetchlesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not fetchlesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if fetchlesson.course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your Lesson")
    db.delete(fetchlesson)
    db.commit()   
    return Response(status_code=204)

@lesson_router.post("/{lesson_id}/summarize", response_model=SummaryOut)
def summarize_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.content or not lesson.content.strip():
        raise HTTPException(status_code=400, detail="Lesson has no content to summarize")
    summary = get_lesson_summary(lesson.content)
    return SummaryOut(lesson_id= lesson.id, summary=summary)