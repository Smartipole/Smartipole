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
    let userId = urlParams.get('userId'); // Use let to allow reassignment

    const userProvidedTestId = "Uee7cb6da7cfafcd0d0e6a7b1fc462ecc"; // User's provided test ID

    console.log('📊 URL Parameters:', {
        fullURL: window.location.href,
        search: window.location.search,
        userIdFromUrl: userId
    });

    if (userId) {
        document.getElementById('lineUserId').value = userId;
        console.log('✅ User ID from URL set:', userId);
    } else {
        console.warn('⚠️ No userId found in URL parameters. Attempting to use user-provided test User ID.');
        // If no userId from URL, use the test ID provided by the user
        userId = userProvidedTestId; // Assign test ID
        if (userId) {
            document.getElementById('lineUserId').value = userId;
            console.log('🧪 Using TEST User ID (provided by user):', userId);

            // Optionally, display a message on the form that it's in test mode
            const testModeNotice = document.createElement('p');
            testModeNotice.innerHTML = `โหมดทดสอบ: <br>กำลังใช้ User ID: <b style="word-break:break-all;">${userId}</b>`;
            testModeNotice.style.color = '#d9534f'; // A more visible error-like color
            testModeNotice.style.backgroundColor = '#f2dede';
            testModeNotice.style.border = '1px solid #ebccd1';
            testModeNotice.style.padding = '10px';
            testModeNotice.style.borderRadius = 'var(--radius-md)';
            testModeNotice.style.textAlign = 'center';
            testModeNotice.style.marginBottom = '1rem';
            testModeNotice.style.fontSize = '0.9rem';
            if (form && form.parentNode) {
                 form.parentNode.insertBefore(testModeNotice, form);
            } else {
                console.error("Could not find form or form parent to insert test mode notice.");
            }

        } else {
            console.error('❌ Critical: No userId from URL and no test User ID available.');
            showError('ไม่สามารถดึง User ID ได้ และไม่มี User ID สำหรับทดสอบ กรุณาเปิดผ่าน LINE หรือตรวจสอบการตั้งค่า');
            // Disable form submission if no ID is available at all
            if(submitBtn) submitBtn.disabled = true;
        }
    }

    // Check GAS URL configuration
    console.log('🔗 GAS Webhook URL:', GAS_WEBHOOK_URL);
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL === '' || GAS_WEBHOOK_URL === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
        console.error('❌ GAS_WEBHOOK_URL not configured! Please update the URL in script.js');
        showError('ระบบยังไม่ได้ตั้งค่า Google Apps Script URL กรุณาติดต่อผู้ดูแลระบบ');
         if(submitBtn) submitBtn.disabled = true;
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
    if (!form) {
        console.error("Form element not found for validation initialization.");
        return;
    }
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
    if (!formGroup) return true; // Should not happen if structure is correct

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

        case 'houseNo': // Assuming houseNo is required
            if (!field.value.trim()) {
                isValid = false;
            }
            break;

        case 'moo': // Assuming moo is required
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
    if (!formGroup) return;

    if (field.value.trim() || (field.tagName === 'SELECT' && field.value)) {
        formGroup.classList.remove('error');
    }
}

function validateAllFields() {
    if (!form) {
        console.error("Form element not found for validation.");
        return false;
    }
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
    if (!form) {
        console.error("Form element not found for submission initialization.");
        return;
    }
    form.addEventListener('submit', handleFormSubmission);
}

