// =================================================================================
// CONFIGURATION
// =================================================================================
// 🔥 เปลี่ยนเป็น URL ของ Google Apps Script ของคุณ
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyhvbAaWzoG3Ldh3q2nT-i4DMSokCSN91ju5H23ksucuhYAEdtQHnuXXK9pQwWena2V/exec';

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
    console.log('🚀 Script initialization started');
    
    // Get userId from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    console.log('📊 URL Parameters:', {
        fullURL: window.location.href,
        search: window.location.search,
        userId: userId
    });
    
    if (userId) {
        document.getElementById('lineUserId').value = userId;
        console.log('✅ User ID set:', userId);
    } else {
        console.warn('⚠️ No userId found in URL parameters');
        // For testing purposes, you can set a dummy userId
        // document.getElementById('lineUserId').value = 'test-user-123';
    }

    // Check GAS URL configuration
    console.log('🔗 GAS Webhook URL:', GAS_WEBHOOK_URL);
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE')) {
        console.error('❌ GAS_WEBHOOK_URL not configured! Please update the URL in script.js');
        showError('ระบบยังไม่ได้ตั้งค่า กรุณาติดต่อผู้ดูแลระบบ');
    }

    // Initialize form validation
    initializeFormValidation();
    
    // Initialize form submission
    initializeFormSubmission();
    
    console.log('✅ Form initialized successfully');
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
    
    console.log('📝 Form submission started');
    console.log('🔍 Current timestamp:', new Date().toISOString());
    
    // Hide previous messages
    hideMessages();
    
    // Check GAS URL configuration first
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE')) {
        console.error('❌ GAS URL not configured');
        showError('ระบบยังไม่ได้ตั้งค่า Google Apps Script URL กรุณาติดต่อผู้ดูแลระบบ');
        return;
    }
    
    // Validate all fields
    if (!validateAllFields()) {
        console.warn('⚠️ Form validation failed');
        showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        return;
    }
    
    // Check if userId exists
    const userId = document.getElementById('lineUserId').value;
    if (!userId) {
        console.warn('⚠️ No User ID found');
        showError('ไม่พบ User ID กรุณาเปิดฟอร์มผ่าน LINE อีกครั้ง');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const formData = new FormData(form);
        const formDataObj = Object.fromEntries(formData);
        
        console.log('📊 Form data to send:', formDataObj);
        console.log('🔗 Sending to URL:', GAS_WEBHOOK_URL);
        
        // Convert FormData to URLSearchParams for GAS compatibility
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        
        console.log('📤 Request payload:', params.toString());
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Response received:');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Try to parse response as JSON
        let data;
        const responseText = await response.text();
        console.log('📄 Raw response text:', responseText);
        
        try {
            data = JSON.parse(responseText);
            console.log('✅ Parsed JSON response:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            console.log('📄 Response was not valid JSON, treating as text');
            
            // If response is not JSON, check if it looks like success
            if (responseText.includes('success') || response.status === 200) {
                data = { status: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว' };
            } else {
                throw new Error('ได้รับการตอบกลับที่ไม่ถูกต้องจากเซิร์ฟเวอร์');
            }
        }
        
        if (data.status === 'success') {
            console.log('🎉 Form submission successful');
            handleSuccessResponse(data.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
        } else {
            console.error('❌ Server returned error:', data);
            throw new Error(data.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
        }
        
    } catch (error) {
        console.error('💥 Form submission error:', error);
        
        // Handle different types of errors
        if (error.name === 'AbortError') {
            console.error('⏰ Request timeout');
            handleErrorResponse('การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง');
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            console.error('🌐 Network error');
            handleErrorResponse('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        } else if (error.message.includes('CORS')) {
            console.error('🚫 CORS error');
            handleErrorResponse('เกิดข้อผิดพลาดในการเชื่อมต่อ (CORS) กรุณาติดต่อผู้ดูแลระบบ');
        } else {
            handleErrorResponse(error.message);
        }
    } finally {
        setLoadingState(false);
    }
}

function handleSuccessResponse(message) {
    console.log('✅ Handling success response');
    
    // Show success message
    successMessage.textContent = '✅ ' + message;
    successMessage.style.display = 'block';
    
    // Hide form
    form.style.display = 'none';
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
        console.log('🔄 Auto redirecting...');
        redirectToLine();
    }, 3000);
}

function handleErrorResponse(errorMessage) {
    console.error('❌ Handling error response:', errorMessage);
    
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
    console.log('🔄 Setting loading state:', isLoading);
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
    console.error('🚨 Showing error:', message);
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    
    // Auto hide after 8 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 8000);
}

function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

function redirectToLine() {
    console.log('🔄 Attempting to redirect to LINE');
    
    // Try multiple methods to close/redirect
    try {
        // Method 1: Try to close the window (works if opened by script)
        console.log('🔄 Trying to close window...');
        window.close();
    } catch (e) {
        console.log('❌ Cannot close window:', e.message);
    }
    
    // Method 2: Try to go back in history
    try {
        if (window.history.length > 1) {
            console.log('🔄 Going back in history...');
            window.history.back();
            return;
        }
    } catch (e) {
        console.log('❌ Cannot go back in history:', e.message);
    }
    
    // Method 3: Redirect to LINE
    try {
        console.log('🔄 Redirecting to LINE...');
        window.location.href = 'https://line.me/';
    } catch (e) {
        console.log('❌ Cannot redirect to LINE:', e.message);
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

// =================================================================================
// ERROR HANDLING & DEBUGGING
// =================================================================================
window.addEventListener('error', function(e) {
    console.error('🚨 Global error caught:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
    showError('เกิดข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าและลองอีกครั้ง');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    showError('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองอีกครั้ง');
});

// Connection test function
async function testConnection() {
    console.log('🧪 Testing connection to GAS...');
    
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE')) {
        console.error('❌ Cannot test: GAS URL not configured');
        return;
    }
    
    try {
        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'GET',
            mode: 'cors'
        });
        console.log('✅ Connection test result:', response.status, response.statusText);
    } catch (error) {
        console.error('❌ Connection test failed:', error);
    }
}

// Debug information
console.log('📋 Debug Information:');
console.log('   User Agent:', navigator.userAgent);
console.log('   URL:', window.location.href);
console.log('   Timestamp:', new Date().toISOString());
console.log('   GAS URL configured:', !GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE'));

// Check if all required elements exist
const requiredElements = ['userInfoForm', 'submitBtn', 'btnText', 'loadingSpinner', 'successMessage', 'errorMessage'];
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Required element not found: ${id}`);
    } else {
        console.log(`✅ Element found: ${id}`);
    }
});

// Auto-test connection when page loads (optional)
// setTimeout(testConnection, 2000);