// =================================================================================
// CONFIGURATION
// =================================================================================
// 🔥 เปลี่ยนเป็น URL ของ Google Apps Script ของคุณ
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyhvbAaWzoG3Ldh3q2nT-i4DMSokCSN91ju5H23ksucuhYAEdtQHnuXXK9pQwWena2V/exec'; // ตัวอย่าง URL

// =================================================================================
// MODAL DOM ELEMENTS & FUNCTIONS
// =================================================================================
const statusModal = document.getElementById('statusModal');
const modalTitleElement = document.getElementById('modalTitle');
const modalMessageElement = document.getElementById('modalMessage');
const modalIconContainer = document.getElementById('modalIconContainer');
const modalSpinnerElement = document.getElementById('modalSpinner');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalCountdownElement = document.getElementById('modalCountdown');

let countdownInterval; // To store interval ID for countdown

// --- SVG Icons ---
const svgIconSuccess = `
<svg class="modal-icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
</svg>`;

const svgIconError = `
<svg class="modal-icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
</svg>`;

function showStatusModal(title, message, type = 'info', autoCloseDelay = 0, countdownSeconds = 0) {
    if (!statusModal || !modalTitleElement || !modalMessageElement || !modalIconContainer || !modalSpinnerElement || !modalCloseButton || !modalCountdownElement) {
        console.error("Modal elements not found!");
        // Fallback to alert if modal elements are missing
        alert(`${title}\n${message}`);
        return;
    }

    modalTitleElement.textContent = title;
    modalMessageElement.innerHTML = message; // Use innerHTML to allow for potential line breaks
    modalIconContainer.innerHTML = '';
    modalSpinnerElement.style.display = 'none';
    modalCloseButton.style.display = 'block';
    modalCountdownElement.textContent = '';
    modalCountdownElement.style.display = 'none';

    // Clear previous interval if any
    if (countdownInterval) clearInterval(countdownInterval);

    const modalContainer = statusModal.querySelector('.modal-container');
    modalContainer.classList.remove('modal-type-success', 'modal-type-error', 'modal-type-loading', 'modal-type-info');

    switch (type) {
        case 'loading':
            modalSpinnerElement.style.display = 'block';
            modalCloseButton.style.display = 'none';
            modalContainer.classList.add('modal-type-loading');
            break;
        case 'success':
            modalIconContainer.innerHTML = svgIconSuccess;
            modalContainer.classList.add('modal-type-success');
            if (countdownSeconds > 0) {
                modalCloseButton.style.display = 'none';
                modalCountdownElement.style.display = 'block';
                let count = countdownSeconds;
                modalCountdownElement.textContent = `กรุณารอสักครู่ จะนำท่านกลับไปที่ LINE ใน ${count} วินาที...`;
                countdownInterval = setInterval(() => {
                    count--;
                    if (count >= 0) {
                        modalCountdownElement.textContent = `กรุณารอสักครู่ จะนำท่านกลับไปที่ LINE ใน ${count} วินาที...`;
                    }
                    if (count < 0) { // Changed to < 0 to ensure 0 is displayed
                        clearInterval(countdownInterval);
                        // Action after countdown handled by calling function (handleSuccessResponse)
                    }
                }, 1000);
            }
            break;
        case 'error':
            modalIconContainer.innerHTML = svgIconError;
            modalContainer.classList.add('modal-type-error');
            break;
        case 'info':
        default:
            modalContainer.classList.add('modal-type-info');
            // Optional: Add an info icon
            break;
    }

    statusModal.classList.add('show');

    if (autoCloseDelay > 0 && type !== 'loading' && countdownSeconds === 0) {
        setTimeout(() => {
            hideStatusModal();
        }, autoCloseDelay);
    }
}

function hideStatusModal() {
    if (statusModal) statusModal.classList.remove('show');
    if (countdownInterval) clearInterval(countdownInterval); // Clear interval when hiding modal
}

if (modalCloseButton) {
    modalCloseButton.addEventListener('click', hideStatusModal);
}
// Hide modal on Escape key press
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && statusModal && statusModal.classList.contains('show')) {
        hideStatusModal();
    }
});


