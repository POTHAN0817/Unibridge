import json
import logging
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from starlette.datastructures import UploadFile
from pydantic import ValidationError

from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserRole
from app.schemas.challenge import ChallengeCreate, ChallengeLocation, ChallengeResponse
from app.services import challenge_service, cloudinary_service
from app.ai.problem_analyzer import analyze_problem
from app.ai.duplicate_detector import detect_duplicates
from app.ai.priority_engine import calculate_priority

logger = logging.getLogger("unibridge.challenges")
router = APIRouter()


@router.post(
    "",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a new civic challenge",
    description="Allows authenticated citizens to report a societal problem in their community with an optional photo.",
)
async def create_challenge_endpoint(
    request: Request,
    current_user: dict[str, Any] = Depends(require_role(UserRole.CITIZEN)),
):
    """
    Creates a new challenge associated strictly with the authenticated citizen.
    Supports multipart/form-data (with optional image file upload) and application/json.
    Uploads optional photo to Cloudinary and persists metadata in MongoDB.
    Executes AI Problem Analysis, Semantic Duplicate Detection, and Explainable Priority Scoring.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in authentication credentials.",
        )

    content_type = request.headers.get("content-type", "").lower()
    image_metadata: Optional[dict[str, Any]] = None
    uploaded_public_id: Optional[str] = None

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()

        # Parse text fields
        title = form.get("title")
        description = form.get("description")
        category = form.get("category")
        subcategory = form.get("subcategory")

        # Parse impact / Phase 2B user fields
        raw_affected = form.get("affected_people")
        affected_people: Optional[int] = None
        if raw_affected is not None and str(raw_affected).strip():
            try:
                # Handle numeric inputs or strings with commas/plus
                cleaned_num = "".join(ch for ch in str(raw_affected) if ch.isdigit())
                if cleaned_num:
                    affected_people = int(cleaned_num)
            except Exception:
                affected_people = None

        urgency_raw = form.get("urgency")
        urgency = str(urgency_raw).strip() if urgency_raw else None

        tags_raw = form.get("citizen_tags") or form.get("tags")
        citizen_tags: List[str] = []
        if tags_raw:
            if isinstance(tags_raw, str):
                try:
                    parsed_tags = json.loads(tags_raw)
                    if isinstance(parsed_tags, list):
                        citizen_tags = [str(t).strip() for t in parsed_tags if str(t).strip()]
                    else:
                        citizen_tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
                except Exception:
                    citizen_tags = [t.strip() for t in tags_raw.split(",") if t.strip()]

        # Parse location fields
        location_obj = None
        raw_location = form.get("location")
        if raw_location and isinstance(raw_location, str):
            try:
                loc_dict = json.loads(raw_location)
                if isinstance(loc_dict, dict):
                    location_obj = ChallengeLocation(**loc_dict)
            except Exception:
                location_obj = ChallengeLocation(address=raw_location)
        else:
            district = form.get("district")
            state = form.get("state")
            address = form.get("address")
            lat_raw = form.get("latitude")
            lng_raw = form.get("longitude")

            latitude = float(lat_raw) if lat_raw and str(lat_raw).strip() else None
            longitude = float(lng_raw) if lng_raw and str(lng_raw).strip() else None

            if any([district, state, address, latitude is not None, longitude is not None]):
                location_obj = ChallengeLocation(
                    district=str(district) if district else None,
                    state=str(state) if state else None,
                    address=str(address) if address else None,
                    latitude=latitude,
                    longitude=longitude,
                )

        try:
            challenge_in = ChallengeCreate(
                title=title if title is not None else "",
                description=description if description is not None else "",
                category=str(category) if category else None,
                subcategory=str(subcategory) if subcategory else None,
                location=location_obj,
                affected_people=affected_people,
                urgency=urgency,
                citizen_tags=citizen_tags,
            )
        except ValidationError as val_err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=val_err.errors(),
            )

        # Handle optional photo
        photo_field = form.get("photo") or form.get("image") or form.get("file")
        if photo_field and isinstance(photo_field, UploadFile) and photo_field.filename:
            # Validate image constraints (5 MB max, allowed image mime types, valid magic bytes)
            image_bytes = cloudinary_service.validate_image_file(photo_field)
            # Upload to Cloudinary under unibridge/challenges/{uuid}
            image_metadata = cloudinary_service.upload_challenge_image(
                file_bytes=image_bytes,
                filename=photo_field.filename,
            )
            uploaded_public_id = image_metadata.get("public_id")

    else:
        # Fallback to JSON payload
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON request body.",
            )

        try:
            challenge_in = ChallengeCreate(**body)
        except ValidationError as val_err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=val_err.errors(),
            )

        if challenge_in.image:
            image_metadata = challenge_in.image.model_dump()

    # Persist challenge to MongoDB
    try:
        new_challenge = challenge_service.create_challenge(
            challenge_in,
            user_id=str(user_id),
            image_data=image_metadata,
        )
    except Exception as exc:
        # Rollback uploaded Cloudinary asset if MongoDB insertion fails
        if uploaded_public_id:
            cloudinary_service.delete_challenge_image(uploaded_public_id)
        logger.error(f"Error creating challenge: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create challenge record. Please try again.",
        )

    # ML Pipeline Execution with Complete Fault Tolerance
    # The challenge is ALREADY persisted in MongoDB.
    # If any ML module encounters an error, the challenge is NEVER lost.
    challenge_id = new_challenge.get("id") if isinstance(new_challenge, dict) else new_challenge.id
    challenge_title = new_challenge.get("title", "") if isinstance(new_challenge, dict) else new_challenge.title
    challenge_desc = new_challenge.get("description", "") if isinstance(new_challenge, dict) else new_challenge.description
    challenge_loc = new_challenge.get("location") if isinstance(new_challenge, dict) else (new_challenge.location.model_dump() if new_challenge.location else None)
    chal_affected = new_challenge.get("affected_people") if isinstance(new_challenge, dict) else new_challenge.affected_people
    chal_urgency = new_challenge.get("urgency") if isinstance(new_challenge, dict) else new_challenge.urgency

    try:
        # 1. Phase 2A Problem Analyzer
        ai_res = analyze_problem(challenge_title, challenge_desc)
        assigned_cat = ai_res.get("category")
        assigned_subcat = ai_res.get("subcategory")

        # 2. Phase 2B Semantic Duplicate Detection
        dup_res, emb_dict = detect_duplicates(
            challenge_id=str(challenge_id),
            title=challenge_title,
            description=challenge_desc,
            category=assigned_cat,
            subcategory=assigned_subcat,
            location=challenge_loc,
        )

        # 3. Phase 2B Explainable Priority Calculation
        prio_res = calculate_priority(
            category=assigned_cat,
            affected_people=chal_affected,
            urgency=chal_urgency,
            duplicate_info=dup_res,
            ai_analysis=ai_res,
        )

        # 4. Phase 3A Real University Matching
        uni_matches_res = None
        try:
            from app.services import university_service
            real_universities = university_service.get_all_universities()
            from app.ai.university_matcher import get_university_matcher
            uni_matcher = get_university_matcher()
            # Construct ephemeral challenge dict for matching
            ch_eval_dict = {
                "id": str(challenge_id),
                "title": challenge_title,
                "description": challenge_desc,
                "category": assigned_cat,
                "subcategory": assigned_subcat,
                "location": challenge_loc,
                "ai_analysis": ai_res,
            }
            uni_matches_res = uni_matcher.match_all_universities(ch_eval_dict, real_universities)
        except Exception as uni_err:
            import traceback
            traceback.print_exc()
            logger.warning(f"University matching failed during challenge creation: {uni_err}")
            uni_matches_res = {
                "status": "no_candidates",
                "matches": [],
                "model_version": "unibridge-university-match-v1",
                "calculated_at": None,
            }

        # 5. Atomic Database Update for Full AI Output
        updated = challenge_service.update_challenge_full_ai(
            challenge_id=str(challenge_id),
            ai_analysis=ai_res,
            duplicate_analysis=dup_res,
            priority_analysis=prio_res,
            embedding=emb_dict,
            university_matches=uni_matches_res,
            ai_status="completed",
        )
        if updated:
            return updated
    except Exception as ai_err:
        logger.error(f"AI Pipeline failed for challenge {challenge_id}: {ai_err}", exc_info=True)
        challenge_service.update_challenge_full_ai(
            challenge_id=str(challenge_id),
            ai_analysis=None,
            duplicate_analysis=None,
            priority_analysis=None,
            embedding=None,
            university_matches=None,
            ai_status="failed",
        )
        if isinstance(new_challenge, dict):
            new_challenge["ai_status"] = "failed"
        else:
            new_challenge.ai_status = "failed"

    return new_challenge


@router.get(
    "/my",
    response_model=List[ChallengeResponse],
    summary="Get challenges submitted by the logged-in citizen",
    description="Returns all challenges created by the authenticated citizen, ordered newest first.",
)
def get_my_challenges_endpoint(
    current_user: dict[str, Any] = Depends(require_role(UserRole.CITIZEN)),
):
    """
    Retrieves challenges reported by the current citizen.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in authentication credentials.",
        )

    return challenge_service.get_challenges_by_reporter(str(user_id))


