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

    // 롤링 배너
    const testimonials = document.querySelectorAll(".testimonial-item");
    let rollingIdx = 0;
    setInterval(() => {
        testimonials[rollingIdx].classList.remove("active");
        rollingIdx = (rollingIdx + 1) % testimonials.length;
        testimonials[rollingIdx].classList.add("active");
    }, 5000);

    // 체크박스 핸들링
    document.querySelectorAll('.check-item input').forEach(cb => {
        cb.addEventListener('change', function() { this.parentElement.classList.toggle('selected', this.checked); });
    });

    // 전체 동의
    document.getElementById('agree-all').addEventListener('change', function() {
        document.querySelectorAll('.sub-check').forEach(cb => cb.checked = this.checked);
    });

    function updateUI() {
        steps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressSteps.forEach((s, i) => s.classList.toggle("active", i === currentStep - 1));
        progressFill.style.transform = `scaleX(${(currentStep - 1) / (steps.length - 1)})`;
        prevBtn.style.display = currentStep > 1 ? "block" : "none";
        nextBtn.style.display = currentStep < 3 ? "block" : "none";
        submitBtn.style.display = currentStep === 3 ? "block" : "none";
    }

    nextBtn.addEventListener("click", () => {
        if (currentStep === 2) {
            const name = document.getElementById('full_name').value;
            const company = document.getElementById('company_name').value;
            const team = document.getElementById('team').value;
            const products = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(cb => cb.parentElement.innerText.trim()).join(', ');
            document.getElementById('summary-display').innerHTML = `
                <div class="summary-grid">
                    <div class="summary-item"><span class="summary-label">🏢 소속</span><span class="summary-divider">|</span><span class="summary-value">${company} (${team})</span></div>
                    <div class="summary-item"><span class="summary-label">👤 담당자</span><span class="summary-divider">|</span><span class="summary-value">${name}님</span></div>
                    <div class="summary-item"><span class="summary-label">🎯 플랫폼</span><span class="summary-divider">|</span><span class="summary-value" style="color:#FF6B00;">${products || '상담 후 추천'}</span></div>
                </div>`;
        }
        currentStep++; updateUI();
    });

    prevBtn.addEventListener("click", () => { currentStep--; updateUI(); });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitBtn.disabled = true; submitBtn.innerText = "전송 중...";
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.product = Array.from(document.querySelectorAll('input[name="product"]:checked')).map(c => c.value).join(", ");

        fetch("여기에_GAS_배포_URL_입력", { method: "POST", mode: "no-cors", body: JSON.stringify(data) })
        .then(() => { form.style.display = "none"; successMsg.style.display = "block"; confetti(); })
        .catch(() => { alert("오류 발생"); submitBtn.disabled = false; });
    });
});
