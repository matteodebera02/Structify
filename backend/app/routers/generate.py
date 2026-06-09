import logging
import time
from contextvars import ContextVar

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.dependencies import get_current_user
from app.core.security import decode_token
from app.db.session import SessionLocal
from app.repositories.user_repo import UserRepository
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.ai_service import generate_structure

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_INPUT_CHARS = 5000
_RATE_LIMIT = 3
_WINDOW = 3600  # seconds

# key → (count, window_start_timestamp)
_quota: dict[str, tuple[int, float]] = {}


def _quota_used(key: str) -> int:
    entry = _quota.get(key)
    if not entry:
        return 0
    count, start = entry
    return count if (time.time() - start) < _WINDOW else 0


def _quota_increment(key: str) -> None:
    now = time.time()
    entry = _quota.get(key)
    if entry and (now - entry[1]) < _WINDOW:
        _quota[key] = (entry[0] + 1, entry[1])
    else:
        _quota[key] = (1, now)

_has_own_key: ContextVar[bool] = ContextVar("has_own_key", default=False)


def rate_limit_key(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            payload = decode_token(auth.split(" ", 1)[1])
            db = SessionLocal()
            try:
                user = UserRepository(db).get_by_id(int(payload["sub"]))
                _has_own_key.set(bool(user and user.groq_api_key))
                return f"user:{payload['sub']}"
            finally:
                db.close()
        except Exception:
            pass
    _has_own_key.set(False)
    return f"ip:{get_remote_address(request)}"


def _exempt() -> bool:
    return _has_own_key.get()


limiter = Limiter(key_func=rate_limit_key)


@router.get("/generate/quota")
async def get_quota(current_user=Depends(get_current_user)):
    if current_user.groq_api_key:
        return {"own_key": True, "limit": None, "used": None, "remaining": None}
    key = f"user:{current_user.id}"
    used = _quota_used(key)
    return {"own_key": False, "limit": _RATE_LIMIT, "used": used, "remaining": max(0, _RATE_LIMIT - used)}


@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("3/hour", exempt_when=_exempt)
async def generate(
    request: Request,
    body: GenerateRequest,
    current_user=Depends(get_current_user),
):
    if len(body.description) > MAX_INPUT_CHARS:
        raise HTTPException(status_code=400, detail=f"Description too long. Max {MAX_INPUT_CHARS} characters.")

    logger.info("generate mode=%s len=%d user=%d", body.mode, len(body.description), current_user.id)

    try:
        result = await generate_structure(body, api_key=current_user.groq_api_key or None)
    except HTTPException as e:
        if not current_user.groq_api_key and e.status_code == 400 and str(e.detail).startswith("NOT_A_PROJECT::"):
            _quota_increment(f"user:{current_user.id}")
        raise

    if not current_user.groq_api_key and not result.meta.cache_hit:
        _quota_increment(f"user:{current_user.id}")

    logger.info("done cache_hit=%s latency=%dms own_key=%s",
                result.meta.cache_hit, result.meta.generation_time_ms, bool(current_user.groq_api_key))
    return result
