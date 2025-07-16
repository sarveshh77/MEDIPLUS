# 🏥Mediplus

A powerful **AI-powered Web Platform** that predicts diseases, recommends doctors, and simplifies healthcare access through smart automation.

[![Live Site](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://mediplus-1-h3zu.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Highlighted Features

✅ **AI-Powered Specialist Prediction**  
✅ **Automatic Severity Scoring for Prioritizing Care**  
✅ **Nearest Doctor Search for Fast, Local Help**  
✅ **Doctor Credential Verification via Web Scraping**  
✅ **Modern, Professional & Mobile-Responsive UI**  
✅ **Secure Real-Time Data Management using Firebase**

---

## 🌐 Overview

**Mediplus** is an AI-integrated telemedicine platform that connects patients with verified doctors. It predicts diseases from symptoms, prioritizes care based on severity, and enables real-time appointment booking — all on a secure, mobile-friendly web interface.

---

## 🚀 Features

### 👤 User & Doctor Management
- Patient & Doctor registration and login
- Dedicated dashboards for both users
- Firebase-based session & profile management

### 📅 Appointment System
- Search doctors by specialization and availability
- Global time zone support for accurate scheduling
- Real-time notifications for confirmations and updates

### 🧠 Machine Learning Disease Prediction
- Predicts probable diseases from symptoms
- Severity-based triage to prioritize critical cases
- Recommends the right specialist based on ML output

### 🔍 Doctor Credential Verification
- Selenium scraper checks doctors' legitimacy against official registry
- Enhances platform trustworthiness and user safety

### 📍 Nearest Doctor Search
- Patients can locate the closest available doctors by location or need
- Facilitates fast access to emergency and routine care

### 🔐 Security & Sessions
- Flask-Session integration for secured sessions
- Data protection and role-based route handling

---

## 🧰 Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| **Frontend** | HTML, CSS (Mediplus Template), JavaScript |
| **Backend**  | Python, Flask, Flask-Session |
| **Database** | Firebase Firestore |
| **Machine Learning** | Random Forest, Pandas, NumPy |
| **Web Scraping** | Selenium |
| **Deployment** | Gunicorn + Render |

---

## 🔄 Key Functional Routes

| Route | Functionality |
|-------|----------------|
| `/` | Homepage |
| `/LoginPatient` | Patient Login |
| `/LoginDoctor` | Doctor Login |
| `/RegisterDoctor` | Doctor Signup |
| `/DoctorProfile` | Doctor Dashboard |
| `/patient_profile` | Patient Dashboard |
| `/bookappoinment` | Appointment Booking |
| `/getPredictedDoctor` | ML Specialist Recommendation |
| `/validate_doctor` | Web-Scraping-Based Verification |
| `/NearestDoctor` | Local Doctor Search |
| `/AboutUs` | Platform Info Page |

---

## 🤖 ML Model Details

- **Model:** `RandomForestPredictor.pkl`
- **Inputs:** Symptoms, Duration, Chronic Illness status
- **Outputs:** Predicted Disease, Suggested Specialist
- **Backend Calculation:** Severity Score based on symptom mapping CSV

---

## 🔥 Firebase Integration

- Firestore used for patient/doctor/appointment data
- Firebase SDK enables real-time data syncing and updates
- Authentication

---

## 📱 Responsive UI

- Based on **Mediplus HTML template**
- Optimized for:
  - Mobile 📱
  - Tablet 📲
  - Desktop 💻
- Includes:
  - Sliders
  - Sticky Navigation
  - Smooth Scroll
  - Testimonials & Contact Pages

---

## 🛠️ Installation & Setup

```bash
git clone https://github.com/yourusername/MEDIPLUS.git
cd mediplus
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

---


## 📬 Contact

Have questions, feedback, or suggestions?

Feel free to reach out:

📧 **Email:** [bookmydoc28@gmail.com](mailto:bookmydoc28@gmail.com)



