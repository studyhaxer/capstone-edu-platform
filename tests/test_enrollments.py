def _create_course(client, teacher_token, title="Enroll Course"):
    """Helper: create a course and return its id."""
    res = client.post("/courses/", json={
        "title": title,
        "description": "For enrollment tests"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    return res.json()["id"]


def test_enroll_as_student_success(client, teacher_token, student_token):
    course_id = _create_course(client, teacher_token, "Enroll Course 1")
    res = client.post("/enroll", json={
        "course_id": course_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 201
    assert res.json()["course_id"] == course_id


def test_enroll_duplicate_returns_400(client, teacher_token, student_token):
    course_id = _create_course(client, teacher_token, "Enroll Course 2")
    client.post("/enroll", json={
        "course_id": course_id
    }, headers={"Authorization": f"Bearer {student_token}"})

    res = client.post("/enroll", json={
        "course_id": course_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 400


def test_enroll_as_teacher_forbidden(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Enroll Course 3")
    res = client.post("/enroll", json={
        "course_id": course_id
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 403


def test_enroll_unauthenticated(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Enroll Course 4")
    res = client.post("/enroll", json={
        "course_id": course_id
    })
    assert res.status_code == 401


def test_get_my_courses_as_student(client, teacher_token, student_token):
    course_id = _create_course(client, teacher_token, "Enroll Course 5")
    client.post("/enroll", json={
        "course_id": course_id
    }, headers={"Authorization": f"Bearer {student_token}"})

    res = client.get("/my-courses",
                     headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    ids = [c["id"] for c in res.json()]
    assert course_id in ids


def test_get_my_courses_empty_when_not_enrolled(client):
    client.post("/auth/register", json={
        "name": "Empty Student",
        "email": "emptystudent@test.com",
        "password": "pass1234",
        "role": "student"
    })
    res_login = client.post("/auth/login", data={
        "username": "emptystudent@test.com",
        "password": "pass1234"
    })
    token = res_login.json()["access_token"]

    res = client.get("/my-courses",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == []