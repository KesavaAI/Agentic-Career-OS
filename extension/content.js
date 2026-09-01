// Agentic Career OS — Multi-Tier Job Extractor Content Script
// Extracts visible job data from JSON-LD, Microdata, OpenGraph, and Semantic DOM HTML.

function extractJobData() {
  let title = null;
  let company = null;
  let description = "";
  let location = null;
  let minSalary = null;
  let maxSalary = null;
  let experienceMin = null;
  let experienceMax = null;
  let workMode = "Remote / Hybrid";
  let requiredSkills = [];
  
  let conf = {
    title: 0.0,
    company: 0.0,
    location: 0.0,
    salary: 0.0,
    experience: 0.0
  };

  // Strategy 1: JSON-LD (schema.org/JobPosting)
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent || "{}");
      const obj = data['@graph'] ? data['@graph'].find(item => item['@type'] === 'JobPosting') : data;
      
      if (obj && (obj['@type'] === 'JobPosting' || obj.title)) {
        if (obj.title) {
          title = obj.title.trim();
          conf.title = 0.98;
        }
        if (obj.hiringOrganization && obj.hiringOrganization.name) {
          company = obj.hiringOrganization.name.trim();
          conf.company = 0.95;
        }
        if (obj.description) {
          const div = document.createElement("div");
          div.innerHTML = obj.description;
          description = div.textContent || div.innerText || "";
        }
        if (obj.jobLocation) {
          if (typeof obj.jobLocation === 'string') {
            location = obj.jobLocation;
          } else if (obj.jobLocation.address) {
            const addr = obj.jobLocation.address;
            location = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ");
          }
          if (location) conf.location = 0.90;
        }
        if (obj.baseSalary && obj.baseSalary.value) {
          const sal = obj.baseSalary.value;
          minSalary = sal.minValue || sal.value || null;
          maxSalary = sal.maxValue || sal.value || null;
          if (minSalary || maxSalary) conf.salary = 0.85;
        }
        break;
      }
    } catch (e) {}
  }

  // Strategy 2: OpenGraph & HTML Meta Tags
  if (!title) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle) {
      title = ogTitle.split('|')[0].split('-')[0].trim();
      conf.title = 0.75;
    }
  }
  if (!company) {
    const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (ogSite) {
      company = ogSite.trim();
      conf.company = 0.70;
    }
  }

  // Strategy 3: Heuristic DOM Extraction (Semantic H1 & Containers)
  if (!title) {
    const h1 = document.querySelector('h1, .job-title, [class*="title"], [id*="title"]');
    if (h1 && h1.textContent) {
      title = h1.textContent.trim();
      conf.title = 0.65;
    }
  }

  if (!company) {
    const compEl = document.querySelector('.company-name, [class*="company"], [class*="org"], [id*="company"]');
    if (compEl && compEl.textContent) {
      company = compEl.textContent.trim().replace(/^at\s+/i, '');
      conf.company = 0.60;
    }
  }

  if (!description) {
    const descEl = document.querySelector('.job-description, #job-description, [itemprop="description"], main, article, body');
    if (descEl) {
      description = descEl.textContent ? descEl.textContent.trim().substring(0, 5000) : "";
    }
  }

  // Regex Extraction for Salary (LPA or K/yr)
  if (!minSalary && description) {
    const salMatch = description.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*(LPA|Lakhs|L)/i);
    if (salMatch) {
      minSalary = parseFloat(salMatch[1]);
      maxSalary = parseFloat(salMatch[2]);
      conf.salary = 0.75;
    }
  }

  // Regex Extraction for Experience
  if (!experienceMin && description) {
    const expMatch = description.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*(years|yrs)/i);
    if (expMatch) {
      experienceMin = parseFloat(expMatch[1]);
      experienceMax = parseFloat(expMatch[2]);
      conf.experience = 0.70;
    }
  }

  // Remote / Work Mode Heuristics
  const pageText = (title + " " + location + " " + description).toLowerCase();
  if (pageText.includes("remote")) workMode = "Remote";
  else if (pageText.includes("hybrid")) workMode = "Hybrid";
  else if (pageText.includes("onsite") || pageText.includes("on-site")) workMode = "Onsite";

  // Basic Skill Keywords Regex Matcher
  const knownSkills = ["Python", "PyTorch", "TensorFlow", "React", "TypeScript", "Node.js", "Docker", "Kubernetes", "AWS", "FastAPI", "SQL", "RAG", "LLM", "LangChain", "LangGraph"];
  for (const sk of knownSkills) {
    if (new RegExp("\\b" + sk + "\\b", "i").test(description)) {
      requiredSkills.push(sk);
    }
  }

  return {
    role: title || "Unknown Job Title",
    company_name: company || "Unknown Company",
    description: description || "Job description content extracted from page.",
    location: location || "Remote / Flexible",
    work_mode: workMode,
    employment_type: "Full-time",
    min_salary: minSalary,
    max_salary: maxSalary,
    experience_min: experienceMin || 1.0,
    experience_max: experienceMax || 4.0,
    required_skills: requiredSkills.join(", "),
    job_url: window.location.href,
    source_domain: window.location.hostname,
    confidence_scores: conf
  };
}

// Listen for popup request messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_JOB") {
    const jobData = extractJobData();
    sendResponse({ success: true, data: jobData });
  }
  return true;
});
