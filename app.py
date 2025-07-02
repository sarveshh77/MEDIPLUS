from flask import Flask, render_template, request, jsonify,session
from Scrapper import fetch_doctor_details  # Import the scraper function
import pandas as pd
from helperPred import load_model, create_input_vector, predict_disease, fetch_doctors
from flask_session import Session
from dotenv import load_dotenv


app = Flask(__name__)


app.config["SESSION_TYPE"] = "filesystem"  

app.secret_key = 'secret'

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

load_dotenv()

def load_severity_score(csv_file):
    """Loads symptom severity scores from a CSV file and returns a dictionary."""
    try:
        df = pd.read_csv(csv_file)
        df.columns = df.columns.str.strip()
        if 'Symptom' not in df.columns or 'weight' not in df.columns:
            raise ValueError("Missing required columns 'Symptom' or 'weight'")

        df['Symptom'] = df['Symptom'].str.strip().str.lower()

        df['weight'] = pd.to_numeric(df['weight'], errors='coerce').fillna(0).astype(int)

        severity_scores = dict(zip(df['Symptom'], df['weight']))
        return severity_scores

    except Exception as e:
        print("Error loading severity scores:", e)
        return {}

severity_scores = load_severity_score("Symptom-severity.csv")

severity = 1
@app.route('/calculate_severity', methods=['POST'])
def calculate_severity():
    try:
        data = request.get_json()

        symptoms = data.get("symptoms", [])
        print(symptoms)
        days = data.get("days", 0)
        chronic_disease = data.get("chronic_disease", False)

        symptoms = [s.strip().lower() for s in symptoms]
        
        total_severity = sum(severity_scores.get(symptom, 0) for symptom in symptoms)
       
        if days > 7:
            total_severity *= 1.5
        elif days > 3:
            total_severity *= 1.2

        if chronic_disease:
            total_severity *= 1.3
       
        session["severity_score"] = round(total_severity, 2)
        session["predictedDoctor"]= predict_disease_route(symptoms)
      
        print("Final Severity Score:", total_severity)  
        return jsonify({"severity_score": session["severity_score"]})
    except Exception as e:
        print("Error in calculate_severity:", e)
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/get_severity', methods=['GET'])
def get_severity():
    if "severity_score" in session:
        return jsonify({"severity_score": session["severity_score"]})
    return jsonify({"severity_score": "Not Calculated Yet"}), 400

model = load_model("RandomForestPredictor.pkl")

def predict_disease_route(symptoms):
    # data = request.json
    # symptoms = data['symptoms']
    # Convert symptoms to input vector
    input_vector = create_input_vector(symptoms)
    # Predict disease
    predicted_disease, specialist = predict_disease(model, input_vector)

    # Display prediction on terminal
    print(f"Predicted Disease: {predicted_disease}")
    print(f"Associated Specialist: {specialist}")

    #session["predictedDoctor"] = specialist
    return specialist

@app.route('/getPredictedDoctor',methods=['GET'])
def getPredictedDoctor():
    if "predictedDoctor" in session:
         return jsonify({"predictedDoctor": session["predictedDoctor"]})
    return jsonify({"predictedDoctor": "Not Calculated Yet"}), 400


@app.route('/')
def index():
    return render_template('index.html')

@app.route("/LoginPatient", methods=['POST', 'GET'])
def LoginPatient():
    return render_template('LoginPatient.html')

@app.route("/LoginDoctor", methods=['POST', 'GET'])
def LoginDoctor():
    return render_template('LoginDoctor.html')

@app.route("/RegisterDoctor", methods=['POST', 'GET'])
def RegisterDoctor():
    return render_template('RegisterDoctor.html')

@app.route("/doctors", methods=['POST', 'GET'])
def doctors():
    print("Doctors page accessed")
    return render_template('doctors.html')

@app.route("/DoctorProfile", methods=['POST', 'GET'])
def DoctorProfile():
    return render_template('DoctorProfile.html')

@app.route("/UserProfile", methods=['POST', 'GET'])
def UserProfile():
    return render_template('UserProfile.html')

# Add a route for the patient profile page
@app.route('/patient_profile')
def patient_profile():
    # You might add authentication checks here
    return render_template('patient_profile.html')

@app.route("/AboutUs", methods=['POST', 'GET'])
def AboutUs():
    return render_template('AboutUs.html')

@app.route("/NearestDoctor",methods=['POST','GET'])
def NearestDoctor():
    return render_template('NearestDoctor.html')


@app.route("/Bookappointment",methods=['POST','GET'])
def Bookappointment():
    return render_template('Bookappoinment.html')


@app.route('/validate_doctor', methods=['POST'])
def validate_doctor():
    data = request.json
    fullName = data['fullName']
    licenseNumber = data['licenseNumber']

    # Call the scraper function to validate the doctor
    doctor_info = fetch_doctor_details(fullName, licenseNumber)

    
    # Case 1: Doctor not found
    if (doctor_info == "Doctor not found" or 
        doctor_info == ["No data available in table"] or
        (isinstance(doctor_info, list) and len(doctor_info) == 1 and 
         "No data available" in doctor_info[0])):
        return jsonify({
            'valid': False,
            'message': 'Doctor not found in registry'
        }), 404  # Not Found status
    
    # Case 2: Doctor found (success)
    elif doctor_info and isinstance(doctor_info, list) and len(doctor_info) > 0:  # Checks for non-empty list/truthy value
        return jsonify({
            'valid': True,
            'message': 'Doctor validated',
            'doctor_data': doctor_info  # Include the actual data if needed
        })  # Default 200 OK
    
    # Case 3: Technical error
    else:
        return jsonify({
            'valid': False,
            'message': 'Validation error occurred'
        }), 500  # Internal Server Error

if __name__ == "__main__":


    app.run(debug=True) 