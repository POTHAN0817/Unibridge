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


def test_database_connection():
    client.admin.command("ping")
    return True