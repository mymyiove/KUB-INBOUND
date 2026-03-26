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

    // 1. 로컬스토리지 로드 (자동저장 복구)
    const saved = localStorage.getItem('skillOneLeadInfo');
    if (saved) {
        const info = JSON.parse(saved);
        for (let key in info) {
            const el = document.getElementById(key);
            if (el) el.value = info[key];
        }
    }

    // 2. 롤링 배너 로직
    const testimonials = document.querySelectorAll(".testimonial-item");
    const rollingLink = document.getElementById("rolling-link");
    let rollingIdx = 0;
    setInterval(() => {
        testimonials[rollingIdx].classList.remove("active");
        rollingIdx = (rollingIdx + 1) % testimonials.length;
        testimonials[rollingIdx].classList.add("active");
        const platformName = testimonials[rollingIdx].querySelector("h4").innerText.split(" ")[0];
        rollingLink.href = testimonials[rollingIdx].getAttribute("data-link");
        rollingLink.innerHTML = `${platformName} 서비스 소개 더보기 <span class="link-arrow">→</span>`;
    }, 5000);

    // 3. 체크박스 선택 효과
    document.querySelectorAll('.check-item input').forEach(cb => {
        cb.addEventListener('change', function() {
            this.parentElement.classList.toggle('selected', this.checked);
        });
    });

    // 4. 전체 동의
    document.getElementById('agree-all').addEventListener('change', function() {
        document.querySelectorAll('input[type="checkbox"]:not(#agree-all)').forEach(cb => cb.checked = this.checked);
    });

    function updateUI() {
        steps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressSteps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressFill.style.transform = `scaleX(${(currentStep - 1) / (steps.length - 1)})`;
        prevBtn.style.display = currentStep > 1 ? "block" : "none";
        nextBtn.style.display = currentStep < steps.length ? "block" : "none";
        submitBtn.style.display = currentStep === steps.length ? "block" : "none";
        
        // 모바일 자동 상단 스크롤
        if(window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextBtn.addEventListener("click", () => {
        if (currentStep === 1) {
            const info = {
                'full_name': document.getElementById('full_name').value,
                'company_name': document.getElementById('company_name').value,
                'team': document.getElementById('team').value,
                'job_title': document.getElementById('job_title').value,
                'email': document.getElementById('email').value,
                'phone': document.getElementById('phone').value
            };
            localStorage.setItem('skillOneLeadInfo', JSON.stringify(info));
        }
        if (currentStep === 2) {
            const products = Array.from(document.querySelectorAll('input[name="product"]:checked'))
                                  .map(cb => cb.parentElement.innerText.trim()).join(', ');
            document.getElementById('summary-display').innerHTML = `
                <div class="summary-grid">
                    <div class="summary-label">🏢 소속</div><div class="summary-divider">|</div><div class="summary-value">${document.getElementById('company_name').value} (${document.getElementById('team').value})</div>
                    <div class="summary-label">👤 담당자</div><div class="summary-divider">|</div><div class="summary-value">${document.getElementById('full_name').value}님</div>
                    <div class="summary-label">🎯 플랫폼</div><div class="summary-divider">|</div><div class="summary-value" style="color:var(--primary-orange);">${products || '선택 안함'}</div>
                </div>`;
        }
        currentStep++; updateUI();
    });

    prevBtn.addEventListener("click", () => { currentStep--; updateUI(); });

    // 5. 전송 로직 (GAS 배포 URL 반드시 확인)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerText = "전송 중...";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 체크박스 복수 선택 데이터 합치기
        const products = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(c => c.value);
        data.product = products.join(", ");
        
        // GAS URL (이전 배포된 URL 그대로 사용)
        fetch("사용자님의_GAS_배포_URL_입력_필요", {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(data)
        }).then(() => {
            form.style.display = "none";
            successMsg.style.display = "block";
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            localStorage.removeItem('skillOneLeadInfo');
        }).catch(err => {
            alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            submitBtn.disabled = false;
        });
    });
});
