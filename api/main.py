from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

@app.post('/send-email')
async def send_email(name: str = Form(...), email: str = Form(...), 
                     phone: str = Form(...), resume: UploadFile = File(...)):
    sender_email = "dzung@mediax.com.vn"
    receiver_email = "dzung@mediax.com.vn"
    password = "rcse gcjs uqgs vahl"

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
    uvicorn.run(app, host='127.0.0.1', port=8000)
