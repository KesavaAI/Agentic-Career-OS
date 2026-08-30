from typing import Dict, Any
from app.agent.state import CareerAgentState
from app.agent.nodes import AgentNodes

class CareerWorkflow:
    @staticmethod
    def run_job_pipeline(raw_text: str, profile_dict: Dict[str, Any], base_resume_md: str) -> CareerAgentState:
        # Step 1: Extract requirements
        extracted = AgentNodes.ingest_and_extract(raw_text)
        
        # Step 2: Match & Tier
        match_res = AgentNodes.evaluate_and_tier(extracted, profile_dict)
        
        # Step 3: Prepare application artifacts
        artifacts = AgentNodes.prepare_tailored_artifacts(base_resume_md, extracted)
        
        state = CareerAgentState(
            step="READY_FOR_APPROVAL",
            job_raw_text=raw_text,
            extracted_job=extracted,
            match_result=match_res,
            tier=match_res.get("tier"),
            priority_score=match_res.get("priority_score"),
            tailored_resume_preview=artifacts["tailored_resume"]["tailored_markdown"],
            interview_pack_preview=artifacts["interview_pack"],
            human_approval_required=True,
            human_approved=False,
            status_message=f"Job analyzed: Tier {match_res.get('tier')} ({match_res.get('overall_score')}/100 match). Awaiting your approval before tracking as applied."
        )
        return state

career_workflow = CareerWorkflow()
