import logging
import uuid
from typing import Any, Optional
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status
from starlette.datastructures import UploadFile

from app.config import settings

logger = logging.getLogger("unibridge.cloudinary")

# Configure Cloudinary SDK strictly within backend
if settings.cloudinary_cloud_name and settings.cloudinary_api_key and settings.cloudinary_api_secret:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
else:
    logger.warning("Cloudinary credentials are not fully configured in environment settings.")

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_image_file(file: UploadFile) -> bytes:
    """
    Validates the uploaded file:
    - Content type must be image/jpeg, image/png, or image/webp.
    - File size must not exceed 5 MB.
    - Magic bytes must conform to valid image headers.
    Returns the file bytes upon successful validation.
    """
    if not file.content_type or file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats are JPG, PNG, and WEBP.",
        )

    # Check filename extension if available
    filename = (file.filename or "").lower()
    if filename:
        valid_extensions = tuple(ext for exts in ALLOWED_MIME_TYPES.values() for ext in exts)
        if not filename.endswith(valid_extensions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file extension. Please upload a file with .jpg, .jpeg, .png, or .webp extension.",
            )

    try:
        content = file.file.read()
    except Exception as read_err:
        logger.error(f"Error reading uploaded file: {read_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read the uploaded image file.",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty.",
        )

    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds the maximum allowed limit of 5 MB.",
        )

    # Validate image header magic bytes
    if file.content_type.lower() == "image/jpeg":
        if not content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JPEG image format.",
            )
    elif file.content_type.lower() == "image/png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PNG image format.",
            )
    elif file.content_type.lower() == "image/webp":
        if not (content.startswith(b"RIFF") and len(content) >= 12 and content[8:12] == b"WEBP"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid WEBP image format.",
            )

    return content


def upload_challenge_image(file_bytes: bytes, filename: Optional[str] = None) -> dict[str, Any]:
    """
    Uploads verified image bytes to Cloudinary under the dedicated folder:
    unibridge/challenges/{unique_id}
    Returns metadata formatted for MongoDB storage.
    """
    unique_id = uuid.uuid4().hex
    public_id = f"unibridge/challenges/{unique_id}"

    try:
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            public_id=public_id,
            resource_type="image",
            overwrite=True,
        )

        secure_url = upload_result.get("secure_url") or upload_result.get("url")
        if not secure_url:
            raise ValueError("Cloudinary upload did not return a valid URL.")

        return {
            "url": secure_url,
            "public_id": upload_result.get("public_id", public_id),
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),
            "height": upload_result.get("height"),
        }
    except Exception as exc:
        # Safe logging: do NOT expose keys, secrets, or internal signatures
        logger.error(f"Cloudinary image upload failed for {public_id}: {type(exc).__name__}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload image to cloud storage. Please try again later.",
        )


def delete_challenge_image(public_id: str) -> bool:
    """
    Removes an uploaded image from Cloudinary.
    Used for rolling back orphaned files when challenge creation fails or during test teardown.
    """
    if not public_id:
        return False

    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        return result.get("result") == "ok"
    except Exception as exc:
        logger.error(f"Failed to delete Cloudinary image {public_id}: {type(exc).__name__}")
        return False