// =================================================================================
// DOM ELEMENTS (Original, less reliance on these for messages now)
// =================================================================================
const form = document.getElementById('userInfoForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
// const successMessage = document.getElementById('successMessage'); // Replaced by modal
// const errorMessage = document.getElementById('errorMessage');   // Replaced by modal

// =================================================================================
// INITIALIZATION
// =================================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script initialization started');

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        document.getElementById('lineUserId').value = userId;
        console.log('✅ User ID set:', userId);
    } else {
        console.warn('⚠️ No userId found in URL parameters');
        showStatusModal("ข้อผิดพลาดสำคัญ", "ไม่พบ User ID ที่จำเป็นสำหรับการทำงานของฟอร์มนี้ กรุณาเปิดฟอร์มผ่าน LINE อีกครั้ง หรือติดต่อผู้ดูแลค่ะ", "error");
        if(submitBtn) submitBtn.disabled = true;
        if(form) form.style.pointerEvents = 'none'; // Disable form interactions
    }

    console.log('🔗 GAS Webhook URL:', GAS_WEBHOOK_URL);
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL.length < 50) { // Basic check
        console.error('❌ GAS_WEBHOOK_URL not configured! Please update the URL in script.js');
        showStatusModal('ข้อผิดพลาดในการตั้งค่าระบบ', 'ระบบยังไม่ได้ตั้งค่า Google Apps Script URL หรือ URL ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบค่ะ', 'error');
        if(submitBtn) submitBtn.disabled = true;
        if(form) form.style.pointerEvents = 'none';
    }

    if (form) { // Only initialize if form exists
        initializeFormValidation();
        initializeFormSubmission();
    }
    console.log('✅ Form initialized successfully (or skipped if no form)');
});

// =================================================================================
// FORM VALIDATION (No changes from your original logic)
// =================================================================================
function initializeFormValidation() {
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
        if (input.name === 'phone') {
            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
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
    formGroup.classList.remove('error');

    if (field.value.trim() === "") { // Check empty for all required
        isValid = false;
    } else { // Specific validations only if not empty (unless type implies otherwise)
        switch (field.name) {
            case 'titlePrefix': if (!field.value) isValid = false; break;
            case 'firstName': case 'lastName': if (field.value.trim().length < 2) isValid = false; break;
            case 'phone': const phonePattern = /^[0-9]{9,10}$/; if (!phonePattern.test(field.value)) isValid = false; break;
            case 'houseNo': if (!field.value.trim()) isValid = false; break; // Already covered by general empty check
            case 'moo': if (!field.value) isValid = false; break;
        }
    }
    if (!isValid) formGroup.classList.add('error');
    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    // Clear error if field is not empty OR if it's a select with a value
    if ((field.value && field.value.trim() !== "") || (field.tagName === 'SELECT' && field.value !== "")) {
        formGroup.classList.remove('error');
    }
}

function validateAllFields() {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isFormValid = false;
        }
    });
    return isFormValid;
}

// =================================================================================
// FORM SUBMISSION (Updated to use Modal)
// =================================================================================
function initializeFormSubmission() {
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    console.log('📝 Form submission started');

    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL.length < 50) {
        showStatusModal('ข้อผิดพลาด', 'ระบบยังไม่ได้ตั้งค่า Google Apps Script URL กรุณาติดต่อผู้ดูแลระบบค่ะ', 'error');
        return;
    }

    if (!validateAllFields()) {
        showStatusModal('ข้อมูลไม่สมบูรณ์', 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย <span class="required">*</span> ให้ครบถ้วนและถูกต้องค่ะ', 'error', 6000);
        return;
    }

    const userId = document.getElementById('lineUserId').value;
    if (!userId) {
        showStatusModal('ข้อผิดพลาด', 'ไม่พบ User ID กรุณาเปิดฟอร์มผ่าน LINE อีกครั้งค่ะ', 'error');
        return;
    }

    setLoadingState(true);

    try {
        const formData = new FormData(form);
        const params = new URLSearchParams();
        
        // ตรวจสอบว่ามี formSource หรือไม่ และเพิ่มถ้าไม่มี
        if (!formData.has('formSource')) {
            formData.append('formSource', 'vercelUserInfoForm');
        }
        
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }

        console.log('📊 Form data to send:', Object.fromEntries(formData));
        console.log('🔗 Sending to URL:', GAS_WEBHOOK_URL);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 seconds timeout

        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📥 Response received: Status ' + response.status);
        const responseText = await response.text();
        console.log('📄 Raw response text:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ Parsed JSON response:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            if (responseText.toLowerCase().includes('success') || response.status === 200) {
                data = { status: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว กรุณากลับไปที่ LINE เพื่อดำเนินการต่อ' };
            } else {
                throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้องหรือไม่ใช่รูปแบบ JSON: ' + responseText.substring(0,150) + "...");
            }
        }
        
        setLoadingState(false);

        if (data.status === 'success') {
            handleSuccessResponse(data.message || 'บันทึกข้อมูลเรียบร้อยแล้ว กรุณากลับไปที่ LINE เพื่อดำเนินการต่อ');
        } else {
            throw new Error(data.message || 'เซิร์ฟเวอร์แจ้งว่าเกิดข้อผิดพลาด แต่ไม่ได้ระบุรายละเอียด');
        }

    } catch (error) {
        setLoadingState(false);
        console.error('💥 Form submission error:', error);
        let detailedErrorMessage = error.message;
        if (error.name === 'AbortError') {
            detailedErrorMessage = 'การเชื่อมต่อเซิร์ฟเวอร์หมดเวลา (Timeout) กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้งค่ะ';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            detailedErrorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของท่านค่ะ';
        } else if (error.message.includes('CORS')) {
             detailedErrorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ (CORS) ซึ่งอาจเกิดจากปัญหาการตั้งค่าฝั่งเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบค่ะ';
        }
        showStatusModal('เกิดข้อผิดพลาด', detailedErrorMessage, 'error');
    }
}

