// 모든 DOM 콘텐츠가 로드된 후 스크립트 실행
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. 멀티스텝 폼 기능 ---
    const form = document.getElementById("pro-contact-form");
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
    const progressFill = document.getElementById("progress-fill");
    
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    
    let currentStep = 1;
    const totalSteps = steps.length;

    // 현재 스텝을 보여주는 함수
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove("active"));
        const activeStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (activeStep) {
            activeStep.classList.add("active");
        }
        
        updateProgress(stepNumber);
        updateButtons(stepNumber);
    }

    // 프로그레스 바 업데이트
    function updateProgress(stepNumber) {
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

    // 버튼 상태 업데이트
    function updateButtons(stepNumber) {
        prevBtn.style.display = (stepNumber > 1) ? "inline-block" : "none";
        submitBtn.style.display = (stepNumber === totalSteps) ? "inline-block" : "none";
        nextBtn.style.display = (stepNumber < totalSteps) ? "inline-block" : "none";
    }

    // 유효성 검사
    function validateStep(stepNumber) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const inputs = Array.from(currentStepElement.querySelectorAll("input[required], select[required]"));
        
        for (const input of inputs) {
            // 체크박스는 'checked' 속성으로 확인
            if (input.type === "checkbox") {
                if (!input.checked) {
                    alert("개인정보 수집 및 이용에 동의해주세요.");
                    input.focus();
                    return false;
                }
            } 
            // 나머지 필드는 'value'로 확인
            else if (!input.value.trim()) {
                const label = input.closest('.form-group').querySelector('label');
                const fieldName = label ? label.innerText.replace(' *', '') : '필수 항목';
                
                alert(`'${fieldName}' 항목을(를) 입력해주세요.`);
                input.focus();
                return false;
            }
            // 이메일 형식 검사
            if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                alert("유효한 이메일 주소를 입력해주세요.");
                input.focus();
                return false;
            }
        }
        return true;
    }

    // "다음" 버튼 클릭
    nextBtn.addEventListener("click", () => {
        if (validateStep(currentStep)) {
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

    // "제출" 버튼 클릭 (폼 제출 이벤트)
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // 기본 제출 동작 방지
        
        // 마지막 단계 유효성 검사
        if (!validateStep(currentStep)) return;

        // --- 백엔드 전송 로직 시작 ---
        
        // 1. 여기에 2단계에서 복사한 Google Apps Script "웹 앱 URL"을 붙여넣으세요.
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzazRqPAItheJMgc3vCCcGkhtnePiPlC-EMhRLd0GO0MCmTIp0_EAaGrQPBq3gxfIWw/exec";

        const submitButton = document.getElementById("submit-btn");

        // 2. 폼 데이터를 JSON 객체로 변환
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 3. 제출 버튼 비활성화 (중복 제출 방지)
        submitButton.disabled = true;
        submitButton.textContent = "전송 중...";

        // 4. Google Apps Script로 데이터 전송 (Fetch API)
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Google Script는 no-cors 모드 필요
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) 
        })
        .then(response => {
            // no-cors 모드에서는 응답(response)을 직접 읽을 수 없지만,
            // 요청이 성공적으로 전송된 것으로 간주합니다.
            console.log('Success:', data);
            
            alert("문의가 성공적으로 접수되었습니다. 신속하게 연락드리겠습니다!");
            
            form.reset();
            currentStep = 1;
            showStep(currentStep);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        })
        .finally(() => {
            // 버튼 다시 활성화
            submitButton.disabled = false;
            submitButton.textContent = "무료 상담 및 데모 신청";
        });
        // --- 백엔드 전송 로직 끝 ---
    });

    // 초기 상태 설정
    showStep(currentStep);


    // --- 2. 자동 롤링 슬라이더 기능 ---
    const testimonials = document.querySelectorAll(".testimonial-item");
    let currentTestimonial = 0;

    if (testimonials.length > 0) {
        // 5초마다 슬라이드 변경 (5000ms)
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

    
    // --- 3. 마우스 반응 3D 틸트(Parallax) 효과 ---
    const container = document.querySelector(".form-container");
    const body = document.querySelector("body");

    if (container && body) {
        body.addEventListener("mousemove", (e) => {
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            const maxRotate = 5; 
            const rotateY = x * maxRotate * 2; 
            const rotateX = -y * maxRotate;    

            container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        body.addEventListener("mouseleave", () => {
            container.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
    }

}); // DOMContentLoaded 끝
