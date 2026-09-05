"""
Standalone script to seed or reset the AI Taxonomy in MongoDB Atlas.
Usage:
    python backend/scripts/seed_taxonomy.py [--reset]
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.taxonomy_db import (
    get_taxonomy_collection,
    DEFAULT_TAXONOMY_DATA,
    seed_default_taxonomy_if_empty,
)
from datetime import datetime, timezone


def main():
    col = get_taxonomy_collection()
    reset = "--reset" in sys.argv

    if reset:
        print("[Taxonomy Seeder] Reset flag detected. Purging existing 'ai_taxonomy' collection...")
        col.delete_many({})

    count = col.count_documents({})
    if count == 0:
        print(f"[Taxonomy Seeder] Seeding {len(DEFAULT_TAXONOMY_DATA)} categories into MongoDB Atlas...")
        now = datetime.now(timezone.utc)
        docs = [{**item, "created_at": now, "updated_at": now} for item in DEFAULT_TAXONOMY_DATA]
        res = col.insert_many(docs)
        print(f"[Taxonomy Seeder] Successfully inserted {len(res.inserted_ids)} taxonomy records.")
    else:
        print(f"[Taxonomy Seeder] Collection already contains {count} records. No changes made.")

    records = list(col.find({}, {"_id": 0, "category": 1, "subcategories.name": 1}))
    print("\nActive Taxonomy in MongoDB Atlas:")
    for r in records:
        sub_names = [s["name"] for s in r.get("subcategories", [])]
        print(f"  - {r['category']} ({len(sub_names)} subcategories): {', '.join(sub_names[:3])}...")


if __name__ == "__main__":
    main()
