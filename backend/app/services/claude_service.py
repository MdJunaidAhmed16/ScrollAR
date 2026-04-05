import json
import re

from openai import OpenAI

from app.config import settings


class ClaudeParseError(Exception):
    pass


SUMMARY_PROMPT = """\
You are a science communicator. Given this arXiv paper, produce a JSON object with exactly these fields:

- "hook": A catchy one-liner (max 15 words) that makes someone want to read more. Think tweet bait.
- "eli5": 2-sentence plain-English explanation a smart 15-year-old would understand.
- "key_finding": The single most important result in 1 sentence.
- "why_it_matters": Real-world implication in 1 sentence.
- "tags": Array of 3-5 lowercase topic tags (e.g. "reinforcement-learning", "llm", "robotics", "computer-vision").
- "difficulty": One of exactly: "beginner", "intermediate", or "advanced".
- "key_contributions": Array of 3-5 bullet strings summarizing contributions.

Respond with ONLY valid JSON, no markdown, no preamble.

Paper Title: {title}

Abstract: {abstract}
"""


def generate_card_content(title: str, abstract: str) -> dict:
    client = OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": settings.OPENROUTER_SITE_URL,
            "X-Title": settings.OPENROUTER_SITE_NAME,
        },
    )

    prompt = SUMMARY_PROMPT.format(title=title, abstract=abstract)

    response = client.chat.completions.create(
        model=settings.OPENROUTER_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if model wraps response
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ClaudeParseError(f"Failed to parse Claude response as JSON: {e}\nRaw: {raw[:500]}")

    required = {"hook", "eli5", "key_finding", "why_it_matters", "tags", "difficulty", "key_contributions"}
    missing = required - set(data.keys())
    if missing:
        raise ClaudeParseError(f"Claude response missing fields: {missing}")

    # Normalize
    if data["difficulty"] not in ("beginner", "intermediate", "advanced"):
        data["difficulty"] = "intermediate"
    if not isinstance(data["tags"], list):
        data["tags"] = []
    if not isinstance(data["key_contributions"], list):
        data["key_contributions"] = []

    return data
