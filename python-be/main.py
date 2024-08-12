from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/send-email', methods=['POST'])
def send_email():
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    resume = request.files.get('resume')

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
        part = MIMEApplication(resume.read(), Name=os.path.basename(resume.filename))
        part['Content-Disposition'] = f'attachment; filename="{resume.filename}"'
        message.attach(part)

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        return jsonify({"status": "success", "message": "Email sent successfully!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
