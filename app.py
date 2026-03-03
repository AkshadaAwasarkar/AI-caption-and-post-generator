from flask import Flask, render_template, request, jsonify
from ai.generator import AIGenerator
import os

app = Flask(__name__)
ai = AIGenerator()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/favicon.ico")
def favicon():
    return "", 204

@app.route("/generate", methods=["POST"])
def generate():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    # Get form fields
    platform = request.form.get("platform", "Instagram")
    tone = request.form.get("tone", "Professional")
    description = request.form.get("description", "")
    use_emojis = request.form.get("emoji_option") == "Yes"
    use_hashtags = request.form.get("hashtag_option") == "Yes"

    # Read image
    image_data = image_file.read()
    mime_type = image_file.content_type

    # Generate using AI module
    result = ai.generate_post(
        image_data, mime_type, platform, tone, 
        description, use_emojis, use_hashtags
    )

    if "error" in result:
        # Handle specific error codes if needed, 401 for key issues
        status = 401 if "API key" in result["error"] else 500
        return jsonify(result), status

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
