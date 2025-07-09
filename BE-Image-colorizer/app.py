from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from werkzeug.utils import secure_filename
from tensorflow.keras.models import model_from_json
import cv2

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
MODEL_PATH = 'model/generator_finished_25.keras'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

config_path = os.path.join(MODEL_PATH, 'config.json')
with open(config_path, 'r') as config_file:
    model_config = config_file.read()
generator = model_from_json(model_config)
weights_path = os.path.join(MODEL_PATH, 'model.weights.h5')
generator.load_weights(weights_path)

def process_image(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    img = cv2.resize(img, (128, 128))
    img = (img.astype('float32')) / 255.0
    img = 2 * img - 1
    lightness = img[:, :, 0:1]

    generated = generator.predict(np.expand_dims(lightness, axis=0))[0]
    
    output_image = np.zeros((128, 128, 3))
    output_image[:, :, 0:1] = (lightness + 1) * 255 / 2
    output_image[:, :, 1:] = (generated + 1) * 255 / 2
    output_image = cv2.cvtColor(output_image.astype('uint8'), cv2.COLOR_Lab2BGR)
    
    return output_image

@app.route('/colorize', methods=['POST'])
def colorize():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(input_path)

    try:
        output_image = process_image(input_path)
        output_filename = f"colorized_{filename}"
        output_path = os.path.join(app.config['RESULT_FOLDER'], output_filename)
        cv2.imwrite(output_path, output_image)

        return jsonify({'processedImageUrl': f"http://127.0.0.1:5000/results/{output_filename}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/results/<filename>')
def serve_result(filename):
    return send_from_directory(app.config['RESULT_FOLDER'], filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
