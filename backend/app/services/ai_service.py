import hashlib
import json
import logging
import re
import time

from groq import Groq, APIStatusError, RateLimitError
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.generate import GenerateRequest, GenerateResponse, MetaInfo

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Structify AI — you transform software and technology project descriptions into structured Agile artifacts.

RULE — OUTPUT LANGUAGE
Detect the user's language. Write ALL human-readable text (titles, descriptions, summaries, warnings) in that language. JSON keys stay in English. This rule is absolute.

RULE — TASK SPECIFICITY
Every task title must name the exact artifact: file path, model class, endpoint route, component name, config key. Never a generic category.
Every task description must include concrete detail: field names/types, API path, method signature, framework vocabulary.
✗ WRONG: "Define the data model" | "Create the user interface" | "Implement the feature"
✓ CORRECT: "Define Booking model in src/models/booking.py: guest_name/Str, room_id/Int FK→Room, check_in/Date" | "Create BookingForm in booking-form.component.ts: ReactiveForm with guest_name, guest_email, check_in, check_out"
Stack vocabulary: FastAPI→router/BaseModel/Depends, Angular→Component/Service/Observable, Django→Model/ForeignKey/serializer, Odoo→_name/_inherit/Many2one/ir.model.access, React→component/useState/useEffect/hook.

VALIDATION
If the input is NOT a software/technology project (recipe, poem, homework, joke, math problem), emit:
<final>{"error": "NOT_A_PROJECT", "message": "<brief explanation in the user's language>"}</final>
and stop immediately.

OUTPUT
Analyze the description, detect the tech stack, plan the V1 scope, then emit a single <final> block with valid JSON:

<final>
{
  "project_title": "concise title",
  "project_summary": "1-2 sentence summary",
  "mode": "us_and_tasks",
  "user_stories": [
    {
      "id": "us_N",
      "title": "As a [role], I want [specific goal] so that [reason]",
      "description": "Acceptance criteria. Max 2 sentences.",
      "order": N,
      "tasks": [
        {
          "id": "task_N",
          "user_story_id": "us_N",
          "title": "verb + exact artifact name",
          "description": "Concrete steps using stack vocabulary. Max 3 sentences.",
          "order": N,
          "effort": "S | M | L",
          "effort_hours": { "min": N, "max": N },
          "confidence": 0.85,
          "assumptions": ["any assumption made, or empty array"]
        }
      ]
    }
  ],
  "tasks": [],
  "warnings": [],
  "assumptions_required": []
}
</final>

Effort: S=0.5–2h (single endpoint/component/config), M=2–6h (multi-step/integration), L=6–8h (complex cross-layer/arch).
Confidence: 0.9–1.0 clear, 0.6–0.9 minor assumptions, <0.6 significant ambiguity.

