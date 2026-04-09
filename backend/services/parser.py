from io import BytesIO

from pypdf import PdfReader


def extract_resume_text(file_storage) -> str:
    """Extract text from uploaded PDF file."""
    if not file_storage:
        return ""

    file_bytes = file_storage.read()
    if not file_bytes:
        return ""

    reader = PdfReader(BytesIO(file_bytes))
    pages_text = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            pages_text.append(text.strip())

    return "\n".join(pages_text).strip()
