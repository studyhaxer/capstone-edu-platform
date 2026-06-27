def test_register_success(client):
    import time
    unique_email = f"newuser_{int(time.time())}@test.com"
    res = client.post("/auth/register", json={
        "name": "New User",
        "email": unique_email,
        "password": "pass1234",
        "role": "student"
    })
    assert res.status_code == 201
    assert res.json()["email"] == unique_email
    assert "hashed_password" not in res.json()


def test_register_duplicate_email(client):
    payload = {
        "name": "Dup User",
        "email": "dup@test.com",
        "password": "pass1234",
        "role": "student"
    }
    client.post("/auth/register", json=payload)
    res = client.post("/auth/register", json=payload)
    assert res.status_code == 400


def test_login_success(client):
    client.post("/auth/register", json={
        "name": "Login User",
        "email": "loginuser@test.com",
        "password": "pass1234",
        "role": "student"
    })
    res = client.post("/auth/login", data={
        "username": "loginuser@test.com",
        "password": "pass1234"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    res = client.post("/auth/login", data={
        "username": "nobody@test.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_login_nonexistent_user(client):
    res = client.post("/auth/login", data={
        "username": "ghost@test.com",
        "password": "pass1234"
    })
    assert res.status_code == 401