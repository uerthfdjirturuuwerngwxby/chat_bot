import os
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv  # <-- this is needed

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("models/gemini-1.5-flash")

# Extract text from a PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Generate summary in clear multiline format
def get_summary(text, length='medium', style='concise'):
    prompt = (
        f"Summarize understand the images also the following PDF document in {length} length and {style} style.\n"
        "Use numbered points or paragraphs, and make sure each point starts on a **new line**.\n"
        "Avoid any special characters like *, -, or symbols.\n\n"
        f"Document:\n{text}"
    )
    response = model.generate_content(prompt)
    return response.text.replace('\\n', '\n')  # Clean any literal \n from model

# Chatbot-style Q&A with line-break formatting
def get_chat_answer(context_text, user_question):
    prompt = (
        "You are an AI assistant answering questions based only on the document below.\n"
        "Make sure your answer is in a paragraph or numbered format, and each point is separated by a new line.\n"
        "Avoid using symbols like *, -, or emojis.\n\n"
        f"Document:\n{context_text}\n\n"
        f"Question: {user_question}\n\n"
        "Answer:"
    )
    response = model.generate_content(prompt)
    return response.text.replace('\\n', '\n')




# AIzaSyDaahecpMvpu5ToKIFhvCSakA6MlHoq7PA