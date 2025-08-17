// Cancer Detection System - Frontend JavaScript

let patients = [];
let scans = [];
let stream = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    loadScans();
    setupEventListeners();
});

function setupEventListeners() {
    // Patient form submission
    document.getElementById('patientForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createPatient();
    });

    // Scan form submission
    document.getElementById('scanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        uploadScan();
    });

    // Quick scan form submission
    document.getElementById('quickScanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        quickAnalysis();
    });

    // Analysis type switching
    document.querySelectorAll('input[name="analysisType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            switchAnalysisType(this.value);
        });
    });

    // Image preview for patient analysis
    document.getElementById('scanImage').addEventListener('change', function(e) {
        previewImage(e.target.files[0], 'previewImg', 'imagePreview');
    });

    // Image preview for quick analysis
    document.getElementById('quickScanImage').addEventListener('change', function(e) {
        previewImage(e.target.files[0], 'quickPreviewImg', 'quickImagePreview');
    });

    // Camera capture button for patient analysis
    document.getElementById('captureBtn').addEventListener('click', function() {
        captureFromCamera('cameraVideo', 'captureCanvas', 'scanImage', 'previewImg', 'imagePreview');
    });

    // Start camera button for patient analysis
    document.getElementById('startCameraBtn').addEventListener('click', function() {
        startCamera('cameraVideo', 'cameraSection', 'cameraControls', 'startCameraBtn');
    });

    // Stop camera button for patient analysis
    document.getElementById('stopCameraBtn').addEventListener('click', function() {
        stopCamera('cameraVideo', 'cameraSection', 'cameraControls', 'startCameraBtn');
    });

    // Camera capture button for quick analysis
    document.getElementById('quickCaptureBtn').addEventListener('click', function() {
        captureFromCamera('quickCameraVideo', 'quickCaptureCanvas', 'quickScanImage', 'quickPreviewImg', 'quickImagePreview');
    });

    // Start camera button for quick analysis
    document.getElementById('quickStartCameraBtn').addEventListener('click', function() {
        startCamera('quickCameraVideo', 'quickCameraSection', 'quickCameraControls', 'quickStartCameraBtn');
    });

    // Stop camera button for quick analysis
    document.getElementById('quickStopCameraBtn').addEventListener('click', function() {
        stopCamera('quickCameraVideo', 'quickCameraSection', 'quickCameraControls', 'quickStartCameraBtn');
    });
}

async function loadPatients() {
    try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        patients = await response.json();
        renderPatients();
        updatePatientSelect();
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Error loading patients: ' + error.message, 'error');
    }
}

async function loadScans() {
    try {
        const response = await fetch('/api/scans');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        scans = await response.json();
        renderScans();
    } catch (error) {
        console.error('Error loading scans:', error);
        showNotification('Error loading scans: ' + error.message, 'error');
    }
}

async function createPatient() {
    const formData = {
        name: document.getElementById('patientName').value.trim(),
        age: parseInt(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        email: document.getElementById('patientEmail').value.trim(),
        phone: document.getElementById('patientPhone').value.trim()
    };

    // Validation
    if (!formData.name || !formData.age || !formData.gender || !formData.email || !formData.phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (formData.age <= 0 || formData.age > 150) {
        showNotification('Please enter a valid age', 'error');
        return;
    }

    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Patient created successfully!', 'success');
            document.getElementById('patientForm').reset();
            await loadPatients(); // Reload patients list
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error creating patient', 'error');
        }
    } catch (error) {
        console.error('Error creating patient:', error);
        showNotification('Error creating patient: ' + error.message, 'error');
    }
}

