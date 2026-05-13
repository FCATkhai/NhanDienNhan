const API_URL = 'https://nhan-dien-nhan-backend-production.up.railway.app';
const MAX_FILES = 3;

let selectedFiles = [];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewGrid = document.getElementById('previewGrid');
const fileCount = document.getElementById('fileCount');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const sampleThumbs = document.querySelectorAll('.sample-thumb');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
submitBtn.addEventListener('click', submitFiles);

// Sample thumbnails click handler
sampleThumbs.forEach(img => {
    img.addEventListener('click', () => {
        const url = img.dataset.src || img.src;
        addSampleImage(url);
    });
});

async function addSampleImage(url) {
    if (selectedFiles.length >= MAX_FILES) {
        showError(`Tối đa ${MAX_FILES} ảnh.`);
        return;
    }
    const name = url.split('/').pop();
    if (selectedFiles.some(f => f.name === name)) {
        showError('Ảnh mẫu đã được thêm');
        return;
    }
    try {
        const res = await fetch(url);
        if (!res.ok) {
            showError('Không thể tải ảnh mẫu');
            return;
        }
        const blob = await res.blob();
        const file = new File([blob], name, { type: blob.type });
        selectedFiles.push(file);
        clearError();
        updatePreview();
    } catch (e) {
        showError('Không thể tải ảnh mẫu');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(fileList) {
    // Convert to array and filter valid images
    const newFiles = Array.from(fileList).filter(file => 
        file.type.startsWith('image/')
    );

    if (newFiles.length === 0) {
        showError('Vui lòng chọn file ảnh hợp lệ');
        return;
    }

    // Limit to MAX_FILES
    if (newFiles.length + selectedFiles.length > MAX_FILES) {
        showError(`Tối đa ${MAX_FILES} ảnh. Số lượng hiện tại: ${selectedFiles.length + newFiles.length}`);
        return;
    }

    selectedFiles = [...selectedFiles, ...newFiles];
    clearError();
    updatePreview();
}

function updatePreview() {
    if (selectedFiles.length === 0) {
        previewContainer.style.display = 'none';
        submitBtn.disabled = true;
        return;
    }

    previewContainer.style.display = 'block';
    previewGrid.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'preview-item';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button class="remove-btn" onclick="removeImage(${index})">×</button>
            `;
            previewGrid.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });

    fileCount.textContent = `${selectedFiles.length}/${MAX_FILES} ảnh đã chọn`;
    submitBtn.disabled = false;
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    fileInput.value = '';
    updatePreview();
}

async function submitFiles() {
    if (selectedFiles.length === 0) {
        showError('Vui lòng chọn ít nhất một ảnh');
        return;
    }

    showLoading();

    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });

    try {
        console.log('📤 Sending request to:', `${API_URL}/invoke`);
        const response = await fetch(`${API_URL}/invoke`, {
            method: 'POST',
            body: formData
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);

        if (!response.ok) {
            let errorMsg = `Lỗi server: ${response.status}`;
            try {
                const error = await response.json();
                console.log('❌ Error response:', error);
                errorMsg = error.detail || errorMsg;
            } catch (_) {
                console.log('❌ Could not parse error response');
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('✅ Response data:', data);
        showResults(data);
    } catch (error) {
        console.error('❌ Request failed:', error);
        showError(`Lỗi: ${error.message}`);
        showUpload();
    }
}

function showLoading() {
    uploadSection.style.display = 'none';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'block';
    console.log('⏳ Showing loading indicator');
}

function showUpload() {
    uploadSection.style.display = 'block';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'none';
}

function showResults(data) {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';

    let html = `
        <div class="product-header">
            <div class="product-name">${escapeHtml(data.product_name)}</div>
            <div class="product-meta">
                ${data.product_type ? `<div class="meta-item">
                    <div class="meta-label">Type</div>
                    <div class="meta-value">${escapeHtml(data.product_type)}</div>
                </div>` : ''}
                ${data.manufacturer ? `<div class="meta-item">
                    <div class="meta-label">Manufacturer</div>
                    <div class="meta-value">${escapeHtml(data.manufacturer)}</div>
                </div>` : ''}
                ${data.registration_number ? `<div class="meta-item">
                    <div class="meta-label">Registration</div>
                    <div class="meta-value">${escapeHtml(data.registration_number)}</div>
                </div>` : ''}
            </div>
        </div>
    `;

    if (data.active_ingredients && data.active_ingredients.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">🧪 Active Ingredients</div>
                <div class="ingredients-list">
        `;
        data.active_ingredients.forEach(ingredient => {
            html += `
                <div class="ingredient-item">
                    <div class="ingredient-name">${escapeHtml(ingredient.name)}</div>
                    <div class="ingredient-content">${escapeHtml(ingredient.content)}</div>
                </div>
            `;
        });
        html += `</div></div>`;
    }

    if (data.dosage) {
        html += `
            <div class="section">
                <div class="section-title">📋 Usage & Dosage</div>
                <div class="dosage-box">${escapeHtml(data.dosage)}</div>
            </div>
        `;
    }

    if (data.target_crops && data.target_crops.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">🌱 Target Crops</div>
                <div class="crops-list">
        `;
        data.target_crops.forEach(crop => {
            html += `<div class="tag">${escapeHtml(crop)}</div>`;
        });
        html += `</div></div>`;
    }

    if (data.target_pests && data.target_pests.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">🐛 Target Pests/Diseases</div>
                <div class="pests-list">
        `;
        data.target_pests.forEach(pest => {
            html += `<div class="tag">${escapeHtml(pest)}</div>`;
        });
        html += `</div></div>`;
    }

    if (data.pre_harvest_interval_days) {
        html += `
            <div class="section">
                <div class="section-title">⏰ Pre-Harvest Interval</div>
                <div class="dosage-box">${data.pre_harvest_interval_days} days</div>
            </div>
        `;
    }

    if (data.confidence_score !== undefined) {
        const confidence = data.confidence_score * 100;
        const confidenceClass = confidence >= 80 ? 'high' : 'low';
        html += `
            <div class="section" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                <span class="confidence ${confidenceClass}">
                    ✓ Confidence: ${confidence.toFixed(0)}%
                </span>
            </div>
        `;
    }

    resultsContent.innerHTML = html;

    // Add reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'submit-btn';
    resetBtn.textContent = '↺ Upload New Images';
    resetBtn.style.marginTop = '24px';
    resetBtn.onclick = resetApp;
    resultsContent.appendChild(resetBtn);
}

function resetApp() {
    selectedFiles = [];
    fileInput.value = '';
    previewGrid.innerHTML = '';
    clearError();
    updatePreview();
    showUpload();
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function clearError() {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}