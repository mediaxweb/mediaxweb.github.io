from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "MediaX API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mediax.com.vn"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.post('/send-email')
async def send_email(name: str = Form(...), email: str = Form(...),
                    phone: str = Form(...), resume: UploadFile = File(...)):
    if resume.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    if resume.file._file.getbuffer().nbytes > 5242880:
        raise HTTPException(status_code=413, detail="File size exceeds the allowable limit of 5MB.")

    sender_email = os.getenv("SENDER_EMAIL", "")
    receiver_email = os.getenv("RECEIVER_EMAIL", "")
    password = os.getenv("EMAIL_PASSWORD", "")

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = "New Job Application"

    body = f"Name: {name}\nEmail: {email}\nPhone: {phone}"
    message.attach(MIMEText(body, 'plain'))

    if resume:
        part = MIMEApplication(await resume.read(), Name=os.path.basename(resume.filename))
        part['Content-Disposition'] = f'attachment; filename="{resume.filename}"'
        message.attach(part)

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        return JSONResponse({"status": "success", "message": "Email sent successfully!"}, status_code=200)
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8080)