function handleSuccessResponse(message) {
    console.log('✅ Handling success response with modal');
    if (form) {
        form.style.display = 'none'; // Hide form
        // ซ่อนองค์ประกอบอื่นๆ เพื่อให้หน้าดูสะอาดขึ้น
        const header = document.querySelector('.header');
        const notice = document.querySelector('.notice');
        const footer = document.querySelector('.footer');
        if(header) header.style.display = 'none';
        if(notice) notice.style.display = 'none';
        if(footer) footer.style.display = 'none';
    }

    showStatusModal('สำเร็จ!', message, 'success', 0, 4); // 4 seconds countdown

    setTimeout(() => {
        hideStatusModal();
        redirectToLine();
    }, 4000); // Match countdownSeconds
}

// =================================================================================
// UI HELPER FUNCTIONS (Updated to use Modal)
// =================================================================================
function setLoadingState(isLoading) {
    if (submitBtn) submitBtn.disabled = isLoading;

    if (isLoading) {
        if (btnText) btnText.style.display = 'none';
        showStatusModal('กำลังบันทึกข้อมูล', 'กรุณารอสักครู่ ระบบกำลังดำเนินการ...', 'loading');
    } else {
        if (btnText) btnText.style.display = 'inline'; // Show button text again
        hideStatusModal(); // Hide loading modal
    }
}

// =================================================================================
// UTILITY FUNCTIONS & GLOBAL ERROR HANDLING
// =================================================================================
function redirectToLine() {
    console.log('🔄 Attempting to redirect to LINE');
    if (typeof liff !== 'undefined' && liff.isInClient()) {
        console.log('LIFF detected, trying liff.closeWindow()');
        liff.closeWindow();
    } else {
        // Fallback methods if LIFF is not available or not in LIFF browser
        try { window.close(); } catch (e) { console.log('Cannot close window directly.'); }
        // As a last resort, redirect to a generic LINE page, though this might not always be desired
        // window.location.href = 'https://line.me/R/nv/chat'; // Opens LINE app to chat list
        // Or simply leave the success message on screen if redirect is problematic
        console.log('Not in LIFF, user needs to manually return to LINE or app will redirect via GAS success.');
    }
}

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

window.addEventListener('error', function(e) {
    console.error('🚨 Global JavaScript error caught:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
    showStatusModal('เกิดข้อผิดพลาดในสคริปต์', `ระบบพบปัญหาทางเทคนิค (${e.message}). กรุณาลองรีเฟรชหน้า หรือติดต่อผู้ดูแลค่ะ`, 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    let reasonMessage = 'ไม่สามารถระบุสาเหตุได้';
    if (e.reason && e.reason.message) {
        reasonMessage = e.reason.message;
    } else if (typeof e.reason === 'string') {
        reasonMessage = e.reason;
    }
    showStatusModal('เกิดข้อผิดพลาด (Unhandled Promise)', `การประมวลผลบางอย่างไม่สำเร็จ (${reasonMessage}). กรุณาลองอีกครั้งค่ะ`, 'error');
});

// Debug information
console.log('📋 Debug Information:');
console.log('   User Agent:', navigator.userAgent);
console.log('   URL:', window.location.href);
console.log('   Timestamp:', new Date().toISOString());
console.log('   GAS URL configured:', !(GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL.length < 50) );

// Check if all required elements exist
const coreElements = ['userInfoForm', 'submitBtn', 'btnText', 'statusModal', 'modalTitle', 'modalMessage', 'modalIconContainer', 'modalSpinner', 'modalCloseButton', 'modalCountdown'];
coreElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Core element not found in DOM: ${id}`);
    } else {
        console.log(`✅ Core element found: ${id}`);
    }
});

// Optional: LIFF Initialization (if you plan to use LIFF SDK features)
/*
document.addEventListener('DOMContentLoaded', function() {
    // Initialize LIFF
    liff.init({ liffId: "YOUR_LIFF_ID_HERE" }) // 🔥 Replace with your LIFF ID
        .then(() => {
            console.log('LIFF initialized successfully.');
            if (!liff.isLoggedIn() && !liff.isInClient()) {
                // liff.login(); // Uncomment to force login if not in LIFF client
            }
            // You can get user profile, send messages, etc. using LIFF SDK here
        })
        .catch((err) => {
            console.error('LIFF initialization failed:', err);
            showStatusModal("LIFF Error", "เกิดข้อผิดพลาดในการโหลด LIFF: " + err.message, "error");
        });
});
*/
