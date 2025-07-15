# Mediplus (Telimidicine)

Bridging the gap between patients and doctors with AI-powered telemedicine.

---

## 🚀 Overview

**Mediplus** is a modern telemedicine platform that connects patients with certified doctors, offers instant disease prediction using machine learning, and provides seamless appointment booking—all in a secure, user-friendly environment.

---

## ✨ Features

- **Patient & Doctor Registration/Login**  
  Secure sign-up and login for both patients and doctors.

- **Personal Dashboards**  
  Dedicated dashboards for patients and doctors to manage profiles and appointments.

- **Effortless Appointment Booking**  
  Book appointments with top doctors in just a few clicks, anytime and anywhere.

- **Nearest Doctor Search**  
  Find and connect with the closest available doctors based on location or specialization.

- **ML-Based Disease Prediction**  
  Enter symptoms to get instant disease predictions and specialist recommendations using a trained Random Forest model.

- **Severity Scoring**  
  Calculates the severity of symptoms to prioritize care.

- **Doctor Verification**  
  Validates doctor credentials via web scraping of official registries.

- **Time Zone Synchronization**  
  Global accessibility with automatic time zone adjustments for appointments.

- **Real-Time Notifications**  
  Instant reminders and updates for appointments.

- **Firebase Integration**  
  Secure, real-time data storage and user management.

- **Responsive, Modern UI**  
  Professional design based on the Mediplus HTML template, fully responsive for all devices.

- **Emergency Contact**  
  Quick access to emergency medical care information.

- **About & Contact Pages**  
  Learn more about the platform and get support.

---

## 🛠️ Tech Stack

- **Backend:** Python (Flask, Flask-Session, Pandas, NumPy, Scikit-learn, Selenium)
- **Frontend:** HTML, CSS (Mediplus template), JavaScript, Bootstrap
- **Database:** Firebase Firestore
- **Machine Learning:** Random Forest Classifier
- **Other:** dotenv, Gunicorn

---

## 📦 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Mediplus.git
   cd Mediplus/MEDIPLUS
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up Firebase:**
   - Add your Firebase credentials to `serviceAccountKeyFB.json` and configure environment variables as needed.
4. **Run the application:**
   ```bash
   python app.py
   ```
5. **Access the app:**
   - Open your browser and go to `http://localhost:5000`

---

## 🧑‍💻 Usage

- **Register/Login** as a patient or doctor.
- **Patients:**
  - Enter symptoms, get severity score and disease prediction.
  - Book appointments with recommended or nearest doctors.
- **Doctors:**
  - Manage appointments and view patient details.
- **Admins:**
  - Validate new doctor registrations.

---

## 📸 Screenshots

> _Add screenshots of your main pages below. Replace the image paths with your actual screenshot files._

### Home Page
![Home Page](screenshots/home.png)

### Patient Dashboard
![Patient Dashboard](screenshots/patient_dashboard.png)

### Doctor Dashboard
![Doctor Dashboard](screenshots/doctor_dashboard.png)

### Appointment Booking
![Appointment Booking](screenshots/appointment_booking.png)

### Disease Prediction
![Disease Prediction](screenshots/disease_prediction.png)

### Nearest Doctor Search
![Nearest Doctor Search](screenshots/nearest_doctor.png)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [Mediplus HTML Template](http://wpthemesgrid.com/)
- [Firebase](https://firebase.google.com/)
- [scikit-learn](https://scikit-learn.org/)
- [Flask](https://flask.palletsprojects.com/)

---

> _For any questions or support, please contact [your-email@example.com](mailto:your-email@example.com)_
