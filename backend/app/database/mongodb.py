from pymongo import MongoClient
from pymongo.server_api import ServerApi

from app.config import settings


client = MongoClient(
    settings.mongodb_uri,
    server_api=ServerApi(
        version="1",
        strict=True,
        deprecation_errors=True,
    ),
)

db = client[settings.mongodb_database]


def get_database():
    return db


def get_users_collection():
    return db["users"]


def get_challenges_collection():
    return db["challenges"]


def get_universities_collection():
    return db["universities"]


def get_university_interests_collection():
    return db["university_interests"]


def get_university_faculty_collection():
    return db["university_faculty"]


def get_university_students_collection():
    return db["university_students"]


def init_db_indexes():
    """
    Safely initialize required database indexes during startup.
    """
    users = get_users_collection()
    users.create_index("email", unique=True)

    challenges = get_challenges_collection()
    challenges.create_index("reported_by")
    challenges.create_index([("created_at", -1)])
    challenges.create_index("status")

    universities = get_universities_collection()
    universities.create_index("created_by", unique=True)
    universities.create_index("location.state")
    universities.create_index("location.city")

    interests = get_university_interests_collection()
    interests.create_index([("university_id", 1), ("challenge_id", 1)], unique=True)
    interests.create_index("university_id")
    interests.create_index("challenge_id")

    faculty = get_university_faculty_collection()
    faculty.create_index([("university_id", 1), ("email", 1)], unique=True)
    faculty.create_index("university_id")

    students = get_university_students_collection()
    students.create_index([("university_id", 1), ("email", 1)], unique=True)
    students.create_index("university_id")
    students.create_index("email")




def test_database_connection():
    client.admin.command("ping")
    return True