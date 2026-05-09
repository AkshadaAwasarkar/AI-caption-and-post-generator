import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIGenerator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("API_KEY") or "YOUR_API_KEY"
        self.model = self._initialize_model()

    def _initialize_model(self):
        """Finds and initializes a working Gemini model."""
        if not self.api_key or self.api_key == "YOUR_API_KEY":
            return None
            
        genai.configure(api_key=self.api_key)
        
        # Prioritize the successfully tested models
        MODELS_TO_TRY = [
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest'
        ]
        
        for name in MODELS_TO_TRY:
            try:
                model = genai.GenerativeModel(name)
                # We skip the connectivity test here to prevent hang on startup
                print(f"AI Generator initialized with: {name}")
                return model
            except Exception:
                continue
        return None

    def generate_post(self, image_data, mime_type, platform, tone, description, use_emojis, use_hashtags):
        """Sends prompt and image to Gemini and returns parsed JSON."""
        if not self.model:
            return {"error": "AI Model not initialized. Check your API key."}

        prompt = f"""
You are an AI social media content assistant.

Analyze the uploaded image carefully.
Understand:
- Main subject
- Mood
- Activity
- Theme

Generate:
1. Short caption (max 25 words)
2. Alternative caption
3. Full post (100-150 words)
4. 5 relevant hashtags

Platform: {platform}
Tone: {tone}
Additional user description: {description}
Include emojis: {"Yes" if use_emojis else "No"}
Include hashtags: {"Yes" if use_hashtags else "No"}

Rules:
- Do not literally describe the image.
- Make it engaging and natural.
- Avoid generic AI phrases.
- Return response in JSON format only:
{{
  "caption": "",
  "alternative_caption": "",
  "post": "",
  "hashtags": []
}}
"""
        try:
            contents = [
                prompt,
                {"mime_type": mime_type, "data": image_data}
            ]
            response = self.model.generate_content(contents)
            
            # Parse JSON
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "", 1).replace("```", "", 1).strip()
            
            import json
            return json.loads(text)
        except Exception as e:
            return {"error": str(e)}
