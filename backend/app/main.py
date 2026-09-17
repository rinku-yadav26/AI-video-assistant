import os
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# Make the existing project root importable when this API is started from backend/.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from main import run_pipeline  # noqa: E402
from core.rag_engine import ask_question  # noqa: E402

app = FastAPI(title="AI Video Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory RAG state for a single-user/demo deployment.

current_rag_chain = None


class AnalyzeRequest(BaseModel):
    source: str
    language: str = "english"


class ChatRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "AI Video Assistant API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    global current_rag_chain

    if not request.source.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Please provide a valid URL.")

    if request.language not in {"english", "hinglish"}:
        raise HTTPException(status_code=400, detail="Language must be english or hinglish.")

    try:
        result = run_pipeline(request.source, request.language)
        current_rag_chain = result["rag_chain"]

        return {
            "title": result["title"],
            "transcript": result["transcript"],
            "summary": result["summary"],
            "action_items": result["action_items"],
            "key_decisions": result["key_decisions"],
            "open_questions": result["open_questions"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    language: str = Form("english"),
):
    global current_rag_chain

    if language not in {"english", "hinglish"}:
        raise HTTPException(status_code=400, detail="Language must be english or hinglish.")

    suffix = Path(file.filename or "").suffix.lower()
    allowed = {".mp3", ".wav", ".m4a", ".mp4", ".mov", ".webm", ".mkv"}

    if suffix not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported media format.")

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp_path = temp.name

            while chunk := await file.read(1024 * 1024):
                temp.write(chunk)

        result = run_pipeline(temp_path, language)
        current_rag_chain = result["rag_chain"]

        return {
            "title": result["title"],
            "transcript": result["transcript"],
            "summary": result["summary"],
            "action_items": result["action_items"],
            "key_decisions": result["key_decisions"],
            "open_questions": result["open_questions"],
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass


@app.post("/api/chat")
def chat(request: ChatRequest):
    if not current_rag_chain:
        raise HTTPException(
            status_code=400,
            detail="Analyze a video first before using meeting chat.",
        )

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer = ask_question(current_rag_chain, request.question.strip())
        return {"answer": answer}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
