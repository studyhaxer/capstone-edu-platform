def _create_course(client, teacher_token, title="Test Course"):
    """Helper: create a course and return its id."""
    res = client.post("/courses/", json={
        "title": title,
        "description": "For lesson tests"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    return res.json()["id"]


def test_create_lesson_as_teacher(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 1")
    res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Intro Lesson",
        "content": "Welcome to the course!"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 201
    assert res.json()["title"] == "Intro Lesson"


def test_create_lesson_as_student_forbidden(client, teacher_token, student_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 2")
    res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Student Lesson",
        "content": "Should fail"
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403


def test_get_lessons_for_course(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 3")
    client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Lesson A",
        "content": "Content A"
    }, headers={"Authorization": f"Bearer {teacher_token}"})

    res = client.get(f"/courses/{course_id}/lessons/",
                     headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert len(res.json()) >= 1


def test_update_own_lesson(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 4")
    create_res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Old Lesson Title",
        "content": "Old content"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    lesson_id = create_res.json()["id"]

    res = client.put(f"/lessons/{lesson_id}", json={
        "title": "Updated Lesson Title",
        "content": "Updated content"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert res.json()["title"] == "Updated Lesson Title"


def test_update_other_teacher_lesson_forbidden(client, teacher_token, teacher2_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 5")
    create_res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Teacher1 Lesson",
        "content": "Owned by teacher1"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    lesson_id = create_res.json()["id"]

    res = client.put(f"/lessons/{lesson_id}", json={
        "title": "Hijacked",
        "content": "Should fail"
    }, headers={"Authorization": f"Bearer {teacher2_token}"})
    assert res.status_code == 403


def test_delete_own_lesson(client, teacher_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 6")
    create_res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Delete This Lesson",
        "content": "Gone soon"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    lesson_id = create_res.json()["id"]

    res = client.delete(f"/lessons/{lesson_id}",
                        headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200 or res.status_code == 204


def test_delete_other_teacher_lesson_forbidden(client, teacher_token, teacher2_token):
    course_id = _create_course(client, teacher_token, "Lesson Course 7")
    create_res = client.post(f"/courses/{course_id}/lessons/", json={
        "title": "Teacher1 Delete Lesson",
        "content": "Owned by teacher1"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    lesson_id = create_res.json()["id"]

    res = client.delete(f"/lessons/{lesson_id}",
                        headers={"Authorization": f"Bearer {teacher2_token}"})
    assert res.status_code == 403