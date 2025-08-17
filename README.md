# 🏥 Cancer Detection System

An advanced AI-powered cancer detection system that uses machine learning to analyze medical images and provide visual detection results with confidence scores.

## 🌟 Features

### 🔬 AI-Powered Analysis
- **SAM (Segment Anything Model)** integration for medical image analysis
- **Multiple Cancer Types**: Breast, Lung, Brain, and Skin cancer detection
- **Visual Detection Markers**: Color-coded detection points (Red/Orange/Yellow)
- **Confidence Scoring**: Detailed confidence analysis with percentage scores

### 📸 Dual Analysis Modes
- **Patient Analysis**: Full patient management with database storage
- **Quick Analysis**: Instant analysis without patient data requirements

### 📱 Camera Integration
- **Real-time Camera Capture**: Direct photo capture for analysis
- **High-Resolution Support**: Up to 1920x1080 image capture
- **Mobile-Friendly**: Responsive design for all devices

### 🎨 Visual Results
- **Side-by-Side Comparison**: Original vs. annotated images
- **Detection Markers**: 
  - 🔴 Red circles for high-risk areas
  - 🟠 Orange circles for moderate-risk areas
  - 🟡 Yellow circles for low-risk areas
- **Bounding Boxes**: Visual highlighting of detected regions

## 🚀 Live Demo

**Access the live application**: [Cancer Detection System](https://your-app-name.onrender.com)

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Bootstrap 5)
- **Database**: SQLite (with SQLAlchemy ORM)
- **AI/ML**: PyTorch, Transformers, OpenCV
- **Deployment**: Render (Cloud Platform)

## 📋 Prerequisites

- Python 3.11 or higher
- pip (Python package installer)
- Git

## 🔧 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cancer-detection-system.git
   cd cancer-detection-system
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   Open your browser and go to: `http://localhost:5000`

## 🎯 Usage

### Patient Analysis Mode
1. **Add Patient**: Fill in patient details (name, age, gender, email, phone)
2. **Select Patient**: Choose from the dropdown in the upload section
3. **Upload Image**: Select scan type and upload medical image
4. **View Results**: See both original and annotated images with analysis

### Quick Analysis Mode
1. **Select Mode**: Choose "Quick Analysis" from the toggle buttons
2. **Upload Image**: Select scan type and upload medical image
3. **Instant Results**: Get immediate analysis without patient data

### Camera Capture
1. **Start Camera**: Click "Start Camera" button
2. **Capture Image**: Position document and click "Capture"
3. **Analyze**: The captured image is automatically set for analysis

## 📊 API Endpoints

### Patient Management
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient

### Scan Analysis
- `GET /api/scans` - Get all scans
- `POST /api/scans` - Upload patient-based scan
- `POST /api/quick-analysis` - Quick analysis without patient data
- `GET /api/scans/<id>` - Get specific scan details

## 🏗️ Project Structure

```
cancer-detection-system/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Procfile              # Render deployment configuration
├── runtime.txt           # Python version specification
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── static/              # Static files
│   ├── css/
│   │   └── style.css    # Custom styles
│   ├── js/
│   │   └── app.js       # Frontend JavaScript
│   └── medical-ai.jpg   # Hero image
├── templates/           # HTML templates
│   └── index.html       # Main application page
├── uploads/             # Uploaded images (created automatically)
└── instance/            # Database files (created automatically)
```

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **File Type Restrictions**: Only image files are accepted
- **Error Handling**: Comprehensive error handling and user feedback
- **CORS Support**: Cross-origin resource sharing enabled

## 🚀 Deployment

### Deploy to Render

1. **Fork/Clone** this repository to your GitHub account
2. **Sign up** for a free account at [Render.com](https://render.com)
3. **Create New Web Service**:
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `gunicorn app:app`
   - Choose the free plan

4. **Environment Variables** (optional):
   - `FLASK_ENV`: Set to `production` for production mode
   - `PORT`: Render will set this automatically

5. **Deploy**: Click "Create Web Service" and wait for deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. It should not be used as a substitute for professional medical diagnosis. Always consult with qualified healthcare professionals for medical decisions.

## 🙏 Acknowledgments

- **SAM Model**: Medical image segmentation capabilities
- **Bootstrap**: UI framework and responsive design
- **Flask**: Web framework
- **OpenCV**: Image processing capabilities
- **Render**: Free cloud hosting platform

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the documentation above
- Ensure all dependencies are properly installed

---

**Made with ❤️ for medical research and education**