async function uploadScan() {
    const formData = new FormData();
    const imageFile = document.getElementById('scanImage').files[0];
    const patientId = document.getElementById('patientSelect').value;
    const scanType = document.getElementById('scanType').value;

    if (!imageFile) {
        showNotification('Please select an image file', 'error');
        return;
    }

    if (!patientId) {
        showNotification('Please select a patient', 'error');
        return;
    }

    formData.append('image', imageFile);
    formData.append('patient_id', patientId);
    formData.append('scan_type', scanType);

    try {
        const submitBtn = document.querySelector('#scanForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing...';
        submitBtn.disabled = true;

        const response = await fetch('/api/scans', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Scan uploaded and analyzed successfully!', 'success');
            showResults(result);
            document.getElementById('scanForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            await loadScans();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error uploading scan', 'error');
        }
    } catch (error) {
        console.error('Error uploading scan:', error);
        showNotification('Error uploading scan: ' + error.message, 'error');
    } finally {
        const submitBtn = document.querySelector('#scanForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-upload me-2"></i>Upload and Analyze';
        submitBtn.disabled = false;
    }
}

async function quickAnalysis() {
    const formData = new FormData();
    const imageFile = document.getElementById('quickScanImage').files[0];
    const scanType = document.getElementById('quickScanType').value;

    if (!imageFile) {
        showNotification('Please select an image file', 'error');
        return;
    }

    formData.append('image', imageFile);
    formData.append('scan_type', scanType);

    try {
        const submitBtn = document.querySelector('#quickScanForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing...';
        submitBtn.disabled = true;

        const response = await fetch('/api/quick-analysis', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Quick analysis completed successfully!', 'success');
            showResults(result);
            document.getElementById('quickScanForm').reset();
            document.getElementById('quickImagePreview').style.display = 'none';
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error during quick analysis', 'error');
        }
    } catch (error) {
        console.error('Error during quick analysis:', error);
        showNotification('Error during quick analysis: ' + error.message, 'error');
    } finally {
        const submitBtn = document.querySelector('#quickScanForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-bolt me-2"></i>Quick Analyze';
        submitBtn.disabled = false;
    }
}

function switchAnalysisType(type) {
    if (type === 'patient') {
        document.getElementById('patientAnalysisForm').style.display = 'block';
        document.getElementById('quickAnalysisForm').style.display = 'none';
    } else {
        document.getElementById('patientAnalysisForm').style.display = 'none';
        document.getElementById('quickAnalysisForm').style.display = 'block';
    }
}

// Camera functionality
async function startCamera(videoId, sectionId, controlsId, buttonId) {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Use back camera if available
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            } 
        });
        
        const video = document.getElementById(videoId);
        video.srcObject = stream;
        video.play();
        
        document.getElementById(sectionId).style.display = 'block';
        document.getElementById(controlsId).style.display = 'block';
        document.getElementById(buttonId).style.display = 'none';
        showNotification('Camera started successfully', 'success');
    } catch (error) {
        console.error('Error starting camera:', error);
        showNotification('Error starting camera: ' + error.message, 'error');
    }
}

function stopCamera(videoId, sectionId, controlsId, buttonId) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    const video = document.getElementById(videoId);
    video.srcObject = null;
    
    document.getElementById(sectionId).style.display = 'none';
    document.getElementById(controlsId).style.display = 'none';
    document.getElementById(buttonId).style.display = 'block';
    showNotification('Camera stopped', 'info');
}

function captureFromCamera(videoId, canvasId, fileInputId, previewImgId, previewSectionId) {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(function(blob) {
        // Create a File object from the blob
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
        
        // Create a FileList-like object
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Set the file input
        const fileInput = document.getElementById(fileInputId);
        fileInput.files = dataTransfer.files;
        
        // Show preview
        previewImage(file, previewImgId, previewSectionId);
        
        showNotification('Image captured successfully!', 'success');
    }, 'image/jpeg', 0.8);
}

function previewImage(file, previewImgId = 'previewImg', previewSectionId = 'imagePreview') {
    if (file) {
        console.log('Previewing image:', file.name, file.type, file.size);
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById(previewImgId);
            previewImg.src = e.target.result;
            document.getElementById(previewSectionId).style.display = 'block';
            console.log('Image preview loaded successfully');
        };
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
        };
        reader.readAsDataURL(file);
    } else {
        console.log('No file provided for preview');
    }
}

