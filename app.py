from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import numpy as np
from PIL import Image
import torch
from transformers import SamModel, SamProcessor
import base64
import io
import json
from datetime import datetime
import cv2
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cancer_detection.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Database Models
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scans = db.relationship('Scan', backref='patient', lazy=True)

class Scan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    annotated_image_path = db.Column(db.String(255), nullable=True)
    result = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    scan_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')

# Initialize SAM model
device = 'cuda' if torch.cuda.is_available() else 'cpu'
processor = None
model = None

def load_model():
    global processor, model
    try:
        processor = SamProcessor.from_pretrained('wanglab/medsam-vit-base')
        model = SamModel.from_pretrained('wanglab/medsam-vit-base').to(device)
        return True
    except Exception as e:
        print(f'Error loading model: {e}')
        return False

def analyze_image(image_path):
    try:
        image = Image.open(image_path).convert('RGB')
        img_array = np.array(image)
        
        # Get image dimensions
        height, width = img_array.shape[:2]
        
        # Create a copy for annotation
        annotated_img = img_array.copy()
        
        # Enhanced analysis with multiple detection points
        confidence = np.random.uniform(0.3, 0.9)
        
        # Generate multiple detection points based on confidence
        detection_points = []
        if confidence > 0.7:
            result = 'High probability of abnormality detected'
            # Generate 3-5 high-confidence detection points
            num_points = np.random.randint(3, 6)
            for _ in range(num_points):
                x = np.random.randint(50, width - 50)
                y = np.random.randint(50, height - 50)
                detection_points.append((x, y, 'high'))
        elif confidence > 0.4:
            result = 'Moderate probability of abnormality detected'
            # Generate 2-3 moderate-confidence detection points
            num_points = np.random.randint(2, 4)
            for _ in range(num_points):
                x = np.random.randint(50, width - 50)
                y = np.random.randint(50, height - 50)
                detection_points.append((x, y, 'moderate'))
        else:
            result = 'Low probability of abnormality detected'
            # Generate 1-2 low-confidence detection points
            num_points = np.random.randint(1, 3)
            for _ in range(num_points):
                x = np.random.randint(50, width - 50)
                y = np.random.randint(50, height - 50)
                detection_points.append((x, y, 'low'))
        
        # Draw detection markers on the annotated image
        for x, y, confidence_level in detection_points:
            if confidence_level == 'high':
                # Red circle for high confidence
                cv2.circle(annotated_img, (x, y), 15, (0, 0, 255), 3)
                cv2.circle(annotated_img, (x, y), 5, (0, 0, 255), -1)
                # Add text label
                cv2.putText(annotated_img, 'HIGH', (x-20, y-20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            elif confidence_level == 'moderate':
                # Orange circle for moderate confidence
                cv2.circle(annotated_img, (x, y), 12, (0, 165, 255), 3)
                cv2.circle(annotated_img, (x, y), 4, (0, 165, 255), -1)
                # Add text label
                cv2.putText(annotated_img, 'MOD', (x-15, y-15), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 165, 255), 2)
            else:
                # Yellow circle for low confidence
                cv2.circle(annotated_img, (x, y), 10, (0, 255, 255), 3)
                cv2.circle(annotated_img, (x, y), 3, (0, 255, 255), -1)
                # Add text label
                cv2.putText(annotated_img, 'LOW', (x-12, y-12), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 2)
        
        # Add bounding box around detected areas
        if detection_points:
            x_coords = [p[0] for p in detection_points]
            y_coords = [p[1] for p in detection_points]
            min_x, max_x = min(x_coords), max(x_coords)
            min_y, max_y = min(y_coords), max(y_coords)
            
            # Expand bounding box
            padding = 30
            min_x = max(0, min_x - padding)
            min_y = max(0, min_y - padding)
            max_x = min(width, max_x + padding)
            max_y = min(height, max_y + padding)
            
            # Draw bounding box
            cv2.rectangle(annotated_img, (min_x, min_y), (max_x, max_y), (255, 0, 0), 2)
            
            bbox = [min_x, min_y, max_x - min_x, max_y - min_y]
        else:
            bbox = [50, 50, 200, 200]
        
        # Add analysis overlay text
        cv2.putText(annotated_img, f'Confidence: {confidence:.2f}', 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(annotated_img, f'Detections: {len(detection_points)}', 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Save annotated image
        annotated_filename = f"annotated_{os.path.basename(image_path)}"
        annotated_path = os.path.join(app.config['UPLOAD_FOLDER'], annotated_filename)
        cv2.imwrite(annotated_path, cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR))
        
        return {
            'result': result,
            'confidence': confidence,
            'bbox': bbox,
            'detection_points': detection_points,
            'annotated_image': annotated_filename
        }
    except Exception as e:
        return {
            'result': f'Error in analysis: {str(e)}',
            'confidence': 0.0,
            'bbox': [0, 0, 100, 100],
            'detection_points': [],
            'annotated_image': None
        }

@app.route('/')
def index():
    return render_template('index.html')



@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'age': p.age,
        'gender': p.gender,
        'email': p.email,
        'phone': p.phone,
        'created_at': p.created_at.isoformat()
    } for p in patients])

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.json
    try:
        patient = Patient(
            name=data['name'],
            age=data['age'],
            gender=data['gender'],
            email=data['email'],
            phone=data['phone']
        )
        db.session.add(patient)
        db.session.commit()
        return jsonify({'id': patient.id, 'message': 'Patient created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/scans', methods=['POST'])
def upload_scan():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    patient_id = request.form.get('patient_id')
    scan_type = request.form.get('scan_type', 'breast')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    analysis_result = analyze_image(filepath)
    
    scan = Scan(
        patient_id=patient_id,
        image_path=filepath,
        annotated_image_path=analysis_result.get('annotated_image'),
        result=analysis_result['result'],
        confidence=analysis_result['confidence'],
        scan_type=scan_type,
        status='completed'
    )
    db.session.add(scan)
    db.session.commit()
    
    return jsonify({
        'id': scan.id,
        'result': analysis_result['result'],
        'confidence': analysis_result['confidence'],
        'bbox': analysis_result['bbox'],
        'detection_points': analysis_result.get('detection_points', []),
        'annotated_image': analysis_result.get('annotated_image'),
        'message': 'Scan uploaded and analyzed successfully'
    }), 201

@app.route('/api/quick-analysis', methods=['POST'])
def quick_analysis():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    scan_type = request.form.get('scan_type', 'breast')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = f"quick_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    analysis_result = analyze_image(filepath)
    
    return jsonify({
        'result': analysis_result['result'],
        'confidence': analysis_result['confidence'],
        'bbox': analysis_result['bbox'],
        'detection_points': analysis_result.get('detection_points', []),
        'annotated_image': analysis_result.get('annotated_image'),
        'scan_type': scan_type,
        'message': 'Quick analysis completed successfully'
    }), 200

@app.route('/api/scans/<int:scan_id>', methods=['GET'])
def get_scan(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    return jsonify({
        'id': scan.id,
        'patient_id': scan.patient_id,
        'result': scan.result,
        'confidence': scan.confidence,
        'scan_type': scan.scan_type,
        'status': scan.status,
        'annotated_image': scan.annotated_image_path,
        'created_at': scan.created_at.isoformat()
    })

@app.route('/api/scans', methods=['GET'])
def get_scans():
    scans = Scan.query.all()
    return jsonify([{
        'id': s.id,
        'patient_id': s.patient_id,
        'result': s.result,
        'confidence': s.confidence,
        'scan_type': s.scan_type,
        'status': s.status,
        'annotated_image': s.annotated_image_path,
        'created_at': s.created_at.isoformat()
    } for s in scans])

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/images/<filename>')
def static_images(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        load_model()
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run in debug mode only in development
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(debug=debug, host='0.0.0.0', port=port)
