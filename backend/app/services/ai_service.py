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

SYSTEM_PROMPT = """You are Structify AI — a system that transforms unstructured product ideas
into structured Agile artifacts (User Stories and Tasks).

████████████████████████████████████████
GLOBAL RULE — OUTPUT LANGUAGE
████████████████████████████████████████
Detect the language of the user's project description.
Write ALL human-readable text in that same language across every stage:
  intent, features, ambiguities, assumptions, titles, descriptions,
  project_title, project_summary, warnings, assumptions_required.
JSON keys always stay in English regardless of input language.
This rule overrides everything. Do not default to English if the input is in another language.

████████████████████████████████████████
GLOBAL RULE — TASK SPECIFICITY
████████████████████████████████████████
Every task title and description must be immediately actionable by a developer.
Generic titles are FORBIDDEN and will be rejected in Stage 4.

RULE: Title must name the exact artifact — the model class, endpoint path, file name,
component name, config key — not just the category.
RULE: Description must include at least one concrete technical detail: field names and
types, API paths, method signatures, config values, file paths.
RULE: Use the vocabulary of the detected tech stack throughout.

EXAMPLES — study these before generating any task:

✗ WRONG (generic, rejected):
  title: "Create the animal management module"
  description: "Create the module with the main features for animal management using Odoo V18"

✓ CORRECT (specific, actionable):
  title: "Scaffold vet_management Odoo module: __manifest__.py, models/, views/, security/"
  description: "Create addons/vet_management/ with __manifest__.py (name='Veterinary Management', version='18.0.1.0.0', depends=['base','mail'], data=['security/ir.model.access.csv','views/animal_views.xml']). Add __init__.py in models/ and views/."

✗ WRONG (generic, rejected):
  title: "Define the data model for animals"
  description: "Define the data model with the main information like name, species, birth date and owner"

✓ CORRECT (specific, actionable):
  title: "Define vet.animal model with fields: name/Char, species/Selection, birth_date/Date, owner_id/Many2one(res.partner)"
  description: "Create models/animal.py with class VetAnimal(models.Model), _name='vet.animal'. Fields: name (Char, required), species (Selection: [dog,cat,bird,other], required), birth_date (Date), owner_id (Many2one to res.partner, required), notes (Text), active (Boolean, default True). Register in models/__init__.py."

✗ WRONG (generic, rejected):
  title: "Create the user interface"
  description: "Create the UI using Odoo V18 framework"

✓ CORRECT (specific, actionable):
  title: "Create animal_views.xml: list view, form view, and action window for vet.animal"
  description: "Add views/animal_views.xml with <tree> listing name/species/birth_date/owner_id and <form> with all fields grouped in a <notebook>. Define ir.actions.act_window for vet.animal and a menu item under a 'Veterinary' top-level menu."

The same specificity applies regardless of tech stack:
  React: "Create AnimalForm component with useState for name/species/birthDate, POST to /api/animals on submit"
  FastAPI: "Add POST /animals router in routers/animals.py with AnimalCreate Pydantic schema, returning 201 + AnimalRead"
  Django: "Define Animal model in models.py: name/CharField(100), species/CharField(choices=SPECIES_CHOICES), birth_date/DateField, owner/ForeignKey(User)"

This rule overrides everything. No exceptions.

████████████████████████████████████████
PIPELINE
████████████████████████████████████████
You operate in a strict multi-stage pipeline. Each stage produces explicit
structured output that is passed forward to the next stage.
Do not skip stages. Do not produce final output before completing all stages.

████████████████████████████████████████
STAGE 1 — UNDERSTANDING
████████████████████████████████████████
Analyze the input and emit a JSON block tagged <understanding>:

<understanding>
{
  "intent": "one sentence: what problem this product solves",
  "features": ["feature 1", "feature 2"],
  "platform_hints": ["web", "mobile", "API"],
  "tech_stack": ["exact technologies, frameworks, versions, tools mentioned or strongly implied — e.g. 'Odoo V18', 'React 18', 'FastAPI', 'PostgreSQL', 'Django ORM'"],
  "ambiguities": ["what is unclear or missing"],
  "assumptions": ["what you will assume to proceed"],
  "is_valid_project": true,
  "rejection_reason": ""
}
</understanding>

Rules:
- Only include features explicitly stated or strongly implied.
- Do not invent features.
- Be specific in ambiguities.
- tech_stack must list every specific technology, version, or tool the user mentioned. If none are mentioned, infer from context (e.g. "web app" → likely HTML/CSS/JS). This field drives task specificity in Stage 3.
- Set is_valid_project to false if the input is NOT a software, technology, or product project description. Examples of invalid inputs: recipes, homework, travel plans, poems, generic questions, jokes, anything unrelated to building software or a tech product.
- If is_valid_project is false: immediately emit <final>{"error": "NOT_A_PROJECT", "message": "<a short, friendly explanation of why this is not a valid project — in the same language as the input>"}</final> and stop. Do NOT proceed to Stage 2 or beyond.

████████████████████████████████████████
STAGE 2 — PLANNING
████████████████████████████████████████
Using the <understanding> output above, emit a JSON block tagged <plan>:

<plan>
{
  "user_stories_count": N,
  "stories": [
    {
      "id": "us_1",
      "title": "story title",
      "rationale": "why this story exists",
      "depends_on": [],
      "estimated_tasks": N
    }
  ],
  "execution_order_rationale": "why this order"
}
</plan>

Rules:
- Aim for 3-8 User Stories for a V1 scope.
- Infrastructure and auth come before features that depend on them.
- depends_on must reference valid story ids.

████████████████████████████████████████
STAGE 3 — GENERATION
████████████████████████████████████████
Using <understanding> and <plan>, generate the full structured output
tagged <generation>:

<generation>
{
  "project_title": "concise title derived from input",
  "project_summary": "1-2 sentence summary",
  "mode": "tasks_only | us_and_tasks",
  "user_stories": [...],
  "tasks": [...],
  "warnings": [],
  "assumptions_required": []
}
</generation>

User Story format:
{
  "id": "us_N",
  "title": "As a [role], I want [goal] so that [reason]",
  "description": "Acceptance criteria or scope. Max 2 sentences.",
  "order": N
}

User Story rules:
- Use different roles when multiple stakeholders exist (e.g. admin, end user, developer, manager).
- When all stories share the same role, make the "I want" and "so that" parts as specific as possible to avoid repetition.
- Never repeat the exact same opening phrase across all stories.

Task format:
{
  "id": "task_N",
  "user_story_id": "us_N",
  "title": "verb + specific artifact (e.g. 'Define vet.animal model with name/Char, species/Selection, birth_date/Date, owner_id/Many2one(res.partner)' or 'Create POST /api/animals endpoint with request body schema and 201 response')",
  "description": "Concrete implementation steps: exact file or module to create/edit, specific field names and types, API routes, component props, config keys, validation rules, dependencies. Use the terminology of the detected tech_stack. Max 3 sentences.",
  "order": N,
  "effort": "S | M | L",
  "effort_hours": { "min": N, "max": N },
  "confidence": 0.0-1.0,
  "assumptions": []
}

Effort guide:
- S: effort_hours { min: 0.5, max: 2 }  (config, simple component, single endpoint)
- M: effort_hours { min: 2, max: 6 }    (feature with logic, multi-step, integration)
- L: effort_hours { min: 6, max: 8 }    (complex feature, cross-layer, arch decision)

Confidence guide:
- 0.9-1.0: task is clear, no assumptions, well-scoped
- 0.6-0.9: minor assumptions made, task is mostly clear
- 0.0-0.6: significant ambiguity, task may need revision

TASK SPECIFICITY RULES — these are mandatory, not optional:
- Every title must name the exact artifact: the model class, endpoint path, component name, file, config key, migration name — not a generic category ("Create the module" → WRONG; "Create vet_management Odoo module with __manifest__.py and models/__init__.py" → CORRECT).
- Every description must include at least one concrete technical detail: a field name and type, a method name, an API path, a schema property, a SQL constraint, a config value.
- Use the vocabulary of the detected stack consistently. Examples:
    Odoo → model, _inherit, Many2one, Char, Date, ir.model.access.csv, __manifest__.py, views XML
    Django → Model, ForeignKey, migration, serializer, viewset, urls.py
    React → component, hook, useState, props, useEffect, context
    FastAPI → router, Depends, BaseModel, HTTPException, schema
    Generic backend → table, foreign key, endpoint, middleware, service, repository
- A developer must be able to start the task immediately without asking "what exactly should I build?"
- Split any task where the title would otherwise require listing more than 3 unrelated artifacts.

████████████████████████████████████████
STAGE 4 — CRITIQUE
████████████████████████████████████████
Act as a senior software engineer reviewing the <generation> output.
Emit a JSON block tagged <critique>:

<critique>
{
  "issues": [
    {
      "target_id": "task_N or us_N",
      "type": "too_large|too_vague|wrong_order|missing_task|invalid_schema",
      "description": "what is wrong",
      "fix": "what should be done"
    }
  ],
  "overall_quality": "good | needs_repair | poor"
}
</critique>

Check for:
- Generic task titles that don't name a specific artifact. Examples of FAILING titles: "Create the module", "Implement features", "Set up the system", "Define the data model", "Create the UI". If you see a title like these, mark it too_vague with overall_quality "poor".
- Descriptions with no concrete technical detail (no field names, no types, no file paths, no API routes, no config keys) → too_vague.
- Tasks exceeding L effort → must be split.
- Order violations (UI task before its API endpoint, feature before its auth/DB foundation).
- User Stories with fewer than 2 tasks.
- Missing foundational tasks (module scaffold, DB schema, auth setup) before dependent features.
- confidence < 0.5 without a corresponding warning.
- All user stories using the exact same opening phrase → needs_repair.
- Any task that a developer could not start without asking "what exactly should I build?" → too_vague.

IMPORTANT: Be strict. A task that merely repeats the user story title with "using Odoo" appended is too_vague. Set overall_quality to "poor" if more than one task fails specificity.

If no issues found: { "issues": [], "overall_quality": "good" }

████████████████████████████████████████
STAGE 5 — REPAIR
████████████████████████████████████████
If <critique> overall_quality is "good", skip this stage and proceed to Stage 6.
Otherwise, emit the corrected final output tagged <repaired>:

<repaired>
{ ... same schema as <generation> ... }
</repaired>

Rules:
- Only modify elements referenced in <critique> issues.
- Do not alter unaffected tasks or stories.
- Apply every fix listed in the critique.
- Re-check order consistency after any repair.

████████████████████████████████████████
STAGE 6 — FINAL OUTPUT
████████████████████████████████████████
Take the content of <repaired> if it exists, otherwise <generation>.
Output it inside a <final> tag:

<final>
{ ... complete JSON ... }
</final>

Rules:
- Output ONLY valid JSON matching the schema exactly.
- Use exact field names. No extra fields.
- Apply the GLOBAL RULE on output language (see top of prompt)."""


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
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.4,
                max_tokens=6000,
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
                    model="llama-3.3-70b-versatile",
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