function showResults(result) {
    console.log('Showing results:', result);
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    const originalImage = document.getElementById('originalImage');
    const annotatedImage = document.getElementById('annotatedImage');
    const previewImg = document.getElementById('previewImg');
    
    if (previewImg.src) {
        originalImage.src = previewImg.src;
        console.log('Setting original image src:', previewImg.src);
    } else {
        console.log('No preview image source available');
    }
    
    // Display annotated image if available
    if (result.annotated_image) {
        annotatedImage.src = `/uploads/${result.annotated_image}`;
        console.log('Setting annotated image src:', `/uploads/${result.annotated_image}`);
    } else {
        annotatedImage.src = previewImg.src; // Fallback to original image
        console.log('No annotated image available, using original');
    }

    const analysisResults = document.getElementById('analysisResults');
    const confidenceClass = getConfidenceClass(result.confidence);
    const confidencePercent = Math.round(result.confidence * 100);
    
    // Create detection points summary
    let detectionSummary = '';
    if (result.detection_points && result.detection_points.length > 0) {
        const highCount = result.detection_points.filter(p => p[2] === 'high').length;
        const moderateCount = result.detection_points.filter(p => p[2] === 'moderate').length;
        const lowCount = result.detection_points.filter(p => p[2] === 'low').length;
        
        detectionSummary = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <div class="text-center">
                        <div class="detection-legend high-confidence mx-auto mb-2"></div>
                        <strong>${highCount}</strong> High Risk Areas
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center">
                        <div class="detection-legend moderate-confidence mx-auto mb-2"></div>
                        <strong>${moderateCount}</strong> Moderate Risk Areas
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center">
                        <div class="detection-legend low-confidence mx-auto mb-2"></div>
                        <strong>${lowCount}</strong> Low Risk Areas
                    </div>
                </div>
            </div>
        `;
    }
    
    analysisResults.innerHTML = `
        <div class="alert alert-success fade-in">
            <h5><i class="fas fa-check-circle me-2"></i>Analysis Complete</h5>
            <p><strong>Result:</strong> ${result.result}</p>
            <p><strong>Confidence:</strong> <span class="${confidenceClass}">${confidencePercent}%</span></p>
            <div class="progress mb-3">
                <div class="progress-bar" role="progressbar" style="width: ${confidencePercent}%" 
                     aria-valuenow="${confidencePercent}" aria-valuemin="0" aria-valuemax="100">
                    ${confidencePercent}%
                </div>
            </div>
            <p><strong>Total Detections:</strong> ${result.detection_points ? result.detection_points.length : 0} areas identified</p>
            <p><strong>Bounding Box:</strong> [${result.bbox.join(', ')}]</p>
            ${detectionSummary}
            <small class="text-muted">Analysis completed at ${new Date().toLocaleString()}</small>
        </div>
    `;
}

function getConfidenceClass(confidence) {
    if (confidence >= 0.7) return 'confidence-high';
    if (confidence >= 0.4) return 'confidence-medium';
    return 'confidence-low';
}

function renderPatients() {
    const tbody = document.getElementById('patientsTableBody');
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No patients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = patients.map(patient => `
        <tr class="fade-in">
            <td>${patient.id}</td>
            <td><strong>${patient.name}</strong></td>
            <td>${patient.age}</td>
            <td><span class="badge bg-info">${patient.gender}</span></td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewPatient(${patient.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderScans() {
    const tbody = document.getElementById('scansTableBody');
    if (scans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No scans found</td></tr>';
        return;
    }
    
    tbody.innerHTML = scans.map(scan => {
        const patient = patients.find(p => p.id == scan.patient_id);
        const confidenceClass = getConfidenceClass(scan.confidence);
        const statusClass = `status-${scan.status}`;
        const confidencePercent = Math.round((scan.confidence || 0) * 100);
        const date = new Date(scan.created_at).toLocaleDateString();
        
        return `
            <tr class="fade-in">
                <td>${scan.id}</td>
                <td><strong>${patient ? patient.name : 'Unknown'}</strong></td>
                <td><span class="badge bg-secondary">${scan.scan_type}</span></td>
                <td>${scan.result || 'N/A'}</td>
                <td><span class="${confidenceClass}">${confidencePercent}%</span></td>
                <td><span class="badge ${statusClass}">${scan.status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewScan(${scan.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${scan.annotated_image ? 
                        `<button class="btn btn-sm btn-outline-success" onclick="viewAnnotatedImage('${scan.annotated_image}')">
                            <i class="fas fa-search-plus"></i>
                        </button>` : ''
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function updatePatientSelect() {
    const select = document.getElementById('patientSelect');
    select.innerHTML = '<option value="">Choose a patient...</option>';
    patients.forEach(patient => {
        select.innerHTML += `<option value="${patient.id}">${patient.name} (ID: ${patient.id})</option>`;
    });
}

function viewPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        showNotification(`Viewing patient: ${patient.name}`, 'info');
        // You can implement a modal or redirect to patient details page
    }
}

function viewScan(scanId) {
    const scan = scans.find(s => s.id === scanId);
    if (scan) {
        showNotification(`Viewing scan ID: ${scanId}`, 'info');
        // You can implement a modal or redirect to scan details page
    }
}

function viewAnnotatedImage(imagePath) {
    if (imagePath) {
        // Create a modal to show the annotated image
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'annotatedImageModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detected Areas Analysis</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="/uploads/${imagePath}" class="img-fluid rounded" style="max-height: 500px;">
                        <div class="mt-3">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <div class="detection-legend high-confidence me-2"></div>
                                        <small>High Risk</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <div class="detection-legend moderate-confidence me-2"></div>
                                        <small>Moderate Risk</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <div class="detection-legend low-confidence me-2"></div>
                                        <small>Low Risk</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show the modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Remove modal from DOM when hidden
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
