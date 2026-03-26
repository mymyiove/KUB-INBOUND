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
    
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const fullNameInput = document.getElementById("full-name");
    const companyInput = document.getElementById("company-name");

    let currentStep = 1;
    const totalSteps = steps.length;

    // --- 2. [추가] 웅진스킬원 전용: 롤링 슬라이더 & 링크 동기화 ---
    const testimonials = document.querySelectorAll(".testimonial-item");
    const rollingLink = document.getElementById("rolling-link");
    let currentTestimonial = 0;

    const rollingInterval = setInterval(() => {
        if (testimonials.length > 0) {
            testimonials[currentTestimonial].classList.remove("active");
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            const nextItem = testimonials[currentTestimonial];
            nextItem.classList.add("active");

            // 하단 소개 링크 및 텍스트 실시간 변경
            if (rollingLink) {
                const newLink = nextItem.getAttribute("data-link");
                const platformName = nextItem.querySelector("h4").innerText;
                rollingLink.href = newLink;
                rollingLink.innerHTML = `${platformName} 서비스 소개 더보기 <span class="link-arrow">→</span>`;
            }
        }
    }, 5000);

    // --- 3. 아코디언 (자세히 보기) 로직 ---
    document.querySelectorAll('.privacy-toggle-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const parentGroup = link.closest('.privacy-group');
            parentGroup.classList.toggle('is-open');
            const arrow = link.querySelector('.arrow');
            if (arrow) arrow.innerHTML = parentGroup.classList.contains('is-open') ? '▲' : '▼';
        });
    });

    // --- 4. 폼 스텝 제어 ---
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove("active"));
        const activeStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (activeStep) activeStep.classList.add("active");
        updateProgressUI(stepNumber);
        updateButtons(stepNumber);
    }

    function updateProgressUI(stepNumber) {
        progressSteps.forEach((step, index) => {
            if (index < stepNumber - 1) {
                step.classList.add("check");
                step.classList.remove("active");
            } else if (index === stepNumber - 1) {
                step.classList.remove("check");
                step.classList.add("active");
            } else {
                step.classList.remove("check", "active");
            }
        });
        const progressScale = (stepNumber - 1) / (totalSteps - 1); 
        progressFill.style.transform = `scaleX(${progressScale})`;
    }

    function updateButtons(stepNumber) {
        prevBtn.style.display = (stepNumber > 1) ? "inline-block" : "none";
        submitBtn.style.display = (stepNumber === totalSteps) ? "inline-block" : "none";
        nextBtn.style.display = (stepNumber < totalSteps) ? "inline-block" : "none";
    }

    // --- 5. 유효성 검사 (기존 400줄 로직 그대로) ---
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group') || inputElement.closest('.privacy-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.add('error');
        formGroup.classList.remove('valid'); 
        if (errorElement) errorElement.textContent = message;
        
        formGroup.classList.add('shake');
        setTimeout(() => formGroup.classList.remove('shake'), 500);
    }

    function showSuccess(inputElement) {
        const formGroup = inputElement.closest('.form-group') || inputElement.closest('.privacy-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.remove('error');
        formGroup.classList.add('valid');
        if (errorElement) errorElement.textContent = ''; 
    }

    function validateStep(stepNumber) {
        let isValid = true;
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const inputs = Array.from(currentStepElement.querySelectorAll("input[required], select[required], textarea[required]"));
        
        // 웅진스킬원 전용: 플랫폼 체크박스 검증 (Step 2에서 실행)
        if (stepNumber === 2) {
            const checkedPlatforms = document.querySelectorAll('input[name="product"]:checked');
            if (checkedPlatforms.length === 0) {
                alert("상담을 원하시는 플랫폼을 최소 하나 이상 선택해주세요.");
                return false;
            }
        }

        for (const input of inputs) {
            const value = input.value.trim();
            if (input.type === "checkbox" && !input.checked) {
                isValid = false;
                showError(input, "필수 동의 항목입니다.");
            } else if (!value) {
                isValid = false;
                showError(input, "이 필드는 필수입니다.");
            } else if (input.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                showError(input, "유효한 이메일을 입력하세요.");
            } else {
                showSuccess(input);
            }
        }
        return isValid;
    }

    // --- 6. 이벤트 리스너 ---
    nextBtn.addEventListener("click", () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // 웅진스킬원 전용: 복수 선택 데이터를 구글 시트 'product' 열에 쉼표로 합쳐서 전송
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzazRqPAItheJMgc3vCCcGkhtnePiPlC-EMhRLd0GO0MCmTIp0_EAaGrQPBq3gxfIWw/exec";
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 체크박스 복수 값 처리
        const selectedProducts = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(cb => cb.value);
        data.product = selectedProducts.join(", "); 
        
        // 기존 폰 포맷팅 제거 후 전송
        if (data.phone) data.phone = data.phone.replace(/-/g, "");

        submitBtn.disabled = true;
        submitBtn.innerHTML = '전송 중... <span class="spinner"></span>';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        })
        .then(() => {
            form.style.display = "none";
            successMessage.style.display = "block";
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        })
        .catch(err => alert("오류 발생: " + err))
        .finally(() => { submitBtn.disabled = false; submitBtn.innerHTML = "신청하기"; });
    });

    // --- 7. 3D 틸트 & 마우스 파티클 (기존 감성 유지) ---
    const container = document.querySelector(".form-container");
    const glare = document.querySelector(".glare");
    if (container && glare) {
        container.addEventListener("mousemove", (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const tiltX = (y / rect.height - 0.5) * -4; 
            const tiltY = (x / rect.width - 0.5) * 4;
            container.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 70%)`;
            glare.style.opacity = '1';
        });
    }

    // 초기화
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, "");
            if (val.length > 11) val = val.substring(0, 11);
            e.target.value = val.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
        });
    }
});
