// =================================================================================
// CONFIGURATION
// =================================================================================
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'; // 🔥 เปลี่ยนเป็น URL จริง

// =================================================================================
// DOM ELEMENTS
// =================================================================================
const form = document.getElementById('userInfoForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// =================================================================================
// INITIALIZATION
// =================================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Get userId from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (userId) {
        document.getElementById('lineUserId').value = userId;
        console.log('User ID from URL:', userId);
    } else {
        console.warn('No userId found in URL parameters');
    }

    // Initialize form validation
    initializeFormValidation();
    
    // Initialize form submission
    initializeFormSubmission();
    
    console.log('Form initialized successfully');
});

// =================================================================================
// FORM VALIDATION
// =================================================================================
function initializeFormValidation() {
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
        
        // Special handling for phone input
        if (input.name === 'phone') {
            input.addEventListener('input', function(e) {
                // Remove non-numeric characters
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                // Limit to 10 digits
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                }
            });
        }
    });
}

function validateField(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    let isValid = true;

    // Clear previous error state
    formGroup.classList.remove('error');

    // Check if field is empty
    if (!field.value.trim()) {
        isValid = false;
    }

    // Specific validation rules
    switch (field.name) {
        case 'titlePrefix':
            if (!field.value) {
                isValid = false;
            }
            break;
        
        case 'firstName':
        case 'lastName':
            if (field.value.trim().length < 2) {
                isValid = false;
            }
            break;
        
        case 'phone':
            const phonePattern = /^[0-9]{9,10}$/;
            if (!phonePattern.test(field.value)) {
                isValid = false;
            }
            break;
        
        case 'houseNo':
            if (!field.value.trim()) {
                isValid = false;
            }
            break;
        
        case 'moo':
            if (!field.value) {
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        formGroup.classList.add('error');
    }

    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    
    if (field.value.trim()) {
        formGroup.classList.remove('error');
    }
}

function validateAllFields() {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        const isFieldValid = validateField({ target: input });
        if (!isFieldValid) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// =================================================================================
// FORM SUBMISSION
// =================================================================================
function initializeFormSubmission() {
    form.addEventListener('submit', handleFormSubmission);
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    console.log('Form submission started');
    
    // Hide previous messages
    hideMessages();
    
    // Validate all fields
    if (!validateAllFields()) {
        showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        return;
    }
    
    // Check if userId exists
    const userId = document.getElementById('lineUserId').value;
    if (!userId) {
        showError('ไม่พบ User ID กรุณาเปิดฟอร์มผ่าน LINE อีกครั้ง');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const formData = new FormData(form);
        console.log('Sending form data:', Object.fromEntries(formData));
        
        // Convert FormData to URLSearchParams for GAS compatibility
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        
        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.status === 'success') {
            handleSuccessResponse(data.message);
        } else {
            throw new Error(data.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        handleErrorResponse(error.message);
    } finally {
        setLoadingState(false);
    }
}

function handleSuccessResponse(message) {
    console.log('Form submitted successfully');
    
    // Show success message
    successMessage.textContent = '✅ ' + message;
    successMessage.style.display = 'block';
    
    // Hide form
    form.style.display = 'none';
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
        redirectToLine();
    }, 3000);
}

function handleErrorResponse(errorMessage) {
    console.error('Form submission failed:', errorMessage);
    
    let displayMessage = errorMessage;
    
    // Handle common error messages
    if (errorMessage.includes('CORS')) {
        displayMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง';
    } else if (errorMessage.includes('fetch')) {
        displayMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    } else if (errorMessage.includes('timeout')) {
        displayMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง';
    }
    
    showError(displayMessage);
}

// =================================================================================
// UI HELPER FUNCTIONS
// =================================================================================
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        btnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

function redirectToLine() {
    // Try multiple methods to close/redirect
    try {
        // Method 1: Try to close the window (works if opened by script)
        window.close();
    } catch (e) {
        console.log('Cannot close window, trying alternative methods');
    }
    
    // Method 2: Try to go back in history
    try {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
    } catch (e) {
        console.log('Cannot go back in history');
    }
    
    // Method 3: Redirect to LINE
    try {
        window.location.href = 'https://line.me/';
    } catch (e) {
        console.log('Cannot redirect to LINE');
    }
}

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced validation for better UX
const debouncedValidation = debounce(validateField, 300);

// =================================================================================
// ERROR HANDLING & DEBUGGING
// =================================================================================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('เกิดข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าและลองอีกครั้ง');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองอีกครั้ง');
});

// Debug information
console.log('Script loaded successfully');
console.log('GAS Webhook URL:', GAS_WEBHOOK_URL);

// Check if all required elements exist
const requiredElements = ['userInfoForm', 'submitBtn', 'btnText', 'loadingSpinner', 'successMessage', 'errorMessage'];
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Required element not found: ${id}`);
    }
});

// =================================================================================
// ADDITIONAL FEATURES
// =================================================================================

// Auto-save form data to localStorage (optional)
function saveFormData() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    delete data.lineUserId; // Don't save sensitive data
    delete data.formSource;
    
    try {
        localStorage.setItem('repairFormData', JSON.stringify(data));
    } catch (e) {
        console.log('Cannot save form data to localStorage');
    }
}

// Restore form data from localStorage (optional)
function restoreFormData() {
    try {
        const savedData = localStorage.getItem('repairFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && data[key]) {
                    field.value = data[key];
                }
            });
        }
    } catch (e) {
        console.log('Cannot restore form data from localStorage');
    }
}

// Auto-save on input change
form.addEventListener('input', debounce(saveFormData, 1000));

// Restore data on page load (uncomment if needed)
// document.addEventListener('DOMContentLoaded', restoreFormData);