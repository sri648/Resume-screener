from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is working"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return {"filename": file.filename, "extracted_text": text}

@app.post("/match")
async def match_resume(resume_text: str = Form(...), job_description: str = Form(...)):
    documents = [resume_text, job_description]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(documents)
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    match_percentage = round(similarity * 100, 2)

    job_words = set(vectorizer.build_analyzer()(job_description))
    resume_words = set(vectorizer.build_analyzer()(resume_text))

    matched_keywords = sorted(list(job_words & resume_words))[:10]
    missing_keywords = sorted(list(job_words - resume_words))[:10]

    return {
        "match_score": match_percentage,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
    }