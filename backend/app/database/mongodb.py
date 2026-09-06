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


def get_university_teams_collection():
    return db["university_teams"]


def get_university_projects_collection():
    return db["university_projects"]


def get_project_milestones_collection():
    return db["project_milestones"]


def get_project_research_collection():
    return db["project_research"]


def get_project_solutions_collection():
    return db["project_solutions"]


def get_project_prototypes_collection():
    return db["project_prototypes"]


def get_project_pilots_collection():
    return db["project_pilots"]


def get_project_deployment_readiness_collection():
    return db["project_deployment_readiness"]


def get_project_activity_collection():
    return db["project_activity"]


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

    teams = get_university_teams_collection()
    teams.create_index("university_id")
    teams.create_index("challenge_id")
    teams.create_index([("university_id", 1), ("challenge_id", 1)])
    teams.create_index([("created_at", -1)])

    projects = get_university_projects_collection()
    projects.create_index("university_id")
    projects.create_index("challenge_id")
    projects.create_index("team_id")
    projects.create_index([("university_id", 1), ("team_id", 1), ("challenge_id", 1)])
    projects.create_index([("created_at", -1)])

    milestones = get_project_milestones_collection()
    milestones.create_index("project_id")
    milestones.create_index("university_id")
    milestones.create_index([("project_id", 1), ("university_id", 1)])
    milestones.create_index([("created_at", -1)])

    research = get_project_research_collection()
    research.create_index("project_id")
    research.create_index("university_id")
    research.create_index([("project_id", 1), ("created_at", -1)])

    solutions = get_project_solutions_collection()
    solutions.create_index([("project_id", 1), ("university_id", 1)], unique=True)

    prototypes = get_project_prototypes_collection()
    prototypes.create_index("project_id")
    prototypes.create_index("university_id")
    prototypes.create_index([("project_id", 1), ("created_at", -1)])

    pilots = get_project_pilots_collection()
    pilots.create_index("project_id")
    pilots.create_index("university_id")
    pilots.create_index([("project_id", 1), ("created_at", -1)])

    readiness = get_project_deployment_readiness_collection()
    readiness.create_index([("project_id", 1), ("university_id", 1)], unique=True)

    activity = get_project_activity_collection()
    activity.create_index("project_id")
    activity.create_index("university_id")
    activity.create_index([("project_id", 1), ("created_at", -1)])





def test_database_connection():
    client.admin.command("ping")
    return True