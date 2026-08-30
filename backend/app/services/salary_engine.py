import re
from typing import Tuple

class SalaryEngine:
    """
    Computes realistic market LPA ranges for tech job listings based on:
    1. Explicit salary in job posting/description (if available)
    2. Role Seniority (Fresher, Junior, Mid, Senior, Lead, Staff)
    3. Company Tier & Market (Tier-1 Product, Scale-Up, IT Services, Startup, US Remote)
    4. Candidate Target Minimum CTC (calibrated baseline)
    """

    @staticmethod
    def calculate_realistic_lpa(
        company_name: str,
        role_title: str,
        target_min_ctc: float = 7.0,
        raw_salary_text: str = ""
    ) -> Tuple[float, float, str]:
        comp_lower = company_name.lower()
        role_lower = role_title.lower()
        base_target = max(float(target_min_ctc or 7.0), 3.5)

        # 1. Parse raw salary text if present (e.g. "$120,000", "₹12 - ₹18 LPA", "8-12 LPA")
        if raw_salary_text:
            lpa_match = re.findall(r'(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs|l)', raw_salary_text.lower())
            if lpa_match:
                try:
                    min_s = float(lpa_match[0][0])
                    max_s = float(lpa_match[0][1])
                    return min_s, max_s, f"₹{min_s}L - ₹{max_s}L LPA"
                except Exception:
                    pass

        # 2. Determine Seniority Multiplier
        is_intern = any(w in role_lower for w in ["intern", "trainee", "campus", "graduate", "fresher"])
        is_junior = any(w in role_lower for w in ["junior", "associate", "entry", "sde 1", "sde-1", "sde i", "software engineer 1", "engineer 1", "level 1", "l1"])
        is_senior = any(w in role_lower for w in ["senior", "sr.", "sr ", "sde 3", "sde-3", "sde iii", "lead", "staff", "principal", "architect", "manager", "head"])
        is_mid = not (is_intern or is_junior or is_senior)

        # 3. Determine Company Tier Multiplier
        is_tier1 = any(c in comp_lower for c in ["google", "stripe", "uber", "airbnb", "figma", "coinbase", "cursor", "perplexity", "ramp", "openai"])
        is_it_services = any(c in comp_lower for c in ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "lti", "tech mahindra"])

        if is_intern:
            min_lpa = round(max(base_target * 0.6, 3.5), 1)
            max_lpa = round(max(base_target * 0.9, 5.5), 1)
        elif is_junior or (base_target <= 8.0 and not is_senior):
            # For 0-2 yrs exp / junior roles (e.g. Target ₹7.0L -> ₹6.5L - ₹10.5L LPA)
            if is_tier1:
                min_lpa = round(max(base_target * 1.1, 10.0), 1)
                max_lpa = round(max(base_target * 1.8, 16.0), 1)
            elif is_it_services:
                min_lpa = round(max(base_target * 0.8, 4.5), 1)
                max_lpa = round(max(base_target * 1.2, 8.0), 1)
            else:
                min_lpa = round(max(base_target * 0.95, 6.5), 1)
                max_lpa = round(max(base_target * 1.5, 11.0), 1)
        elif is_senior:
            # For Senior/Lead roles
            if is_tier1:
                min_lpa = round(max(base_target * 2.2, 28.0), 1)
                max_lpa = round(max(base_target * 3.8, 48.0), 1)
            elif is_it_services:
                min_lpa = round(max(base_target * 1.4, 14.0), 1)
                max_lpa = round(max(base_target * 2.2, 22.0), 1)
            else:
                min_lpa = round(max(base_target * 1.8, 20.0), 1)
                max_lpa = round(max(base_target * 2.8, 32.0), 1)
        else:
            # Mid-level (SDE-2 / 2-5 yrs exp)
            if is_tier1:
                min_lpa = round(max(base_target * 1.6, 18.0), 1)
                max_lpa = round(max(base_target * 2.6, 28.0), 1)
            elif is_it_services:
                min_lpa = round(max(base_target * 1.0, 8.0), 1)
                max_lpa = round(max(base_target * 1.5, 13.0), 1)
            else:
                min_lpa = round(max(base_target * 1.3, 11.0), 1)
                max_lpa = round(max(base_target * 1.9, 17.5), 1)

        display_str = f"₹{min_lpa}L - ₹{max_lpa}L LPA"
        return min_lpa, max_lpa, display_str

salary_engine = SalaryEngine()
