document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. 기본 요소 선택 ---
    const form = document.getElementById("pro-contact-form");
    const formPane = document.querySelector(".form-pane");
    const successMessage = document.getElementById("success-message");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-form-btn");

    // 업그레이드용 필드 선택
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const fullNameInput = document.getElementById("full-name");
    const companyInput = document.getElementById("company-name");
    

    // --- 2. 인라인 유효성 검사 ---
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.add('error');
        formGroup.classList.remove('valid');
        errorElement.textContent = message;
        formGroup.classList.add('shake');
        formGroup.addEventListener('animationend', () => {
            formGroup.classList.remove('shake');
        }, { once: true });
    }
    
    function showSuccess(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.remove('error');
        formGroup.classList.add('valid');
        errorElement.textContent = ''; 
    }

    function clearErrors() {
        document.querySelectorAll('.form-group.error').forEach(formGroup => {
            formGroup.classList.remove('error');
        });
         document.querySelectorAll('.form-group.valid').forEach(formGroup => {
            formGroup.classList.remove('valid');
        });
        document.querySelectorAll('.error-message').forEach(errorElement => {
            errorElement.textContent = '';
        });
    }

    function validateForm() {
        clearErrors(); 
        let isValid = true;
        const inputs = Array.from(form.querySelectorAll("input[required], select[required]"));
        
        for (const input of inputs) {
            const value = input.value.trim();
            
            if (input.type === "checkbox") {
                if (!input.checked) {
                    isValid = false;
                    showError(input, "개인정보 수집 및 이용에 동의해주세요.");
                }
            } 
            else if (!value) {
                isValid = false;
                const label = input.closest('.form-group').querySelector('label');
                const fieldName = label ? label.innerText.replace(' *', '') : '필수 항목';
                showError(input, `${fieldName} 항목을 입력해주세요.`);
            }
            else if (input.id === 'phone') { 
                const phoneValue = value.replace(/-/g, ""); 
                if (!/^\d+$/.test(phoneValue)) { 
                    isValid = false;
                    showError(input, "전화번호는 숫자만 입력해주세요.");
                } else if (phoneValue.length < 10 || phoneValue.length > 11) { 
                    isValid = false;
                    showError(input, "전화번호 10자리 또는 11자리를 입력해주세요.");
                } else {
                    showSuccess(input); 
                }
            }
            else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                showError(input, "유효한 이메일 주소를 입력해주세요.");
            }
             else if (input.type === "email") { 
                showSuccess(input);
            }
        }
        return isValid;
    }


    // --- 3. 폼 제출 및 리셋 로직 ---

    function resetForm() {
        form.reset();
        clearErrors();
        successMessage.style.display = "none";
        form.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.innerHTML = "무료 자료 다운로드";
        
        loadSavedInfo();
    }

    // "제출" 버튼 클릭
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        if (!validateForm()) return; 

        // --- 백엔드 전송 로직 시작 ---
        // ========== [확인] 선생님의 실제 URL ==========
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzazRqPAItheJMgc3vCCcGkhtnePiPlC-EMhRLd0GO0MCmTIp0_EAaGrQPBq3gxfIWw/exec";
        // ==========================================
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.phone) {
            data.phone = data.phone.replace(/-/g, "");
        }
        
        // ========== [확인] "자료 다운로드"가 정확히 전송됩니다 ==========
        data.lead_source = "자료 다운로드";
        // ====================================================
        
        saveInfoToStorage(data); 

        submitBtn.disabled = true;
        submitBtn.innerHTML = '전송 중... <span class="spinner"></span>';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            // ========== [확인] 엣지(Edge) 오류 해결된 헤더 ==========
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            // =================================================
            body: JSON.stringify(data) 
        })
        .then(response => {
            console.log('Success:', data);
            form.style.display = "none";
            successMessage.style.display = "block";
            
            triggerConfetti();
            
            localStorage.removeItem('udemyLeadInfo'); 
        })
        .catch(error => {
            console.error('Error:', error);
            alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "무료 자료 다운로드";
        });
        // --- 백엔드 전송 로직 끝 ---
    });

    // "확인" 버튼 (리셋)
    resetBtn.addEventListener("click", resetForm);


    // --- 4. "극도의 업그레이드" 기능들 ---
    
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    function autoFormatPhone(e) {
        let value = e.target.value.replace(/\D/g, ""); 
        let length = value.length;
        
        if (length > 11) value = value.substring(0, 11);
        
        if (length < 4) {
             e.target.value = value;
        } else if (length < 7) {
             e.target.value = `${value.substring(0,3)}-${value.substring(3)}`;
        } else if (length < 11) {
             e.target.value = `${value.substring(0,3)}-${value.substring(3,6)}-${value.substring(6)}`;
        } else {
             e.target.value = `${value.substring(0,3)}-${value.substring(3,7)}-${value.substring(7)}`;
        }
    }
    
    function validateEmailRealtime(e) {
        const value = e.target.value.trim();
        const formGroup = e.target.closest('.form-group');

        if (value === "") { 
            formGroup.classList.remove('valid', 'error');
            formGroup.querySelector('.error-message').textContent = '';
            return;
        }
        
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showSuccess(e.target);
            formGroup.querySelector('.error-message').textContent = ''; 
        } else {
            formGroup.classList.add('error');
            formGroup.classList.remove('valid');
            formGroup.querySelector('.error-message').textContent = '유효한 이메일 주소를 입력해주세요.';
        }
    }
    
    function saveInfoToStorage(data) {
        try {
            const info = {
                fullName: data.full_name,
                email: data.email,
                companyName: data.company_name
            };
            localStorage.setItem('udemyLeadInfo', JSON.stringify(info));
        } catch (e) {
            console.warn("LocalStorage: " + e.message);
        }
    }
    
    function loadSavedInfo() {
         try {
            const savedInfo = localStorage.getItem('udemyLeadInfo');
            if (savedInfo) {
                const info = JSON.parse(savedInfo);
                if (info.fullName && fullNameInput) fullNameInput.value = info.fullName;
                if (info.email && emailInput) {
                    emailInput.value = info.email;
                    validateEmailRealtime({ target: emailInput }); 
                }
                if (info.companyName && companyInput) companyInput.value = info.companyName;
            }
        } catch (e) {
            console.warn("LocalStorage: " + e.message);
        }
    }

    // --- 5. 3D 틸트 & 빛 반사 효과 ---
    const container = document.querySelector(".form-container");
    const glare = document.querySelector(".glare");

    if (container && glare) {
        container.addEventListener("mousemove", (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const maxRotate = 2; 
            const tiltX = (y / rect.height - 0.5) * -maxRotate; 
            const tiltY = (x / rect.width - 0.5) * maxRotate * 2;
            container.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 70%)`;
            glare.style.opacity = '1';
        });

        container.addEventListener("mouseleave", () => {
            container.style.transform = "rotateX(0deg) rotateY(0deg)";
            glare.style.opacity = '0';
        });
    }
    
    // --- 6. 초기화 실행 ---
    loadSavedInfo(); 
    if (phoneInput) phoneInput.addEventListener('input', autoFormatPhone); 
    if (emailInput) emailInput.addEventListener('blur', validateEmailRealtime); 

}); // DOMContentLoaded 끝
