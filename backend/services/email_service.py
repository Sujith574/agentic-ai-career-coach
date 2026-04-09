import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
from datetime import datetime, timedelta, timezone

class EmailService:
    def __init__(self, sender_email=None, sender_password=None):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587  # Port for STARTTLS
        self.sender_email = sender_email or os.getenv("SENDER_EMAIL", "sujithlavudu@gmail.com")
        self.sender_password = sender_password or os.getenv("SENDER_PASSWORD", "otct iwsg bqbd ctqh")

    def send_otp(self, receiver_email, otp, purpose="verification"):
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Your CareerOS OTP for {purpose}"
        message["From"] = self.sender_email
        message["To"] = receiver_email

        text = f"Your OTP is {otp}. It will expire in 10 minutes."
        html = f"""
        <html>
          <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px;">
            <div style="max-width: 500px; margin: auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
              <h1 style="color: #6366f1; margin-bottom: 24px; font-size: 24px;">CareerOS OTP</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
                Hello, use the following code for <b>{purpose}</b>.
              </p>
              <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">{otp}</span>
              </div>
              <p style="font-size: 14px; color: #64748b;">
                This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        context = ssl.create_default_context()
        try:
            print(f"DEBUG: Attempting to send email to {receiver_email} via {self.smtp_server}:{self.smtp_port}")
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.set_debuglevel(1)
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, receiver_email, message.as_string())
            print(f"DEBUG: Email sent successfully to {receiver_email}")
            return True
        except Exception as e:
            print(f"CRITICAL ERROR in EmailService: {e}")
            return False

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])