async function handleFormSubmission(e) {
    e.preventDefault();

    console.log('📝 Form submission started');
    console.log('🔍 Current timestamp:', new Date().toISOString());

    // Hide previous messages
    hideMessages();

    // Check GAS URL configuration first
    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL === '' || GAS_WEBHOOK_URL === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
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
    const lineUserIdElement = document.getElementById('lineUserId');
    if (!lineUserIdElement || !lineUserIdElement.value) {
        console.warn('⚠️ No User ID found in hidden field');
        showError('ไม่พบ User ID กรุณาเปิดฟอร์มผ่าน LINE อีกครั้ง หรือตรวจสอบการตั้งค่าทดสอบ');
        return;
    }
    const userIdValue = lineUserIdElement.value;

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
            mode: 'cors', // Important for cross-origin requests
            body: params, // GAS expects x-www-form-urlencoded, which URLSearchParams provides
            signal: controller.signal
            // 'Content-Type' header is automatically set by browser for URLSearchParams
        });

        clearTimeout(timeoutId);

        console.log('📥 Response received:');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text(); // Get text first for logging
        console.log('📄 Raw response text:', responseText);

        if (!response.ok) {
            // Try to parse error message from GAS if it's JSON
            try {
                const errorData = JSON.parse(responseText);
                if (errorData && errorData.message) {
                    throw new Error(`Server error: ${errorData.message} (Status: ${response.status})`);
                }
            } catch (jsonParseError) {
                // Not a JSON error from GAS, or malformed JSON
                console.warn("Could not parse error response as JSON from GAS.");
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${responseText.substring(0,100)}`);
        }

        // Try to parse as JSON, as GAS should return JSON on success
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ Parsed JSON response from GAS:', data);
            if (data.status === "success") {
                handleSuccessResponse(data.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
            } else {
                // GAS returned a 200 OK but with an error status in JSON
                throw new Error(data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ตามที่ระบุใน JSON');
            }
        } catch (parseError) {
            // If GAS returns 200 OK but the response is not valid JSON, or JSON status is not "success"
            console.error('❌ Error parsing successful response as JSON, or JSON status was not "success". Response text:', responseText);
            throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง กรุณาตรวจสอบ Console Log ใน Google Apps Script');
        }

    } catch (error) {
        console.error('💥 Form submission error:', error);
        let displayErrorMessage = error.message;

        if (error.name === 'AbortError') {
            console.error('⏰ Request timeout');
            displayErrorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง';
        } else if (error.message.toLowerCase().includes('failed to fetch')) {
            // This can be CORS, network down, or DNS issues
            console.error('🌐 Network error or CORS issue. Check browser console for more details.');
            displayErrorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต และตรวจสอบว่า Google Apps Script ได้ตั้งค่า CORS อย่างถูกต้อง (doOptions)';
        }
        // No need for specific CORS message here as "Failed to fetch" often covers it,
        // and the browser console will show the actual CORS error.

        handleErrorResponse(displayErrorMessage);
    } finally {
        setLoadingState(false);
    }
}


function handleSuccessResponse(message) {
    console.log('✅ Handling success response');

    if (form) form.style.display = 'none';

    showSuccessModal(message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
}

function handleErrorResponse(errorMessageText) {
    console.error('❌ Handling error response:', errorMessageText);
    showError(errorMessageText);
}

// =================================================================================
// UI HELPER FUNCTIONS
// =================================================================================
function setLoadingState(isLoading) {
    if (!submitBtn || !btnText || !loadingSpinner) {
        console.warn("UI elements for loading state not found.");
        return;
    }
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
    if (!errorMessage) {
        console.error("Error message element not found. Cannot display:", message);
        alert("Error: " + message); // Fallback to alert
        return;
    }
    console.error('🚨 Showing error:', message);
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    errorMessage.setAttribute('aria-live', 'assertive');

    // Auto hide after 8 seconds
    setTimeout(() => {
        if (errorMessage) errorMessage.style.display = 'none';
    }, 8000);
}

function hideMessages() {
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function redirectToLine() {
    console.log('🔄 Attempting to redirect to LINE / close window');

    // Check if LIFF is available and in LINE client
    if (typeof liff !== 'undefined' && liff.isInClient && liff.isInClient()) {
        console.log('🚀 Using liff.closeWindow()');
        liff.closeWindow();
        return; // LIFF handled it
    }

    console.log('⚠️ LIFF not available or not in LINE client, trying fallback methods.');

    // Fallback methods (less reliable)
    try {
        // Method 1: Try to close the window (works if opened by script)
        if (window.opener && !window.opener.closed) {
            console.log('🔄 Trying to close window (window.close())...');
            window.close();
            // Check if closed (might not work due to browser restrictions)
            // No reliable way to check if window.close() succeeded immediately
            return;
        }
    } catch (e) {
        console.log('❌ Cannot close window with window.close():', e.message);
    }

    try {
        // Method 2: Try to go back in history
        if (window.history && window.history.length > 1) {
            console.log('🔄 Going back in history (window.history.back())...');
            window.history.back();
            return;
        }
    } catch (e) {
        console.log('❌ Cannot go back in history:', e.message);
    }

    // Method 3: Redirect to a generic LINE URL (least likely to work as intended for closing)
    // This might open the LINE app or a LINE webpage, but won't necessarily return to the chat.
    console.log('🔄 Attempting to redirect to LINE app (line://ti/p/@yourlineoa) or LINE main page...');
    // Replace @yourlineoa with your actual LINE OA ID if you have one, or a general LINE URL.
    // window.location.href = 'line://'; // This is very generic
    window.location.href = 'https://line.me/R/nv/chat'; // Tries to open the chat list in LINE app
    // If the above doesn't work or isn't desired, provide a clear message to the user.
    // It's often better to just inform the user to manually switch back.
}


// =================================================================================
// SUCCESS MODAL FUNCTIONS
// =================================================================================
function showSuccessModal(message) {
    // Create modal HTML
    const modalHTML = `
        <div id="successModal" class="modal-overlay">
            <div class="modal-container">
                <div class="modal-content">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 12l3 3 5-6"/>
                        </svg>
                    </div>
                    <h2 class="modal-title">สำเร็จ!</h2>
                    <p class="modal-message">${message}</p>
                    <p class="modal-submessage">ระบบจะพยายามนำท่านกลับไปยัง LINE ใน <span id="countdownNumber" style="font-weight:bold;">3</span> วินาที</p>
                    <div class="countdown-container" style="display:none;"> <div class="countdown-circle">
                            <span id="countdownCircleNumber">3</span>
                        </div>
                    </div>
                    <button id="closeModalBtn" class="modal-close-btn">
                        กลับไป LINE ทันที
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const modal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const countdownElement = document.getElementById('countdownNumber'); // Text countdown
    // const countdownCircleNumber = document.getElementById('countdownCircleNumber'); // Circle countdown (if used)

    // Show modal with animation
    setTimeout(() => {
        if(modal) modal.classList.add('show');
    }, 100); // Small delay to ensure styles are applied for transition

    // Countdown timer
    let countdown = 3;
    if(countdownElement) countdownElement.textContent = countdown;
    // if(countdownCircleNumber) countdownCircleNumber.textContent = countdown;

    const countdownInterval = setInterval(() => {
        countdown--;
        if(countdownElement) countdownElement.textContent = countdown;
        // if(countdownCircleNumber) countdownCircleNumber.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            closeModalAndRedirect();
        }
    }, 1000);

    // Close button event
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            closeModalAndRedirect();
        });
    }

    // Close modal function
    function closeModalAndRedirect() {
        if(modal) {
            modal.classList.remove('show'); // Start fade out
            modal.classList.add('hide'); // Optional: for different hide animation
            setTimeout(() => {
                if(modal && modal.parentNode) modal.remove(); // modal.parentNode.removeChild(modal)
                redirectToLine();
            }, 400); // Match transition duration in CSS
        } else {
            redirectToLine(); // If modal somehow already removed
        }
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
    // Avoid showing generic error if a specific one is already displayed
    if (errorMessage && errorMessage.style.display === 'none') {
        showError('เกิดข้อผิดพลาดบางอย่างในหน้าเว็บ กรุณารีเฟรชและลองอีกครั้ง');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
     if (errorMessage && errorMessage.style.display === 'none') {
        showError('เกิดข้อผิดพลาดไม่คาดคิดในการประมวลผล กรุณาลองอีกครั้ง');
    }
});

