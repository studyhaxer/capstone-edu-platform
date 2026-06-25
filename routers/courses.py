from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from database import get_db
from models import Course,User
from schemas import CourseCreate, CourseOut
from auth import get_current_user, require_any_role
from typing import List

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=CourseOut, status_code=201)
def create_course(data: CourseCreate, db: Session = Depends(get_db),current_user: User = Depends(require_any_role("teacher"))):
    title=data.title
    description=data.description
    owner_id=current_user.id
    new_course = Course(
        title=title,
        description=description,
        owner_id=owner_id,
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/", response_model=list[CourseOut])
def get_all_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).all()
    return course

@router.get("/{course_id}", response_model=CourseOut)
def fetch_course_byid(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseOut)
def update_course(course_id: int, data: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_any_role("teacher"))):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    course.title = data.title
    if data.description is not None:
        course.description = data.description
    db.commit()
    db.refresh(course)
    return course
        
@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_any_role("teacher"))):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")   
    if course.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")  
    db.delete(course)
    db.commit()   
    return Response(status_code=204)