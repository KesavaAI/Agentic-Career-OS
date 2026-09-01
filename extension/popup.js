// Extension Popup logic — Captures job from current tab and submits to Agentic Career OS backend

document.addEventListener("DOMContentLoaded", () => {
  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("content");
  const resultEl = document.getElementById("result");
  const submitBtn = document.getElementById("submit-btn");

  let extractedData = null;

  // Request extraction from content script in active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      loadingEl.textContent = "Unable to access active tab.";
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: "EXTRACT_JOB" }, (response) => {
      loadingEl.style.display = "none";
      contentEl.style.display = "block";

      if (response && response.data) {
        extractedData = response.data;
        document.getElementById("role").value = extractedData.role || "";
        document.getElementById("company_name").value = extractedData.company_name || "";
        document.getElementById("location").value = extractedData.location || "";
        document.getElementById("work_mode").value = extractedData.work_mode || "Remote";
        document.getElementById("min_salary").value = extractedData.min_salary || "";
        document.getElementById("max_salary").value = extractedData.max_salary || "";
        document.getElementById("required_skills").value = extractedData.required_skills || "";
        document.getElementById("job_url").value = extractedData.job_url || tabs[0].url;
      } else {
        document.getElementById("job_url").value = tabs[0].url;
      }
    });
  });

  // Submit to Agentic Career OS Backend API
  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Adding to Career OS...";

    const payload = {
      role: document.getElementById("role").value || "Captured Job",
      company_name: document.getElementById("company_name").value || "Target Company",
      description: extractedData ? extractedData.description : "Browser captured job description.",
      job_url: document.getElementById("job_url").value,
      source_domain: window.location.hostname,
      location: document.getElementById("location").value,
      work_mode: document.getElementById("work_mode").value,
      employment_type: "Full-time",
      min_salary: parseFloat(document.getElementById("min_salary").value) || null,
      max_salary: parseFloat(document.getElementById("max_salary").value) || null,
      required_skills: document.getElementById("required_skills").value,
      confidence_scores: extractedData ? extractedData.confidence_scores : {}
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/jobs/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      resultEl.style.display = "block";
      
      if (res.ok) {
        resultEl.className = "result-box result-success";
        resultEl.innerHTML = `🟢 <b>Job Captured Successfully!</b><br>
          Role: ${data.role}<br>
          Company: ${data.company_name}<br>
          Tier: <b>Tier ${data.tier}</b> | Match Score: <b>${data.match_score}%</b><br>
          <small>Synced with Discovery Feed & CRM.</small>`;
        submitBtn.style.display = "none";
      } else {
        resultEl.className = "result-box result-error";
        resultEl.textContent = `❌ Submission Error: ${data.detail || "Failed to add job."}`;
        submitBtn.disabled = false;
        submitBtn.textContent = "➕ ADD TO CAREER OS";
      }
    } catch (e) {
      resultEl.style.display = "block";
      resultEl.className = "result-box result-error";
      resultEl.textContent = `❌ Network Error: Could not connect to Agentic Career OS backend at http://127.0.0.1:8000.`;
      submitBtn.disabled = false;
      submitBtn.textContent = "➕ ADD TO CAREER OS";
    }
  });
});
