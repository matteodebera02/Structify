import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.dependencies import get_current_user
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.ai_service import generate_structure

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_INPUT_CHARS = 5000


def rate_limit_key(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user.id}"
    return f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=rate_limit_key)


@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("3/hour")
async def generate(
    request: Request,
    body: GenerateRequest,
    current_user=Depends(get_current_user),
):
    if len(body.description) > MAX_INPUT_CHARS:
        raise HTTPException(status_code=400, detail=f"Description too long. Max {MAX_INPUT_CHARS} characters.")

    logger.info("generate mode=%s len=%d user=%d", body.mode, len(body.description), current_user.id)

    result = await generate_structure(body, api_key=current_user.groq_api_key or None)
    logger.info("done cache_hit=%s latency=%dms own_key=%s",
                result.meta.cache_hit, result.meta.generation_time_ms, bool(current_user.groq_api_key))
    return result
