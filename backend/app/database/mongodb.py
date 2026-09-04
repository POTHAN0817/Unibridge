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


def test_database_connection():
    client.admin.command("ping")
    return True