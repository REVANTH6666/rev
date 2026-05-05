from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3  # ✅ CHANGED
import random
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)

# =========================
# ✅ DB CONNECTION (UPDATED)
# =========================
def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# =========================
# 🏗️ INIT DB (ADDED)
# =========================
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            course TEXT,
            age INTEGER,
            otp TEXT,
            otp_expiry TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()

# =========================
# 🏠 HOME
# =========================
@app.route('/')
def home():
    return jsonify({"success": True, "message": "🚀 Server running successfully!"})

# =========================
# 🔐 OTP GENERATOR
# =========================
def generate_otp():
    return str(random.randint(1000, 9999))

# =========================
# 📩 SEND EMAIL OTP
# =========================
def send_email_otp(receiver_email, otp, name):
    sender_email = "revanthnarindi@gmail.com"
    app_password = "qvasxnelrsnqtsyu"

    subject = "🔐 OTP Verification - Course App"
    body = f"""
Hello {name} 👋,
🔐 Your OTP: {otp}

⏳ This OTP is valid for 3 minutes.
"""

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print("❌ EMAIL ERROR:", e)
        return False

# =========================
# 📝 REGISTER
# =========================
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email=?", (data['email'],))
    if cursor.fetchone():
        return jsonify({"success": False, "message": "Email already exists ❌"})

    cursor.execute(
        "INSERT INTO users (name, email, password, course, age) VALUES (?,?,?,?,?)",
        (data['name'], data['email'], data['password'], data['course'], int(data['age']))
    )
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 🔐 LOGIN → SEND OTP
# =========================
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (data['email'], data['password'])
    )
    user = cursor.fetchone()

    if not user:
        return jsonify({"success": False, "message": "Invalid credentials ❌"})

    name = user["name"]

    otp = generate_otp()
    expiry = (datetime.now() + timedelta(minutes=3)).isoformat()

    cursor.execute(
        "UPDATE users SET otp=?, otp_expiry=? WHERE email=?",
        (otp, expiry, data['email'])
    )
    db.commit()

    send_email_otp(data['email'], otp, name)

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 🔁 RESEND OTP
# =========================
@app.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT name FROM users WHERE email=?", (data['email'],))
    user = cursor.fetchone()
    name = user[0]

    otp = generate_otp()
    expiry = (datetime.now() + timedelta(minutes=3)).isoformat()

    cursor.execute(
        "UPDATE users SET otp=?, otp_expiry=? WHERE email=?",
        (otp, expiry, data['email'])
    )
    db.commit()

    send_email_otp(data['email'], otp, name)

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 🔐 SEND OTP (FORGOT PASSWORD)
# =========================
@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT name FROM users WHERE email=?", (data['email'],))
    user = cursor.fetchone()

    if not user:
        return jsonify({"success": False, "message": "Email not found ❌"})

    name = user[0]

    otp = generate_otp()
    expiry = (datetime.now() + timedelta(minutes=3)).isoformat()

    cursor.execute(
        "UPDATE users SET otp=?, otp_expiry=? WHERE email=?",
        (otp, expiry, data['email'])
    )
    db.commit()

    send_email_otp(data['email'], otp, name)

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# ✅ VERIFY OTP
# =========================
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT otp, otp_expiry FROM users WHERE email=?",
        (data['email'],)
    )
    user = cursor.fetchone()

    if not user:
        return jsonify({"success": False, "message": "User not found ❌"})

    if str(user["otp"]).strip() != str(data['otp']).strip():
        return jsonify({"success": False, "message": "Invalid OTP ❌"})

    if datetime.now() > datetime.fromisoformat(user["otp_expiry"]):
        return jsonify({"success": False, "message": "OTP expired ⏳"})

    return jsonify({"success": True})

# =========================
# 🔐 RESET PASSWORD
# =========================
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE users SET password=? WHERE email=?",
        (data['newPassword'], data['email'])
    )
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 👥 GET USERS
# =========================
@app.route('/users', methods=['GET'])
def get_users():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id, name, email, course, age FROM users ORDER BY id ASC")
    users = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify([dict(u) for u in users])

# =========================
# ✏️ UPDATE USER
# =========================
@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE users SET name=?, email=?, course=?, age=? WHERE id=?",
        (data['name'], data['email'], data['course'], int(data['age']), id)
    )
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 🗑 DELETE USER
# =========================
@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM users WHERE id=?", (id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"success": True})

# =========================
# 🚀 RUN
# =========================
if __name__ == '__main__':
    app.run(debug=True)