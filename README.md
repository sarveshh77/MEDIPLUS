# 🏥 Telimidicine - Mediplus

A powerful **Telemedicine Web Platform** built using **Flask**, **Firebase**, and **Machine Learning**, designed to connect patients and doctors securely and efficiently.

[![Live Site](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://mediplus-1-h3zu.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌐 Overview

**Mediplus** is a modern telemedicine system that enables:

- Seamless **appointment booking** with available doctors
- **Real-time disease prediction** using ML
- **Firebase-based authentication** and cloud data storage
- **Doctor verification** via web scraping
- Responsive **mobile-first UI** with modern components

---

## 🚀 Features

### 👤 User & Doctor Management
- Patient & Doctor registration and login
- Profile dashboards for both roles
- Firebase session and data handling

### 📅 Appointment System
- Book based on doctor specialization & availability
- Auto time zone handling
- View, update, cancel appointments
- Real-time notifications & reminders

### 🧠 ML-Based Disease Prediction
- Random Forest Classifier model
- Inputs: Symptoms, duration, chronic diseases
- Predicts likely disease + recommends a specialist

### 🔍 Doctor Credential Verification
- Selenium-based web scraping
- Verifies registration from official medical board

### 📍 Nearest Doctor Search
- Find doctors near user location or specific area
- Improved accessibility & response time

### 🔐 Security & Sessions
- Flask-Session integration
- Secrets handled via `.env` and Render environment variables

---

## 🧰 Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| **Frontend** | HTML, CSS (Mediplus), JS, Firebase SDK |
| **Backend**  | Python, Flask, Flask-Session |
| **Database** | Firebase Firestore |
| **ML**       | Random Forest (scikit-learn), Pandas, NumPy |
| **Scraping** | Selenium |
| **Deployment** | Gunicorn + Render |

---

## 📁 Routes Summary

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/LoginPatient` | Patient login |
| `/LoginDoctor` | Doctor login |
| `/RegisterDoctor` | Doctor sign-up |
| `/doctors` | View all doctors |
| `/DoctorProfile` | Doctor dashboard |
| `/patient_profile` | Patient dashboard |
| `/bookappoinment` | Book appointment |
| `/calculate_severity` | API to calculate severity |
| `/getPredictedDoctor` | Predict best specialist |
| `/validate_doctor` | Verify doctor via scraping |
| `/NearestDoctor` | Find nearest doctor |
| `/AboutUs` | About the platform |

---

## 🤖 Machine Learning Details

- **Model:** Random Forest Classifier
- **Input Features:** Symptoms, duration, chronic condition status
- **Output:** Disease prediction + specialist recommendation
- **Files:** 
  - `RandomForestPredictor.pkl` – trained model
  - `symptom_severity.csv` – severity mapping

---

## 🔥 Firebase Integration

- Firestore used for:
  - Storing patient, doctor & appointment data
- Realtime Firebase SDK enables:
  - Instant updates
  - Notifications
- Firebase Authentication manages:
  - Secure user sessions

---

## 🖼️ Screenshots

> _(Add actual screenshots of your project UI here, e.g. mobile view, appointment booking, dashboards, etc.)_

---

## 📱 Responsive UI

- Based on **Mediplus HTML template**
- Fully responsive across desktop, tablet, and mobile
- Includes:
  - Sliders
  - Testimonials
  - Sticky navigation
  - Dynamic forms

---

## 🛠️ Installation

```bash
git clone https://github.com/yourusername/mediplus.git
cd mediplus
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
