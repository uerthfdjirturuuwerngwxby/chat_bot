import os
import fitz  # PyMuPDF
try:
    from docx import Document
except ImportError:
    Document = None
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

def get_groq_client():
    if not groq_api_key:
        raise RuntimeError(
            "Missing GROQ_API_KEY. Add it in Vercel Project Settings → Environment Variables."
        )
    return Groq(api_key=groq_api_key)

# Extract text from a PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_document(file_path):
    extension = os.path.splitext(file_path)[1].lower()
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    if extension == '.txt':
        with open(file_path, 'r', encoding='utf-8', errors='replace') as text_file:
            return text_file.read()
    if extension == '.docx':
        if Document is None:
            raise ValueError(
                'DOCX support needs the python-docx package. Run: python -m pip install python-docx'
            )
        document = Document(file_path)
        return '\n'.join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError('Supported files are PDF, DOCX, and TXT.')

# Generate summary in clear multiline format
def get_summary(text, length='medium', style='concise'):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a professional summarization assistant. Create polished, easy-to-read summaries from PDF content. "
                "Return valid Markdown only. Always start with exactly '## Summary', followed by a clear section heading. "
                "Never use bold text alone as a heading and never output stray asterisks. Respect the requested format exactly: use concise numbered points only when point-wise is requested, otherwise use short connected paragraphs without lists. "
                "For medium summaries, provide 4–5 clear ideas. For long summaries, include a brief introduction and detailed explanation. "
                "Keep the language simple, precise, and based fully on the document."
            )
        },
        {
            "role": "user",
            "content": (
                f"Summarize the following PDF document in {length} length and {style} style. "
                f"Use headings and subheadings. The requested output style is {style}: if it is 'points', organize it into numbered points; if it is 'paragraph', use readable paragraphs with no bullets or numbered lists. "
                "Keep the language simple, clear, and professional. "
                "If the document references images, note that the summary is based only on the text content.\n\n"
                f"Document:\n{text}"
            )
        }
    ]
    response = get_groq_client().chat.completions.create(
        model=groq_model,
        messages=messages,
        temperature=0.7,
        max_completion_tokens=1200,
        top_p=1,
        reasoning_effort="medium",
        stream=False,
        stop=None,
    )
    return response.choices[0].message.content.strip()

# Chatbot-style Q&A with line-break formatting
def get_chat_answer(context_text, user_question):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a conversational AI assistant that answers questions professionally using only the provided document. "
                "Begin with a heading such as '## Answer' and add a subheading when helpful. "
                "Respond in clear sentences and use short numbered points or summary bullets where appropriate. "
                "If the answer is not in the document, say that the document does not contain that information."
            )
        },
        {
            "role": "user",
            "content": (
                f"Document:\n{context_text}\n\n"
                f"Question: {user_question}"
            )
        }
    ]
    response = get_groq_client().chat.completions.create(
        model=groq_model,
        messages=messages,
        temperature=0.68,
        max_completion_tokens=1100,
        top_p=1,
        reasoning_effort="medium",
        stream=False,
        stop=None,
    )
    return response.choices[0].message.content.strip()
