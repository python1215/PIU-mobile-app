from datetime import datetime
from app import db
from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship


class Project(db.Model):
    __tablename__ = 'projects'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Float)
    status = Column(String(50), default='Planning')  # Planning, Active, Completed, Suspended
    location = Column(String(200))
    project_manager = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    activities = relationship('Activity', backref='project', cascade='all, delete-orphan')
    indicators = relationship('Indicator', backref='project', cascade='all, delete-orphan')
    documents = relationship('Document', backref='project', cascade='all, delete-orphan')
    
    @property
    def progress_percentage(self):
        """Calculate overall project progress based on activities"""
        if not self.activities:
            return 0.0
        
        total_progress = sum(activity.progress_percentage for activity in self.activities)
        return total_progress / len(self.activities) if self.activities else 0.0
    
    @property
    def budget_utilization(self):
        """Calculate budget utilization percentage"""
        if not self.budget or self.budget == 0:
            return 0.0
        
        total_spent = sum(activity.budget_spent or 0 for activity in self.activities)
        return (total_spent / self.budget) * 100 if self.budget > 0 else 0.0


class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), default='Not Started')  # Not Started, In Progress, Completed, Delayed
    progress_percentage = Column(Float, default=0.0)
    budget_allocated = Column(Float)
    budget_spent = Column(Float, default=0.0)
    responsible_person = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Indicator(db.Model):
    __tablename__ = 'indicators'
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # Input, Output, Outcome, Impact
    description = Column(Text)
    unit_of_measure = Column(String(50))
    target_value = Column(Float)
    current_value = Column(Float, default=0.0)
    baseline_value = Column(Float, default=0.0)
    data_source = Column(String(200))
    frequency = Column(String(50))  # Monthly, Quarterly, Annually
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def achievement_percentage(self):
        """Calculate achievement percentage against target"""
        if not self.target_value or self.target_value == 0:
            return 0.0
        
        return (self.current_value / self.target_value) * 100 if self.current_value else 0.0


class Document(db.Model):
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String(200), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)
    uploaded_by = Column(String(100))
    uploaded_at = Column(DateTime, default=datetime.utcnow)