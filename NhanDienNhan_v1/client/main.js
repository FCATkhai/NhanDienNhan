const API_URL = 'https://nhan-dien-nhan-backend-production.up.railway.app/api/image/analyze';
// const API_URL = 'http://localhost:5000/api/image/analyze';
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
const sampleSection = document.getElementById('sampleSection');
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
        formData.append('images', file);
    });

    try {
        console.log('📤 Gửi yêu cầu đến:', `${API_URL}`);
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            body: formData
        });

        console.log('📥 Trạng thái phản hồi:', response.status);
        console.log('📥 Headers phản hồi:', response.headers);

        if (!response.ok) {
            let errorMsg = `Lỗi máy chủ: ${response.status}`;
            try {
                const error = await response.json();
                console.log('❌ Phản hồi lỗi:', error);
                errorMsg = error.detail || errorMsg;
            } catch (_) {
                console.log('❌ Không thể phân tích phản hồi lỗi');
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('✅ Dữ liệu phản hồi:', data);
        showResults(data);
    } catch (error) {
        console.error('❌ Yêu cầu thất bại:', error);
        showError(`Lỗi: ${error.message}`);
        showUpload();
    }
}

function showLoading() {
    uploadSection.style.display = 'none';
    resultsSection.style.display = 'none';
    sampleSection.style.display = 'none';
    loadingSection.style.display = 'block';
    console.log('⏳ Đang hiển thị chỉ báo tải');
}

function showUpload() {
    uploadSection.style.display = 'block';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'none';
    sampleSection.style.display = 'block';
}

function showResults(response) {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    sampleSection.style.display = 'none';

    // Parse the response field which contains the product info as JSON string
    let data;
    try {
        data = JSON.parse(response.data.response);
    } catch (e) {
        showError('Lỗi xử lý dữ liệu phản hồi');
        showUpload();
        return;
    }

    // Display uploaded images section
    let imagesHtml = `
        <div class="section" style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #667eea;">
            <div class="section-title">📷 Ảnh đã tải lên (${selectedFiles.length})</div>
            <div class="preview-grid">
    `;

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            const container = document.querySelector(`[data-image-index="${index}"]`);
            if (container) {
                container.innerHTML = '';
                container.appendChild(img);
            }
        };
        reader.readAsDataURL(file);
        imagesHtml += `<div data-image-index="${index}" class="preview-item" style="background: #f0f0f0;"></div>`;
    });

    imagesHtml += `
            </div>
        </div>
    `;

    // Check if LLM extraction was successful
    if (!data.success) {
        let errorHtml = imagesHtml + `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div style="font-size: 18px; font-weight: 600; color: #d32f2f; margin-bottom: 8px;">Không thể trích xuất thông tin</div>
                <div style="color: #666; margin-bottom: 16px; font-size: 14px;">${escapeHtml(data.message)}</div>
        `;
        
        if (data.error_code && data.error_code !== 'NONE') {
            errorHtml += `<div style="color: #999; font-size: 12px; margin-bottom: 16px;">Mã lỗi: ${escapeHtml(data.error_code)}</div>`;
        }
        
        errorHtml += `</div>`;
        resultsContent.innerHTML = errorHtml;
        
        // Add reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'submit-btn';
        resetBtn.textContent = '↺ Tải lên ảnh mới';
        resetBtn.style.marginTop = '24px';
        resetBtn.onclick = resetApp;
        resultsContent.appendChild(resetBtn);
        return;
    }

    // Add images HTML to results
    resultsContent.innerHTML = imagesHtml;

    // Add images HTML to results
    resultsContent.innerHTML = imagesHtml;

    let html = `
        <div class="product-header">
            <div class="product-name">${escapeHtml(data.product_name)}</div>
            <div class="product-meta">
                ${data.product_type ? `<div class="meta-item">
                    <div class="meta-label">Loại</div>
                    <div class="meta-value">${escapeHtml(data.product_type)}</div>
                </div>` : ''}
                ${data.manufacturer ? `<div class="meta-item">
                    <div class="meta-label">Nhà sản xuất</div>
                    <div class="meta-value">${escapeHtml(data.manufacturer)}</div>
                </div>` : ''}
                ${data.registration_number ? `<div class="meta-item">
                    <div class="meta-label">Số đăng ký</div>
                    <div class="meta-value">${escapeHtml(data.registration_number)}</div>
                </div>` : ''}
            </div>
        </div>
    `;

    if (data.active_ingredients && data.active_ingredients.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">🧪 Thành phần hoạt chất</div>
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
                <div class="section-title">📋 Cách sử dụng & Liều lượng</div>
                <div class="dosage-box">${escapeHtml(data.dosage)}</div>
            </div>
        `;
    }

    if (data.target_crops && data.target_crops.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">🌱 Cây trồng</div>
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
                <div class="section-title">🐛 Sâu bệnh mục tiêu</div>
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
                <div class="section-title">⏰ Thời gian cách ly trước thu hoạch</div>
                <div class="dosage-box">${data.pre_harvest_interval_days} ngày</div>
            </div>
        `;
    }

    if (data.confidence_score !== undefined) {
        const confidence = data.confidence_score * 100;
        const confidenceClass = confidence >= 80 ? 'high' : 'low';
        html += `
            <div class="section" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                <span class="confidence ${confidenceClass}">
                    ✓ Độ tin cậy: ${confidence.toFixed(0)}%
                </span>
            </div>
        `;
    }

    resultsContent.innerHTML += html;

    // Add reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'submit-btn';
    resetBtn.textContent = '↺ Tải lên ảnh mới';
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