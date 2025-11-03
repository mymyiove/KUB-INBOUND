document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. 기본 요소 선택 ---
    const form = document.getElementById("pro-contact-form");
    const formPane = document.querySelector(".form-pane");
    const successMessage = document.getElementById("success-message");
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
    const progressFill = document.getElementById("progress-fill");
    
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-form-btn");
    
    let currentStep = 1;
    const totalSteps = steps.length;
    const progressStepTexts = progressSteps.map(step => step.innerHTML);


    // --- 2. 폼 스텝 제어 함수 ---
    
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove("active"));
        const activeStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (activeStep) {
            activeStep.classList.add("active");
        }
        updateProgressUI(stepNumber);
        updateButtons(stepNumber);
    }

    function updateProgressUI(stepNumber) {
        progressSteps.forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });
        
        const progressPercent = ((stepNumber - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progressPercent}%`;
    }

    function updateButtons(stepNumber) {
        prevBtn.style.display = (stepNumber > 1) ? "inline-block" : "none";
        submitBtn.style.display = (stepNumber === totalSteps) ? "inline-block" : "none";
        nextBtn.style.display = (stepNumber < totalSteps) ? "inline-block" : "none";
    }

    function updateProgressCheckmark(stepNumber) {
        const stepToMark = progressSteps[stepNumber - 1];
        if (stepToMark && !stepToMark.classList.contains("check")) {
            stepToMark.innerHTML = "✔️";
            stepToMark.classList.add("check");
        }
    }


    // --- 3. 인라인 유효성 검사 ---

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
        
        formGroup.classList.add('shake');
        formGroup.addEventListener('animationend', () => {
            formGroup.classList.remove('shake');
        }, { once: true });
    }

    function clearErrors() {
        document.querySelectorAll('.form-group.error').forEach(formGroup => {
            formGroup.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(errorElement => {
            errorElement.textContent = '';
        });
    }

    // ========== [수정] 전화번호 유효성 검사 추가 ==========
    function validateStep(stepNumber) {
        clearErrors(); 
        let isValid = true;
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const inputs = Array.from(currentStepElement.querySelectorAll("input[required], select[required]"));
        
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
            else if (input.id === 'phone') { // input의 id로 'phone'을 특정
                const phoneValue = value.replace(/-/g, ""); // 하이픈 제거
                if (!/^\d+$/.test(phoneValue)) { // 숫자만 있는지 확인
                    isValid = false;
                    showError(input, "전화번호는 숫자만 입력해주세요.");
                } else if (phoneValue.length < 10 || phoneValue.length > 11) { // 자리수 확인
                    isValid = false;
                    showError(input, "전화번호 10자리 또는 11자리를 입력해주세요.");
                }
            }
            else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                showError(input, "유효한 이메일 주소를 입력해주세요.");
            }
        }
        return isValid;
    }
    // ==================================================


    // --- 4. 폼 제출 및 리셋 로직 ---

    function resetForm() {
        form.reset();
        clearErrors();
        currentStep = 1;
        showStep(currentStep);
        
        progressSteps.forEach((step, index) => {
            step.innerHTML = progressStepTexts[index];
            step.classList.remove("check");
        });
        progressSteps[0].classList.add("active"); 
        
        successMessage.style.display = "none";
        form.style.display = "block";
    }

    // "다음" 버튼 클릭
    nextBtn.addEventListener("click", () => {
        if (validateStep(currentStep)) {
            updateProgressCheckmark(currentStep);
            
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    // "이전" 버튼 클릭
    prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // "제출" 버튼 클릭
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        if (!validateStep(currentStep)) return; 

        // --- 백엔드 전송 로직 시작 ---
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzazRqPAItheJMgc3vCCcGkhtnePiPlC-EMhRLd0GO0MCmTIp0_EAaGrQPBq3gxfIWw/exec";
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // ========== [수정] 전화번호 하이픈 제거 ==========
        if (data.phone) {
            data.phone = data.phone.replace(/-/g, "");
        }
        // ===========================================
        
        data.lead_source = "상담 요청";

        submitBtn.disabled = true;
        submitBtn.innerHTML = '전송 중... <span class="spinner"></span>';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data) 
        })
        .then(response => {
            console.log('Success:', data);
            form.style.display = "none";
            successMessage.style.display = "block";
        })
        .catch(error => {
            console.error('Error:', error);
            alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        })
        .finally(() => {
            if (form.style.display !== "none") {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "무료 상담 및 데모 신청";
            }
        });
        // --- 백엔드 전송 로직 끝 ---
    });

    // "새로운 문의하기" 버튼
    resetBtn.addEventListener("click", resetForm);

    // 초기 상태 설정
    showStep(currentStep);


    // --- 5. 3D 틸트 & 빛 반사 효과 (강도 하향) ---
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

    // --- 6. 자동 롤링 슬라이더 기능 ---
    const testimonials = document.querySelectorAll(".testimonial-item");
    let currentTestimonial = 0;

    if (testimonials.length > 0) {
        setInterval(() => {
            if (testimonials[currentTestimonial]) {
                testimonials[currentTestimonial].classList.remove("active");
            }
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            if (testimonials[currentTestimonial]) {
                testimonials[currentTestimonial].classList.add("active");
            }
        }, 5000);
    }

}); // DOMContentLoaded 끝
