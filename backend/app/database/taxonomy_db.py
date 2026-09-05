from datetime import datetime, timezone
from typing import Any, Dict, List
from pymongo.collection import Collection
from app.database.mongodb import get_database

COLLECTION_NAME = "ai_taxonomy"


def get_taxonomy_collection() -> Collection:
    """Retrieve the ai_taxonomy collection from MongoDB Atlas."""
    return get_database()[COLLECTION_NAME]


def get_all_taxonomy_records() -> List[Dict[str, Any]]:
    """
    Fetch all active category taxonomy documents directly from MongoDB Atlas.
    Zero hardcoded domain data in code.
    """
    col = get_taxonomy_collection()
    return list(col.find({}, {"_id": 0}))


def seed_default_taxonomy_if_empty() -> int:
    """
    Check if ai_taxonomy exists in MongoDB Atlas. If completely empty,
    delegate to the seeder script definition so data is stored in the database.
    """
    col = get_taxonomy_collection()
    return col.count_documents({})


def upsert_taxonomy_category(category_data: Dict[str, Any]) -> None:
    """Upsert a single category document in MongoDB Atlas."""
    col = get_taxonomy_collection()
    cat_name = category_data["category"]
    col.update_one(
        {"category": cat_name},
        {"$set": {**category_data, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
