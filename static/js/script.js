document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // 1. INITIALIZATION & CONFIGURATION
    // =============================================
    
    // Initialize Particle.js background
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1 } },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });

    // =============================================
    // 2. DOM ELEMENTS & REFERENCES
    // =============================================
    
    const elements = {
        // Deepfake Detection Elements
        deepfake: {
            uploadBtn: document.getElementById('deepfake-upload-btn'),
            uploadInput: document.getElementById('deepfake-upload'),
            uploadContainer: document.getElementById('deepfake-upload-container'),
            progress: document.getElementById('deepfake-progress'),
            progressBar: document.getElementById('deepfake-progress-bar'),
            progressStatus: document.getElementById('deepfake-progress-status'),
            progressPercent: document.getElementById('deepfake-progress-percent'),
            result: document.getElementById('deepfake-result'),
            resultTitle: document.getElementById('deepfake-result-title'),
            confidenceBadge: document.getElementById('deepfake-confidence-badge'),
            confidenceFill: document.getElementById('deepfake-confidence-fill'),
            confidenceValue: document.getElementById('deepfake-confidence-value'),
            resultDetails: document.getElementById('deepfake-result-details'),
            resetBtn: document.getElementById('deepfake-reset-btn')
        },
        
        // Fake News Detection Elements
        fakenews: {
            form: document.getElementById('fakenews-form'),
            textarea: document.getElementById('fakenews-text'),
            textCounter: document.getElementById('text-counter'),
            progress: document.getElementById('fakenews-progress'),
            result: document.getElementById('fakenews-result'),
            resultTitle: document.getElementById('fakenews-result-title'),
            confidenceBadge: document.getElementById('fakenews-confidence-badge'),
            confidenceFill: document.getElementById('fakenews-confidence-fill'),
            confidenceValue: document.getElementById('fakenews-confidence-value'),
            resultDetails: document.getElementById('fakenews-result-details'),
            textSnippet: document.getElementById('fakenews-text-snippet'),
            resetBtn: document.getElementById('fakenews-reset-btn')
        }
    };

    // =============================================
    // 3. EVENT LISTENERS
    // =============================================

    // Initialize text counter
    elements.fakenews.textarea.addEventListener('input', updateTextCounter);

    // Tab reset functionality
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tabEl => {
        tabEl.addEventListener('click', resetAllForms);
    });

    // Deepfake upload functionality
    elements.deepfake.uploadBtn.addEventListener('click', () => elements.deepfake.uploadInput.click());
    elements.deepfake.uploadContainer.addEventListener('click', () => elements.deepfake.uploadInput.click());
    elements.deepfake.uploadInput.addEventListener('change', handleFileUpload);

    // Fake news form submission
    elements.fakenews.form.addEventListener('submit', handleTextSubmit);

    // Reset buttons
    elements.deepfake.resetBtn.addEventListener('click', resetDeepfakeForm);
    elements.fakenews.resetBtn.addEventListener('click', resetFakeNewsForm);

    // Drag and drop for video
    elements.deepfake.uploadContainer.addEventListener('dragover', handleDragOver);
    elements.deepfake.uploadContainer.addEventListener('dragleave', handleDragLeave);
    elements.deepfake.uploadContainer.addEventListener('drop', handleDrop);

    // =============================================
    // 4. CORE FUNCTIONS
    // =============================================

    function updateTextCounter() {
        elements.fakenews.textCounter.textContent = this.value.length;
    }

    function handleFileUpload() {
        if (this.files && this.files[0]) {
            analyzeVideo(this.files[0]);
        }
    }

    function handleTextSubmit(e) {
        e.preventDefault();
        const text = elements.fakenews.textarea.value.trim();
        if (text) analyzeText(text);
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.style.borderColor = '#00cec9';
        this.style.backgroundColor = 'rgba(0, 206, 201, 0.1)';
    }

    function handleDragLeave() {
        this.style.borderColor = 'var(--glass-border)';
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }

    function handleDrop(e) {
        e.preventDefault();
        handleDragLeave.call(this);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (isValidVideoFile(file)) {
                analyzeVideo(file);
            } else {
                showAlert('Please upload a video file (MP4, AVI, MOV, MKV)', 'danger');
            }
        }
    }

    function isValidVideoFile(file) {
        const validExtensions = ['mp4', 'avi', 'mov', 'mkv'];
        const extension = file.name.split('.').pop().toLowerCase();
        return validExtensions.includes(extension);
    }

    // =============================================
    // 5. ANALYSIS FUNCTIONS
    // =============================================

    function analyzeVideo(file) {
        resetDeepfakeForm();
        showProgress('deepfake', 'Uploading video...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        simulateProgress('deepfake', () => {
            fetch('/analyze', {
                method: 'POST',
                body: formData
            })
            .then(handleResponse)
            .then(data => showVideoResult(data))
            .catch(error => handleAnalysisError('deepfake', error));
        });
    }

    function analyzeText(text) {
        resetFakeNewsForm();
        showProgress('fakenews', 'Analyzing text...');
        
        fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `text=${encodeURIComponent(text)}`
        })
        .then(handleResponse)
        .then(data => showTextResult(data))
        .catch(error => handleAnalysisError('fakenews', error));
    }

    function handleResponse(response) {
        if (!response.ok) {
            return response.json().then(err => { 
                throw new Error(err.error || 'Request failed'); 
            });
        }
        return response.json();
    }

    function handleAnalysisError(type, error) {
        console.error('Error:', error);
        const elements = type === 'deepfake' ? elements.deepfake : elements.fakenews;
        
        if (type === 'deepfake') {
            elements.progressStatus.textContent = `Error: ${error.message}`;
            elements.progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
            elements.progressBar.classList.add('bg-danger');
        } else {
            elements.progress.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
                </div>
            `;
        }
        
        setTimeout(() => {
            type === 'deepfake' ? resetDeepfakeForm() : resetFakeNewsForm();
        }, 3000);
    }

    // =============================================
    // 6. UI UPDATE FUNCTIONS
    // =============================================

    function showProgress(type, message) {
        const el = elements[type];
        el.uploadContainer?.classList.add('d-none');
        el.form?.classList.add('d-none');
        el.progress.classList.remove('d-none');
        
        if (type === 'deepfake') {
            el.progressBar.style.width = '0%';
            el.progressStatus.textContent = message;
            el.progressPercent.textContent = '0%';
        }
    }

    function simulateProgress(type, callback) {
        let progress = 0;
        const el = elements[type];
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 1;
            if (progress > 90) progress = 90;
            
            if (type === 'deepfake') {
                el.progressBar.style.width = `${progress}%`;
                el.progressPercent.textContent = `${progress}%`;
            }
            
            if (progress >= 90) {
                clearInterval(interval);
                callback();
            }
        }, 200);
    }

    function showVideoResult(data) {
        const isFake = data.result === 'deepfake';
        const confidence = (data.confidence * 100).toFixed(2);
        
        updateResultUI('deepfake', {
            title: isFake ? 'Deepfake Detected!' : 'Authentic Video',
            isFake,
            confidence,
            details: isFake ? 
                'This video shows characteristics of AI manipulation.' : 
                'This video appears to be authentic based on our analysis.',
            icon: isFake ? 'fa-exclamation-triangle' : 'fa-check-circle',
            stats: `
                <div class="stat-item">
                    <i class="fas fa-film"></i>
                    <span>${data.frame_count} frames analyzed</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-chart-line"></i>
                    <span>${confidence}% confidence score</span>
                </div>
            `
        });
    }

    function showTextResult(data) {
        const isFake = data.result === 'fake';
        const confidence = (data.confidence * 100).toFixed(2);
        
        updateResultUI('fakenews', {
            title: isFake ? 'Fake News Detected!' : 'Authentic Content',
            isFake,
            confidence,
            details: isFake ? 
                'This text shows characteristics of misinformation.' : 
                'This content appears to be authentic based on our analysis.',
            icon: isFake ? 'fa-exclamation-triangle' : 'fa-check-circle',
            stats: `
                <div class="stat-item">
                    <i class="fas fa-chart-line"></i>
                    <span>${confidence}% confidence score</span>
                </div>
            `,
            snippet: data.text_snippet
        });
    }

    function updateResultUI(type, { title, isFake, confidence, details, icon, stats, snippet }) {
        const el = elements[type];
        el.progress.classList.add('d-none');
        el.result.classList.remove('d-none');
        
        // Update result header
        el.resultTitle.textContent = title;
        el.confidenceBadge.textContent = isFake ? 'FAKE' : 'REAL';
        el.confidenceBadge.className = `confidence-badge ${isFake ? 'fake' : 'real'}`;
        
        // Update confidence meter
        el.confidenceFill.style.width = `${confidence}%`;
        el.confidenceFill.style.background = isFake 
            ? 'linear-gradient(90deg, var(--danger), #e84393)' 
            : 'linear-gradient(90deg, var(--success), #00b894)';
        
        el.confidenceValue.textContent = `${confidence}% confidence`;
        el.confidenceValue.style.color = isFake ? 'var(--danger)' : 'var(--success)';
        
        // Update result details
        el.resultDetails.innerHTML = `
            <div class="alert ${isFake ? 'alert-danger' : 'alert-success'}">
                <i class="fas ${icon}"></i>
                ${details}
            </div>
            <div class="analysis-stats">
                ${stats}
            </div>
        `;
        
        // Update text snippet if available
        if (snippet && type === 'fakenews') {
            el.textSnippet.textContent = snippet;
        }
    }

    // =============================================
    // 7. RESET FUNCTIONS
    // =============================================

    function resetDeepfakeForm() {
        elements.deepfake.uploadInput.value = '';
        elements.deepfake.progressBar.style.width = '0%';
        elements.deepfake.progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
        elements.deepfake.progress.classList.add('d-none');
        elements.deepfake.result.classList.add('d-none');
        elements.deepfake.uploadContainer.classList.remove('d-none');
        elements.deepfake.progressStatus.textContent = 'Processing video...';
    }

    function resetFakeNewsForm() {
        elements.fakenews.textarea.value = '';
        elements.fakenews.textCounter.textContent = '0';
        elements.fakenews.progress.classList.add('d-none');
        elements.fakenews.result.classList.add('d-none');
        elements.fakenews.form.classList.remove('d-none');
    }

    function resetAllForms() {
        resetDeepfakeForm();
        resetFakeNewsForm();
    }

    // =============================================
    // 8. UTILITY FUNCTIONS
    // =============================================

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fixed-alert`;
        alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    }
});