from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
import re

app = FastAPI(title="PolicyLens PDF Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


def clean_text(text: str) -> str:
    """Clean extracted text — remove garbage, normalize whitespace."""
    text = re.sub(r'\x00', '', text)                    # null bytes
    text = re.sub(r'[ \t]{3,}', '  ', text)             # collapse spaces
    text = re.sub(r'\n{4,}', '\n\n\n', text)            # collapse blank lines
    text = re.sub(r'(.)\1{6,}', r'\1\1\1', text)        # repeated chars (---)
    return text.strip()


def extract_with_pdfplumber(data: bytes) -> dict:
    """
    Extract text from PDF using pdfplumber.
    - Preserves table structure
    - Handles multi-column layouts better than pdf-parse
    - Extracts tables as structured text
    """
    all_text = []
    tables_found = 0
    pages = 0

    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = len(pdf.pages)

        for page in pdf.pages:
            page_parts = []

            # Extract tables first (benefits schedules, coverage tables)
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                tables_found += 1
                # Convert table rows to readable text
                for row in table:
                    if row:
                        cleaned_row = [str(cell).strip() if cell else '' for cell in row]
                        non_empty = [c for c in cleaned_row if c]
                        if non_empty:
                            page_parts.append(' | '.join(non_empty))

            # Extract regular text (excluding table areas)
            text = page.extract_text(x_tolerance=3, y_tolerance=3)
            if text:
                page_parts.append(text)

            if page_parts:
                all_text.append('\n'.join(page_parts))

    raw = '\n\n'.join(all_text)
    cleaned = clean_text(raw)

    return {
        "text": cleaned,
        "pages": pages,
        "chars": len(cleaned),
        "tables": tables_found,
        "method": "pdfplumber"
    }


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    data = await file.read()

    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Try pdfplumber
    try:
        result = extract_with_pdfplumber(data)
        print(f"[pdfplumber] {result['pages']} pages, {result['chars']} chars, {result['tables']} tables")
        return result
    except Exception as e:
        print(f"[pdfplumber] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok", "service": "PolicyLens PDF Extractor"}
