document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pro-contact-form");
    const steps = document.querySelectorAll(".form-step");
    const progressSteps = document.querySelectorAll(".progress-step");
    const progressFill = document.getElementById("progress-fill");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    const successMsg = document.getElementById("success-message");
    let currentStep = 1;

    // 1. 로컬스토리지 로드
    const saved = localStorage.getItem('skillOneLeadInfo');
    if (saved) {
        const info = JSON.parse(saved);
        for (let key in info) {
            const el = document.getElementById(key);
            if (el) el.value = info[key];
        }
    }

    // 2. 롤링 로직
    const testimonials = document.querySelectorAll(".testimonial-item");
    const rollingLink = document.getElementById("rolling-link");
    let rollingIdx = 0;
    setInterval(() => {
        if (testimonials.length === 0) return;
        testimonials[rollingIdx].classList.remove("active");
        rollingIdx = (rollingIdx + 1) % testimonials.length;
        testimonials[rollingIdx].classList.add("active");
        const platformName = testimonials[rollingIdx].querySelector("h4").innerText.split(" ")[0];
        if (rollingLink) {
            rollingLink.href = testimonials[rollingIdx].getAttribute("data-link");
            rollingLink.innerHTML = `${platformName} 서비스 소개 더보기 <span class="link-arrow">→</span>`;
        }
    }, 5000);

    // 3. 체크박스 강조
    document.querySelectorAll('.check-item input').forEach(cb => {
        cb.addEventListener('change', function() {
            this.parentElement.classList.toggle('selected', this.checked);
        });
    });

    // 4. 전체 동의
    const agreeAll = document.getElementById('agree-all');
    const subChecks = document.querySelectorAll('input[type="checkbox"]:not(#agree-all)');
    if (agreeAll) {
        agreeAll.addEventListener('change', function() {
            subChecks.forEach(cb => cb.checked = this.checked);
        });
    }

    function updateUI() {
        steps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressSteps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressFill.style.transform = `scaleX(${(currentStep - 1) / (steps.length - 1)})`;
        prevBtn.style.display = currentStep > 1 ? "block" : "none";
        nextBtn.style.display = currentStep < steps.length ? "block" : "none";
        submitBtn.style.display = currentStep === steps.length ? "block" : "none";
    }

    // 5. 다음 버튼 클릭 이벤트
    nextBtn.addEventListener("click", () => {
        if (currentStep === 1) {
            const info = {
                'full-name': document.getElementById('full-name').value,
                'company-name': document.getElementById('company-name').value,
                'team': document.getElementById('team').value,
                'job-title': document.getElementById('job-title').value,
                'email': document.getElementById('email').value,
                'phone': document.getElementById('phone').value
            };
            localStorage.setItem('skillOneLeadInfo', JSON.stringify(info));
        }
        if (currentStep === 2) {
            const products = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(cb => cb.parentElement.innerText.trim()).join(', ');
            document.getElementById('summary-display').innerHTML = `
                <div class="summary-grid">
                    <div class="summary-label">🏢 소속</div><div class="summary-divider">|</div><div class="summary-value">${document.getElementById('company-name').value} (${document.getElementById('team').value})</div>
                    <div class="summary-label">👤 담당자</div><div class="summary-divider">|</div><div class="summary-value">${document.getElementById('full-name').value}님</div>
                    <div class="summary-label">🎯 플랫폼</div><div class="summary-divider">|</div><div class="summary-value" style="color:var(--primary-orange);">${products || '선택 안함'}</div>
                </div>`;
        }
        currentStep++; 
        updateUI();
    });

    prevBtn.addEventListener("click", () => { 
        currentStep--; 
        updateUI(); 
    });

    // 6. 폼 제출 이벤트 (GAS URL 확인 필요)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerText = "전송 중...";
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const products = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(c => c.value);
        data.product = products.join(", ");

        // 주의: 배포 시 부여받은 본인의 GAS URL로 교체되어 있는지 확인하세요.
        fetch("https://script.google.com/macros/s/AKfycbzazRqPAItheJMgc3vCCcGkhtnePiPlC-EMhRLd0GO0MCmTIp0_EAaGrQPBq3gxfIWw/exec", {
            method: "POST", 
            mode: "no-cors", 
            body: JSON.stringify(data)
        }).then(() => {
            form.style.display = "none";
            successMsg.style.display = "block";
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            localStorage.removeItem('skillOneLeadInfo');
        }).catch(() => {
            alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
            submitBtn.disabled = false;
            submitBtn.innerText = "신청하기";
        });
    });
});
