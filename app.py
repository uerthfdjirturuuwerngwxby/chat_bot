import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from gemini_utils import extract_text_from_document, get_summary, get_chat_answer

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

chat_context = {"text": ""}  # Shared across sessions (for demo)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/result', methods=['POST'])
def result():
    try:
        file = request.files['pdf']
        summary_length = request.form.get('summary_length', 'medium')
        summary_style = request.form.get('summary_style', 'concise')

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        full_text = extract_text_from_document(filepath)
        chat_context["text"] = full_text  # Save for chatbot

        summary = get_summary(full_text, summary_length, summary_style)

        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json['message'].strip()
        basic_replies = {
            "hi": "Hi! How can I help you today? You can upload a PDF or ask me a general question.",
            "hello": "Hello! What would you like to explore today?",
            "hey": "Hey! I am here to help with your documents and questions.",
            "bye": "Goodbye! Come back whenever you need help understanding a document.",
            "thank you": "You are welcome!",
            "thanks": "You are welcome!",
        }
        simple_message = user_message.lower().strip("!. ")
        if simple_message in basic_replies:
            return jsonify({"answer": basic_replies[simple_message]})
        if not chat_context["text"]:
            return jsonify({"answer": "I can help with general questions. Upload a PDF whenever you would like answers based on a document."})
        answer = get_chat_answer(chat_context["text"], user_message)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": f"Error: {str(e)}"})

if __name__ == '__main__':
    app.run(debug=True)
