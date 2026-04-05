import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import httpx

ARXIV_API_URL = "https://export.arxiv.org/api/query"
ATOM_NS = "http://www.w3.org/2005/Atom"


def _strip_version(arxiv_id: str) -> str:
    return re.sub(r"v\d+$", "", arxiv_id.split("/")[-1])


def _parse_entry(entry: ET.Element) -> dict:
    def find(tag: str) -> str:
        el = entry.find(f"{{{ATOM_NS}}}{tag}")
        return el.text.strip() if el is not None and el.text else ""

    raw_id = find("id")
    arxiv_id = _strip_version(raw_id)

    authors = [
        a.findtext(f"{{{ATOM_NS}}}name", "").strip()
        for a in entry.findall(f"{{{ATOM_NS}}}author")
    ]

    categories = [
        el.get("term", "")
        for el in entry.findall(f"{{{ATOM_NS}}}category")
    ]

    published_str = find("published")
    try:
        published_at = datetime.fromisoformat(published_str.replace("Z", "+00:00"))
    except ValueError:
        published_at = datetime.now(timezone.utc)

    return {
        "arxiv_id": arxiv_id,
        "title": find("title").replace("\n", " ").strip(),
        "abstract": find("summary").replace("\n", " ").strip(),
        "authors": authors,
        "categories": categories,
        "published_at": published_at,
        "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf",
        "arxiv_url": f"https://arxiv.org/abs/{arxiv_id}",
    }


def fetch_recent_sync(categories: list[str], max_results: int = 100) -> list[dict]:
    search_query = " OR ".join(f"cat:{c}" for c in categories)
    params = {
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    headers = {"User-Agent": "ScrollAr/0.1 (https://github.com/scrollar; research aggregator)"}

    with httpx.Client(timeout=60.0, follow_redirects=True) as client:
        response = client.get(ARXIV_API_URL, params=params, headers=headers)
        response.raise_for_status()

    root = ET.fromstring(response.text)
    entries = root.findall(f"{{{ATOM_NS}}}entry")
    return [_parse_entry(e) for e in entries]
