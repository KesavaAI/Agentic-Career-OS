import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.azure_key = settings.AZURE_OPENAI_API_KEY
        self.azure_endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.azure_deployment = settings.AZURE_OPENAI_DEPLOYMENT_NAME
        self.model = settings.OPENAI_MODEL

    def generate_completion(self, system_prompt: str, user_prompt: str, temperature: float = 0.4) -> str:
        # 1. Try Gemini API if key is present
        if self.gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                payload = {
                    "system_instruction": {"parts": [{"text": system_prompt}]},
                    "contents": [{"parts": [{"text": user_prompt}]}],
                    "generationConfig": {"temperature": temperature, "maxOutputTokens": 400}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    if text and text.strip():
                        return text.strip()
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        # 2. Try Groq API if key is present
        if self.groq_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": 400
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.groq_key}"
                    }
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["choices"][0]["message"]["content"]
                    if text and text.strip():
                        return text.strip()
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}")

        # 3. Try OpenAI if key is present
        if self.openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_key)
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"OpenAI call failed: {e}")

        # 4. Try Azure OpenAI if configured
        if self.azure_key and self.azure_endpoint:
            try:
                from openai import AzureOpenAI
                client = AzureOpenAI(
                    api_key=self.azure_key,
                    api_version="2024-02-01",
                    azure_endpoint=self.azure_endpoint
                )
                response = client.chat.completions.create(
                    model=self.azure_deployment or "gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"Azure OpenAI call failed: {e}")

        return ""

ai_service = AIService()
