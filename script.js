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
            if (!input.value.trim()) {
                // 레이블이 있는 경우 레이블 텍스트 사용
                const label = input.closest('.form-group').querySelector('label');
                const fieldName = label ? label.innerText.replace(' *', '') : '필수 항목';
                
                alert(`'${fieldName}' 항목을(를) 입력해주세요.`);
                input.focus();
                return false;
            }
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
        
        if (!validateStep(currentStep)) return;
        
        // 마지막 단계 체크박스 유효성 검사
        const privacyCheck = document.getElementById("privacy-agree");
        if (!privacyCheck.checked) {
            alert("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        // --- 백엔드 전송 로직 시작 ---
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("폼 데이터:", data);

        alert("문의가 성공적으로 접수되었습니다! (백엔드 연동 필요)");
        
        form.reset();
        currentStep = 1;
        showStep(currentStep);
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
            testimonials[currentTestimonial].classList.remove("active");
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].classList.add("active");
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
