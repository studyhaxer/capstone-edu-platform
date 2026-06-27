import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def teacher_token(client):
    client.post("/auth/register", json={
        "name": "Test Teacher",
        "email": "teacher@test.com",
        "password": "pass1234",
        "role": "teacher"
    })
    res = client.post("/auth/login", data={
        "username": "teacher@test.com",
        "password": "pass1234"
    })
    return res.json()["access_token"]


@pytest.fixture
def student_token(client):
    client.post("/auth/register", json={
        "name": "Test Student",
        "email": "student@test.com",
        "password": "pass1234",
        "role": "student"
    })
    res = client.post("/auth/login", data={
        "username": "student@test.com",
        "password": "pass1234"
    })
    return res.json()["access_token"]


@pytest.fixture
def teacher2_token(client):
    """A second teacher — used to test ownership/403 cases."""
    client.post("/auth/register", json={
        "name": "Teacher Two",
        "email": "teacher2@test.com",
        "password": "pass1234",
        "role": "teacher"
    })
    res = client.post("/auth/login", data={
        "username": "teacher2@test.com",
        "password": "pass1234"
    })
    return res.json()["access_token"]