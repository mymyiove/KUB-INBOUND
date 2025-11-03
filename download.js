document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. 기본 요소 선택 ---
    const form = document.getElementById("pro-contact-form");
    const formPane = document.querySelector(".form-pane");
    const successMessage = document.getElementById("success-message");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-form-btn");
    

    // --- 2. 인라인 유효성 검사 ---
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

    function validateForm() {
        clearErrors(); 
        let isValid = true;
        const inputs = Array.from(form.querySelectorAll("input[required], select[required]"));
        
        for (const input of inputs) {
            if (input.type === "checkbox") {
                if (!input.checked) {
                    isValid = false;
                    showError(input, "개인정보 수집 및 이용에 동의해주세요.");
                }
            } 
            else if (!input.value.trim()) {
                isValid = false;
                const label = input.closest('.form-group').querySelector('label');
                const fieldName = label ? label.innerText.replace(' *', '') : '필수 항목';
                showError(input, `${fieldName} 항목을 입력해주세요.`);
            }
            else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                isValid = false;
                showError(input, "유효한 이메일 주소를 입력해주세요.");
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
    }

    // "제출" 버튼 클릭
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        if (!validateForm()) return; 

        // --- 백엔드 전송 로직 시작 ---
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/여기에_복사한_URL_붙여넣기/exec";
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        data.lead_source = "자료 다운로드";

        submitBtn.disabled = true;
        submitBtn.innerHTML = '전송 중... <span class="spinner"></span>';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        })
        .then(response => {
            console.log('Success:', data);
            form.style.display = "none";
            successMessage.style.display = "block";
            
            // (실제 다운로드 로직은 백엔드 메일에 포함됩니다)
        })
        .catch(error => {
            console.error('Error:', error);
            showError(submitBtn, "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "무료 자료 다운로드";
        });
        // --- 백엔드 전송 로직 끝 ---
    });

    // "확인" 버튼 (리셋)
    resetBtn.addEventListener("click", resetForm);


    // --- 4. 3D 틸트 & 빛 반사 효과 ---
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

}); // DOMContentLoaded 끝
