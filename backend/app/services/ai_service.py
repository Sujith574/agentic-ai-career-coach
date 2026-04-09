import json
import os
from typing import Any, List, Dict
from openai import OpenAI
import httpx

class AIService:
    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        # Using official client
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def _chat_completion(self, prompt: str) -> str:
        if not self.client:
            raise RuntimeError("OPENAI_API_KEY not configured")

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a precise JSON-first career coach assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            response_format={ "type": "json_object" }
        )
        return response.choices[0].message.content or ""

    def analyze_resume(self, resume_text: str) -> dict[str, Any]:
        prompt = f"""Analyze this resume and return JSON.
        Extraction requirements:
        - skills (list of strings)
        - missing_skills (list of strings)
        - projects (number)
        - experience_level (Beginner, Intermediate, Senior)
        - suggested_roles (list of strings)
        - placement_probability (0-100)

        Resume Content:
        {resume_text}

        Return JSON format:
        {{
          "skills": [],
          "missing_skills": [],
          "projects": 0,
          "experience_level": "",
          "suggested_roles": [],
          "placement_probability": 0
        }}"""
        try:
            raw = self._chat_completion(prompt)
            return json.loads(raw)
        except Exception as e:
            print(f"Resume analysis error: {e}")
            return {
                "skills": ["HTML", "CSS"],
                "missing_skills": ["DSA", "React"],
                "projects": 1,
                "experience_level": "Beginner",
                "suggested_roles": ["Frontend Developer"],
                "placement_probability": 50
            }

    def generate_mock_questions(self, profile: dict[str, Any]) -> dict[str, List[str]]:
        prompt = f"""Generate 3 technical and 2 HR interview questions for this profile:
        {json.dumps(profile)}
        Return JSON: {{ "technical": [], "hr": [] }}"""
        try:
            raw = self._chat_completion(prompt)
            return json.loads(raw)
        except Exception:
            return {
                "technical": ["Explain polymorphism.", "What is a closure?", "How does TCP work?"],
                "hr": ["Where do you see yourself in 5 years?", "Tell me about a challenge you faced."]
            }