Before emitting, verify:
- 3–8 User Stories, each with at least 2 tasks. Add tasks if needed.
- DB/auth setup before features that depend on them. No UI before its API.
- Varied roles across stories (guest, admin, manager, developer…).
- Every task title names a specific artifact — fix any generic title.
- Do not invent features not stated or implied. tasks[] at root stays empty."""


# --- cache ---

_cache: dict = {}
CACHE_TTL_SECONDS = 600
CACHE_MAX_ENTRIES = 1000


def cache_key(description: str, mode: str) -> str:
    raw = f"{mode}::{description.strip().lower()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _evict_if_needed() -> None:
    if len(_cache) >= CACHE_MAX_ENTRIES:
        oldest = sorted(_cache.items(), key=lambda x: x[1][1])[:100]
        for k, _ in oldest:
            del _cache[k]
        logger.info("cache evicted 100 entries")


def get_cached(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry[1]) < CACHE_TTL_SECONDS:
        return entry[0]
    return None


def set_cached(key: str, value) -> None:
    _evict_if_needed()
    _cache[key] = (value, time.time())


# --- extraction ---

def extract_final_output(raw: str) -> str:
    for tag in ("final", "repaired", "generation"):
        match = re.search(rf"<{tag}>(.*?)</{tag}>", raw, re.DOTALL)
        if match:
            logger.info("extracted from <%s> tag", tag)
            return match.group(1).strip()
    logger.warning("no xml tag found, falling back to strip markdown")
    return re.sub(r"```json|```", "", raw).strip()


def parse_and_validate(raw: str, request_mode: str) -> dict:
    data = json.loads(extract_final_output(raw))

    if data.get("error") == "NOT_A_PROJECT":
        logger.info("rejected: not a valid project input")
        raise HTTPException(
            status_code=400,
            detail=f"NOT_A_PROJECT::{data.get('message', 'Please describe a software or technology project.')}",
        )

    required = {"project_title", "project_summary", "mode",
                 "user_stories", "tasks", "warnings", "assumptions_required"}
    missing = required - data.keys()
    if missing:
        raise ValueError(f"missing keys: {missing}")

    # model sometimes omits order — assign from position as fallback
    for i, us in enumerate(data.get("user_stories") or []):
        if "order" not in us:
            us["order"] = i + 1
    for i, t in enumerate(data.get("tasks") or []):
        if "order" not in t:
            t["order"] = i + 1

    # nest tasks into their parent user stories by user_story_id
    # (model outputs tasks as a flat array; frontend expects them nested inside each US)
    tasks_by_us: dict = {}
    for t in data.get("tasks") or []:
        uid = t.get("user_story_id", "")
        tasks_by_us.setdefault(uid, []).append(t)

    for us in data.get("user_stories") or []:
        if not us.get("tasks"):
            us["tasks"] = tasks_by_us.get(us.get("id", ""), [])

    logger.info("parsed: %d stories, %d tasks",
                len(data.get("user_stories") or []),
                len(data.get("tasks") or []))

    # override mode — model sometimes emits non-canonical values like "us+tasks"
    data["mode"] = request_mode
    return data


def build_user_message(request: GenerateRequest) -> str:
    return f"Mode: {request.mode}\n\nProject description:\n{request.description}"


# --- main ---

async def generate_structure(request: GenerateRequest, api_key: str | None = None) -> GenerateResponse:
    key = cache_key(request.description, request.mode)
    cached = get_cached(key)
    if cached:
        logger.info("cache hit")
        return cached.model_copy(update={"meta": MetaInfo(
            generation_time_ms=0,
            cache_hit=True,
            model=cached.meta.model,
        )})

    client = Groq(api_key=api_key or settings.GROQ_API_KEY)
    start = time.time()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_message(request)},
    ]

    last_error = None
    raw = ""

    for attempt in range(3):
        logger.info("attempt %d/3 mode=%s", attempt + 1, request.mode)

        if attempt > 0 and last_error:
            # inject bad response + correction before next call
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": (
                    f"Your previous output was invalid. Issue: {last_error}\n"
                    "Regenerate following the schema exactly. "
                    "Wrap the final JSON in <final></final> tags."
                ),
            })

        try:
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=messages,
                temperature=0.4,
                max_tokens=4000,
            )
            raw = response.choices[0].message.content or ""
            data = parse_and_validate(raw, request.mode)
            latency_ms = int((time.time() - start) * 1000)

            logger.info("ok attempt=%d latency=%dms", attempt + 1, latency_ms)

            result = GenerateResponse(
                **data,
                meta=MetaInfo(
                    generation_time_ms=latency_ms,
                    cache_hit=False,
                    model="openai/gpt-oss-120b",
                ),
            )
            set_cached(key, result)
            return result

        except RateLimitError as e:
            logger.error("groq rate limit exceeded: %s", e)
            wait_match = re.search(r"try again in ([^\.]+)", str(e), re.IGNORECASE)
            wait_time = wait_match.group(1).strip() if wait_match else "a few minutes"
            raise HTTPException(
                status_code=429,
                detail=f"RATE_LIMIT::{wait_time}",
            )

        except APIStatusError as e:
            logger.error("groq api error status=%d: %s", e.status_code, e.message)
            raise HTTPException(
                status_code=502,
                detail=f"AI service error ({e.status_code}): {e.message}",
            )

        except (json.JSONDecodeError, ValueError) as e:
            last_error = str(e)
            logger.warning("attempt %d failed: %s | raw[:200]=%s", attempt + 1, last_error, raw[:200])

    logger.error("all 3 attempts failed: %s", last_error)
    raise HTTPException(
        status_code=422,
        detail=f"AI generation failed after 3 attempts. Last error: {last_error}",
    )
