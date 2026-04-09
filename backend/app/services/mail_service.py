import smtplib
import os
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "sujithlavudu@gmail.com"
SENDER_PASSWORD = "otct iwsg bqbd ctqh" # Provided by user

def send_otp_email(receiver_email: str, otp: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = f"{otp} is your AI.CareerOS Access Code"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    text = f"Your access code is {otp}. It expires in 10 minutes."
    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 40px; text-align: center;">
        <h1 style="color: #6366f1; font-style: italic;">AI.CareerOS</h1>
        <p style="font-size: 16px; color: #94a3b8;">Your neural access code is ready.</p>
        <div style="font-size: 48px; font-weight: 900; letter-spacing: 10px; margin: 40px 0; color: #ffffff;">{otp}</div>
        <p style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">Sync status: pending verification</p>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])
