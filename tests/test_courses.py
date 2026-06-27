def test_create_course_as_teacher(client, teacher_token):
    res = client.post("/courses/", json={
        "title": "FastAPI 101",
        "description": "Learn FastAPI from scratch"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 201
    assert res.json()["title"] == "FastAPI 101"


def test_create_course_as_student_forbidden(client, student_token):
    res = client.post("/courses/", json={
        "title": "Sneaky Course",
        "description": "Should fail"
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403


def test_create_course_unauthenticated(client):
    res = client.post("/courses/", json={
        "title": "No Auth Course",
        "description": "Should fail"
    })
    assert res.status_code == 401


def test_get_all_courses(client, teacher_token):
    client.post("/courses/", json={
        "title": "Visible Course",
        "description": "For listing test"
    }, headers={"Authorization": f"Bearer {teacher_token}"})

    res = client.get("/courses/", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_course_by_id(client, teacher_token):
    create_res = client.post("/courses/", json={
        "title": "Specific Course",
        "description": "For get-by-id test"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    course_id = create_res.json()["id"]

    res = client.get(f"/courses/{course_id}", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert res.json()["id"] == course_id


def test_get_course_not_found(client, teacher_token):
    res = client.get("/courses/99999", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 404


def test_update_own_course(client, teacher_token):
    create_res = client.post("/courses/", json={
        "title": "Old Title",
        "description": "Old desc"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    course_id = create_res.json()["id"]

    res = client.put(f"/courses/{course_id}", json={
        "title": "New Title",
        "description": "New desc"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert res.json()["title"] == "New Title"


def test_update_other_teacher_course_forbidden(client, teacher_token, teacher2_token):
    # teacher1 creates a course
    create_res = client.post("/courses/", json={
        "title": "Teacher1 Course",
        "description": "Owned by teacher1"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    course_id = create_res.json()["id"]

    # teacher2 tries to update it
    res = client.put(f"/courses/{course_id}", json={
        "title": "Hijacked",
        "description": "Should fail"
    }, headers={"Authorization": f"Bearer {teacher2_token}"})
    assert res.status_code == 403


def test_delete_own_course(client, teacher_token):
    create_res = client.post("/courses/", json={
        "title": "Delete Me",
        "description": "Will be deleted"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    course_id = create_res.json()["id"]

    res = client.delete(f"/courses/{course_id}",
                        headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200 or res.status_code == 204


def test_delete_other_teacher_course_forbidden(client, teacher_token, teacher2_token):
    create_res = client.post("/courses/", json={
        "title": "Teacher1 Delete Course",
        "description": "Owned by teacher1"
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    course_id = create_res.json()["id"]

    res = client.delete(f"/courses/{course_id}",
                        headers={"Authorization": f"Bearer {teacher2_token}"})
    assert res.status_code == 403