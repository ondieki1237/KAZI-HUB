from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load the AI model (GPT-2)
cv_generator = pipeline("text-generation", model="gpt2")

@app.route('/api/cv-maker/generate', methods=['POST'])
def generate_cv():
    try:
        data = request.json
        
        cv_prompt = f"""
        Generate a professional CV for a blue-collar worker with the following details:

        Name: {data['name']}
        Trade/Profession: {data['profession']}
        Contact: {data['email']} | {data['phone']}

        Technical Training & Certifications:
        {data['education']}

        Hands-on Experience:
        {data['experience']}

        Technical Skills & Equipment:
        {data['skills']}

        Notable Achievements:
        {data['achievements']}

        Languages: {data['languages']}

        Trade-Related Interests:
        {data['interests']}

        Format the CV to emphasize practical skills, safety certifications, and hands-on experience.
        Focus on concrete achievements and technical capabilities.
        """

        cv_text = cv_generator(cv_prompt, max_length=1000, num_return_sequences=1)[0]['generated_text']
        
        return jsonify({
            'success': True,
            'cv_text': cv_text
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5001)