// Connection test function (can be called from console)
async function testGasConnection() {
    console.log('🧪 Testing connection to GAS...');

    if (GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL === '' || GAS_WEBHOOK_URL === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
        console.error('❌ Cannot test: GAS URL not configured correctly in script.js');
        alert('GAS URL is not configured. Please check script.js.');
        return;
    }

    try {
        // A simple GET request to GAS (doGet function should handle it)
        const response = await fetch(GAS_WEBHOOK_URL, {
            method: 'GET', // Or POST if your doGet doesn't allow GETs or if you want to test doOptions
            mode: 'cors'
        });
        console.log('✅ Connection test to GAS - Status:', response.status, response.statusText);
        const responseBody = await response.text();
        console.log('✅ Connection test to GAS - Response Body:', responseBody.substring(0, 200) + (responseBody.length > 200 ? "..." : ""));
        alert(`Connection test to GAS: ${response.status} ${response.statusText}. Response: ${responseBody.substring(0,50)}...`);
    } catch (error) {
        console.error('❌ Connection test to GAS failed:', error);
        alert(`Connection test to GAS failed: ${error.message}. Check console for details.`);
    }
}

// Debug information
console.log('📋 Debug Information:');
console.log('   User Agent:', navigator.userAgent);
console.log('   URL:', window.location.href);
console.log('   Timestamp:', new Date().toISOString());
console.log('   GAS URL configured:', !(GAS_WEBHOOK_URL.includes('YOUR_ACTUAL_GAS_URL_HERE') || GAS_WEBHOOK_URL === '' || GAS_WEBHOOK_URL === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'));

// Check if all required DOM elements exist
const requiredElementIDs = ['userInfoForm', 'lineUserId', 'submitBtn', 'btnText', 'loadingSpinner', 'successMessage', 'errorMessage'];
requiredElementIDs.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Critical DOM element not found: #${id}. Form functionality may be impaired.`);
    } else {
        // console.log(`✅ DOM Element found: #${id}`);
    }
});

// LIFF Initialization (Optional - if you plan to use LIFF)
/*
async function initializeLiff() {
    try {
        // Replace "YOUR_LIFF_ID" with your actual LIFF ID
        await liff.init({ liffId: "YOUR_LIFF_ID" });
        if (!liff.isLoggedIn() && !liff.isInClient()) {
            // liff.login(); // Uncomment to force login if not in LINE client and not logged in
            console.warn("LIFF: Not logged in and not in LINE client.");
        } else {
            console.log("LIFF: Initialized.");
            if(liff.isInClient()){
                console.log("LIFF: Running inside LINE client.");
            }
            const profile = await liff.getProfile();
            console.log("LIFF Profile:", profile);
            // You could potentially use liff.getProfile().userId if userId is not in URL
            // and it's a LIFF app.
        }
    } catch (error) {
        console.error("LIFF initialization failed:", error);
        // showError("ไม่สามารถเริ่มต้น LIFF ได้: " + error.message);
    }
}
// Call LIFF initialization if you have included the LIFF SDK
// if (typeof liff !== 'undefined') {
// initializeLiff();
// } else {
// console.log("LIFF SDK not found.");
// }
*/
