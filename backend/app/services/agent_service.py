import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from .. import models, schemas
from typing import Any, List, Dict

class CareerAgent:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.user = db.query(models.User).filter(models.User.id == user_id).first()
        if not self.user:
            raise ValueError("User not found")
        self.profile = self.user.student_profile
        self.org_id = self.user.org_id

    # 1. PERCEPTION LAYER
    def get_user_state(self) -> Dict[str, Any]:
        if not self.profile:
            return {
                "skills": [],
                "missing_skills": [],
                "tasks_pending": 0,
                "tasks_completed": 0,
                "placement_probability": 0,
                "activity_level": "low"
            }

        tasks = self.db.query(models.Task).filter(models.Task.student_id == self.profile.id).all()
        pending = len([t for t in tasks if t.status == "Pending"])
        completed = len([t for t in tasks if t.status == "Completed"])
        
        # Determine activity level based on last 7 days of logs
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        activity_count = self.db.query(models.UserActivity).filter(
            models.UserActivity.user_id == self.user_id,
            models.UserActivity.created_at >= seven_days_ago
        ).count()
        
        activity_level = "low"
        if activity_count > 10: activity_level = "high"
        elif activity_count > 3: activity_level = "medium"

        analysis = self.profile.resume_data or {}
        
        state = {
            "skills": analysis.get("skills", []),
            "missing_skills": analysis.get("missing_skills", []),
            "tasks_pending": pending,
            "tasks_completed": completed,
            "placement_probability": self.profile.placement_probability,
            "activity_level": activity_level
        }
        
        # Log Perception
        self._log_event("perception_layer_sync", {"state": state})
        return state

    # 2. DECISION LAYER
    def decide_next_actions(self, state: Dict[str, Any]) -> List[str]:
        actions = []
        
        if state["placement_probability"] < 50:
            actions.append("intensive_training")
            
        if any("dsa" in s.lower() for s in state["missing_skills"]):
            actions.append("assign_dsa_tasks")
            
        if state["tasks_pending"] > 5:
            actions.append("reduce_overload")
            
        if state["activity_level"] == "low" and state["tasks_pending"] > 0:
            actions.append("send_alert")

        # Persist Decision
        decision = models.DecisionHistory(
            user_id=self.user_id,
            state_snapshot=state,
            decisions={"actions": actions}
        )
        self.db.add(decision)
        self.db.commit()
        
        return actions

    # 3. ACTION LAYER
    def execute_actions(self, actions: List[str]):
        if not self.profile: return

        results = []
        for action in actions:
            if action == "assign_dsa_tasks":
                results.append(self._generate_dsa_tasks())
            elif action == "intensive_training":
                results.append(self._update_recommendations("Priority: Intensive Technical Refresh Required"))
            elif action == "reduce_overload":
                # Logic to maybe de-prioritize some tasks (not implemented yet)
                results.append("Monitoring workload...")
            elif action == "send_alert":
                results.append(f"AI ALERT: Inactivity detected for {self.user.email}")
        
        self._log_event("action_layer_execution", {"results": results})
        self.db.commit()

    # 4. AGENT LOOP
    def run_cycle(self):
        # 1. Perception
        state = self.get_user_state()
        # 2. Decision
        actions = self.decide_next_actions(state)
        # 3. Action
        self.execute_actions(actions)
        return {"state": state, "actions_taken": actions}

    # Internal Helpers
    def _log_event(self, event: str, details: Dict):
        log = models.AgentLog(
            user_id=self.user_id,
            org_id=self.org_id,
            event=event,
            details=details
        )
        self.db.add(log)

    def _generate_dsa_tasks(self):
        new_task = models.Task(
            student_id=self.profile.id,
            org_id=self.org_id,
            title="Master DSA: Solve 5 Problems on Arrays & Hashing",
            priority="High",
            status="Pending"
        )
        self.db.add(new_task)
        return "Task Generated: DSA Practice"

    def _update_recommendations(self, msg: str):
        # In a real system, we'd have a recommendations table
        return f"System Message: {msg}"

def log_activity(db: Session, user_id: str, activity_type: str, meta: Dict = None):
    activity = models.UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        meta_data=meta
    )
    db.add(activity)
    db.commit()
