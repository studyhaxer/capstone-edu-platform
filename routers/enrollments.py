from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from auth import get_current_user, require_any_role
from models import Course,User,Enrollment
from schemas import EnrollmentOut , CourseOut, EnrollmentCreate

router = APIRouter(prefix="", tags=["Enrollments"])

@router.post("/enroll", response_model=EnrollmentOut, status_code=201)
def enroll_student(data: EnrollmentCreate, db: Session = Depends(get_db),current_user: User = Depends(require_any_role("student"))):
    fetch_course = db.query(Course).filter(Course.id == data.course_id).first()
    if not fetch_course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = Enrollment(student_id=current_user.id, course_id=data.course_id)
    try:
        db.add(enrollment)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Already enrolled")
    db.refresh(enrollment)
    return enrollment

@router.get("/my-courses", response_model=list[CourseOut])
def get_std_courses(db: Session = Depends(get_db),current_user: User = Depends(require_any_role("student"))):
    std_courses =  db.query(Enrollment ).filter(Enrollment.student_id == current_user.id).all()
    courses = [e.course for e in std_courses]
    return courses