@router.get(
    "/{challenge_id}/university-matches",
    summary="Get explainable university matches for a challenge",
    description="Retrieves or calculates real university capability matches for the given challenge.",
)
def get_challenge_university_matches_endpoint(
    challenge_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
):
    """
    Returns real university matches for a challenge.
    Recalculates or retrieves stored matches from MongoDB.
    """
    challenge = challenge_service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    # Ownership enforcement for citizens
    user_role = current_user.get("role")
    user_id = str(current_user.get("id"))
    if user_role == UserRole.CITIZEN.value and challenge.get("reported_by") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot view matches for another citizen's private challenge.",
        )

    from app.services import university_service
    return university_service.match_universities_for_challenge(challenge_id)


@router.get(
    "/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Get challenge details by ID",
    description="Fetches a challenge by ID. Citizens can only view their own private reports.",
)
def get_challenge_by_id_endpoint(
    challenge_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
):
    """
    Fetch a specific challenge by its unique identifier.
    Enforces ownership isolation so citizens cannot inspect another citizen's private challenge.
    """
    challenge = challenge_service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    # Ownership enforcement for citizens
    user_role = current_user.get("role")
    user_id = str(current_user.get("id"))
    if user_role == UserRole.CITIZEN.value and challenge.get("reported_by") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot view another citizen's private challenge.",
        )

    return challenge

