import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    User, Profile, Company, Job, JobMatch, Recruiter, Application, ApplicationEvent,
    Resume, Project, Interview, InterviewQuestion, LearningTopic, FollowUp, Offer, SystemSetting
)

class SeedService:
    @staticmethod
    def seed_data(db: Session):
        """
        Clean initialization. Does not inject fake dummy records.
        Real data is populated dynamically by user onboarding and live job discovery.
        """
        pass

    @staticmethod
    def clear_demo_data(db: Session):
        """
        Purges any residual demo records from the database.
        """
        try:
            db.query(Job).filter(Job.is_demo == True).delete(synchronize_session=False)
            db.query(ApplicationEvent).delete(synchronize_session=False)
            db.query(Application).filter(Application.is_demo == True).delete(synchronize_session=False)
            db.query(Interview).filter(Interview.is_demo == True).delete(synchronize_session=False)
            db.query(Recruiter).filter(Recruiter.is_demo == True).delete(synchronize_session=False)
            db.query(Company).filter(Company.is_demo == True).delete(synchronize_session=False)
            db.query(Offer).filter(Offer.is_demo == True).delete(synchronize_session=False)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error clearing demo data: {e}")

seed_service = SeedService()

