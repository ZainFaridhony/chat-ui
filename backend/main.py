import logging
import os
from typing import List, Optional

import openai
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Chat API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(
    text: str = Form(...),
    files: Optional[List[UploadFile]] = File(default=None),
):
    if not text:
        raise HTTPException(status_code=400, detail="Text input is required")

    if files:
        for file in files:
            content_type = file.content_type or "unknown"
            size = 0
            if file.size is not None:
                size = file.size
            else:
                contents = await file.read()
                size = len(contents)
                await file.seek(0)
            logger.info("Received file: %s (%s, %d bytes)", file.filename, content_type, size)

    if not openai.api_key:
        logger.error("OPENAI_API_KEY is not set")
        raise HTTPException(status_code=500, detail="OpenAI API key is not configured")

    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that responds with clear, well-formatted Markdown.",
                },
                {"role": "user", "content": text},
            ],
        )
    except openai.error.OpenAIError as exc:  # type: ignore[attr-defined]
        logger.exception("OpenAI API request failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    ai_message = completion.choices[0].message["content"].strip()

    return JSONResponse({"response": ai_message})
