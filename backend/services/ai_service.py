import json
import os
from typing import Any

import requests

DEMO_RESUME_JSON = {
    "skills": ["HTML", "CSS"],
    "missing_skills": ["DSA", "React"],
    "projects": 1,
    "experience_level": "Beginner",
    "suggested_roles": ["Frontend Developer"],
    "placement_probability": 55,
    "resume_text": "Demo profile with no internship experience.",
}


class AIService:
    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    def _chat_completion(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY not configured")

        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a precise JSON-first assistant for a career coaching app.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=40,
        )
        response.raise_for_status()
        data = response.json()
        return (data.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()

    def analyze_resume(self, resume_text: str) -> dict[str, Any]:
        if not resume_text.strip():
            return DEMO_RESUME_JSON

        prompt = f"""Analyze this resume and return ONLY JSON.

Extract:

* skills
* missing_skills
* number of projects
* experience level
* suggested roles
* placement probability (0-100)

Resume: <TEXT>
{resume_text}

Return ONLY JSON with this exact schema:
{{
  "skills": [],
  "missing_skills": [],
  "projects": 0,
  "experience_level": "",
  "suggested_roles": [],
  "placement_probability": 0
}}"""
        try:
            raw = self._chat_completion(prompt).strip()
            data = json.loads(raw)
            data["resume_text"] = resume_text
            return self._normalize_resume_response(data)
        except Exception:
            fallback = dict(DEMO_RESUME_JSON)
            fallback["resume_text"] = resume_text or DEMO_RESUME_JSON["resume_text"]
            return fallback

    def mentor_chat(self, message: str, context: dict[str, Any]) -> str:
        prompt = f"""You are an AI career coach.

Resume data: {json.dumps(context)}

User question: <MESSAGE>
{message}

Give direct, actionable advice based on the data."""
        try:
            return self._chat_completion(prompt).strip()
        except Exception:
            return (
                "Focus on DSA, strengthen project depth, and apply consistently. "
                "This week: solve 50 DSA questions, ship one portfolio-worthy project module, "
                "and apply to at least 10 internship/job openings."
            )

    def mock_interview_questions(self, profile: dict[str, Any]) -> dict[str, list[str]]:
        prompt = f"""Generate:

* 3 technical interview questions
* 2 HR questions

Based on this profile: <JSON>
{json.dumps(profile)}

Return JSON only:
{{
"technical": [],
"hr": []
}}"""
        try:
            raw = self._chat_completion(prompt).strip()
            data = json.loads(raw)
            technical = data.get("technical", [])[:3]
            hr = data.get("hr", [])[:2]
            if technical and hr:
                return {"technical": technical, "hr": hr}
        except Exception:
            pass

        return {
            "technical": [
                "How would you optimize a Flask API endpoint for high traffic?",
                "Explain time complexity differences between list and hash map lookups.",
                "How would you structure a React app for reusable state management?",
            ],
            "hr": [
                "Tell me about a time you solved a difficult problem.",
                "Why do you want to join our company?",
            ],
        }

    @staticmethod
    def _normalize_resume_response(data: dict[str, Any]) -> dict[str, Any]:
        return {
            "skills": data.get("skills", []),
            "missing_skills": data.get("missing_skills", []),
            "projects": int(data.get("projects", data.get("number_of_projects", 0)) or 0),
            "experience_level": data.get("experience_level", "Beginner"),
            "suggested_roles": data.get("suggested_roles", []),
            "placement_probability": max(
                0, min(100, int(data.get("placement_probability", 0) or 0))
            ),
            "resume_text": data.get("resume_text", ""),
        }
