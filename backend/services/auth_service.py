import os
import random
import re
import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Any

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthService:
    def __init__(self) -> None:
        self.otp_expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
        self.otp_store: dict[str, dict[str, Any]] = {}
        self.session_store: dict[str, dict[str, Any]] = {}

    def request_otp(self, email: str, role: str) -> dict[str, Any]:
        normalized_email = (email or "").strip().lower()
        if not EMAIL_REGEX.match(normalized_email):
            return {"ok": False, "message": "Enter a valid email address"}

        otp = f"{random.randint(100000, 999999)}"
        expires_at = datetime.utcnow() + timedelta(minutes=self.otp_expiry_minutes)
        self.otp_store[normalized_email] = {
            "otp": otp,
            "role": role or "student",
            "expires_at": expires_at,
        }

        sent = self._send_otp_email(normalized_email, otp)
        result = {"ok": True, "message": "OTP sent successfully"}
        if not sent:
            # Demo-safe fallback so login never blocks.
            result["demo_otp"] = otp
            result["message"] = "Email not configured. Using demo OTP mode."
        return result

    def verify_otp(self, email: str, otp: str) -> dict[str, Any]:
        normalized_email = (email or "").strip().lower()
        saved = self.otp_store.get(normalized_email)
        if not saved:
            return {"ok": False, "message": "OTP not requested for this email"}

        if datetime.utcnow() > saved["expires_at"]:
            self.otp_store.pop(normalized_email, None)
            return {"ok": False, "message": "OTP expired. Request a new OTP."}

        if (otp or "").strip() != saved["otp"]:
            return {"ok": False, "message": "Invalid OTP"}

        token = str(uuid.uuid4())
        session = {
            "email": normalized_email,
            "role": saved["role"],
            "token": token,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.session_store[token] = session
        self.otp_store.pop(normalized_email, None)
        return {"ok": True, "session": session}

    @staticmethod
    def _send_otp_email(email: str, otp: str) -> bool:
        smtp_host = os.getenv("SMTP_HOST", "")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        smtp_from = os.getenv("SMTP_FROM", smtp_user)

        if not all([smtp_host, smtp_user, smtp_password, smtp_from]):
            return False

        msg = MIMEText(
            f"Your Agentic AI Career Coach OTP is: {otp}\nThis OTP expires in 10 minutes."
        )
        msg["Subject"] = "Your OTP - Agentic AI Career Coach"
        msg["From"] = smtp_from
        msg["To"] = email

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [email], msg.as_string())
            return True
        except Exception:
            return False
