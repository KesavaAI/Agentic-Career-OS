from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class LearningTopic(Base):
    __tablename__ = "learning_topics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    skill = Column(String(255), nullable=False)
    category = Column(String(100), default="GenAI / Agentic AI")
    market_demand = Column(String(50), default="Very High") # Very High, High, Medium, Low
    market_demand_pct = Column(Integer, default=85) # % of target jobs requiring this
    my_level = Column(String(50), default="Medium") # Beginner, Medium, Strong, Expert
    gap_level = Column(String(50), default="Medium") # Low gap, Medium gap, High gap
    priority = Column(String(50), default="High") # Critical, High, Medium, Low
    stage = Column(String(50), default="LEARN") # LEARN, RECALL, APPLY, EXPLAIN
    status = Column(String(20), default="YELLOW") # GREEN, YELLOW, RED
    recall_schedule_day = Column(Integer, default=0) # 0, 1, 3, 7, 14, 30
    next_recall_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class LearningRecallLog(Base):
    __tablename__ = "learning_recall_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("learning_topics.id", ondelete="CASCADE"), nullable=False)
    day_stage = Column(Integer, default=1)
    status_result = Column(String(20), default="GREEN") # GREEN, YELLOW, RED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
