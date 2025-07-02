# utils.py
import pickle
import numpy as np
import firebase_admin
from firebase_admin import credentials
from google.cloud.firestore_v1 import FieldFilter
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

# Firebase configuration (same as in your JS code)
firebase_config = {
    "apiKey": "AIzaSyC0ncA7or5DGpfMj3bxYpz7pAmNDhJy9aM",
    "authDomain": "bookmydoc-7b3d1.firebaseapp.com",
    "projectId": "bookmydoc-7b3d1",
    "storageBucket": "bookmydoc-7b3d1.firebasestorage.app",
    "messagingSenderId": "182899610658",
    "appId": "1:182899610658:web:105b642d77c7a4b1fb267b",
    "measurementId": "G-NBX1LDNMV3"
}

# Initialize Firebase Admin SDK using environment variables
firebase_service_account = {
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY"),
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL"),
    "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN"),
}

cred = credentials.Certificate(firebase_service_account)
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()



# Load the trained model
def load_model(model_path):
    return pickle.load(open(model_path, "rb"))

# Symptoms and Disease Mapping
symptoms_list = {
    "itching": 0, "skin_rash": 1, "nodal_skin_eruptions": 2, "continuous_sneezing": 3, "shivering": 4,
    "chills": 5, "joint_pain": 6, "stomach_pain": 7, "acidity": 8, "ulcers_on_tongue": 9, "muscle_wasting": 10,
    "vomiting": 11, "burning_micturition": 12, "spotting_ urination": 13, "fatigue": 14, "weight_gain": 15,
    "anxiety": 16, "cold_hands_and_feets": 17, "mood_swings": 18, "weight_loss": 19, "restlessness": 20,
    "lethargy": 21, "patches_in_throat": 22, "irregular_sugar_level": 23, "cough": 24, "high_fever": 25,
    "sunken_eyes": 26, "breathlessness": 27, "sweating": 28, "dehydration": 29, "indigestion": 30, "headache": 31,
    "yellowish_skin": 32, "dark_urine": 33, "nausea": 34, "loss_of_appetite": 35, "pain_behind_the_eyes": 36,
    "back_pain": 37, "constipation": 38, "abdominal_pain": 39, "diarrhoea": 40, "mild_fever": 41, "yellow_urine": 42,
    "yellowing_of_eyes": 43, "acute_liver_failure": 44, "fluid_overload": 45, "swelling_of_stomach": 46,
    "swelled_lymph_nodes": 47, "malaise": 48, "blurred_and_distorted_vision": 49, "phlegm": 50, "throat_irritation": 51,
    "redness_of_eyes": 52, "sinus_pressure": 53, "runny_nose": 54, "congestion": 55, "chest_pain": 56,
    "weakness_in_limbs": 57, "fast_heart_rate": 58, "pain_during_bowel_movements": 59, "pain_in_anal_region": 60,
    "bloody_stool": 61, "irritation_in_anus": 62, "neck_pain": 63, "dizziness": 64, "cramps": 65, "bruising": 66,
    "obesity": 67, "swollen_legs": 68, "swollen_blood_vessels": 69, "puffy_face_and_eyes": 70, "enlarged_thyroid": 71,
    "brittle_nails": 72, "swollen_extremeties": 73, "excessive_hunger": 74, "extra_marital_contacts": 75,
    "drying_and_tingling_lips": 76, "slurred_speech": 77, "knee_pain": 78, "hip_joint_pain": 79, "muscle_weakness": 80,
    "stiff_neck": 81, "swelling_joints": 82, "movement_stiffness": 83, "spinning_movements": 84, "loss_of_balance": 85,
    "unsteadiness": 86, "weakness_of_one_body_side": 87, "loss_of_smell": 88, "bladder_discomfort": 89,
    "foul_smell_of urine": 90, "continuous_feel_of_urine": 91, "passage_of_gases": 92, "internal_itching": 93,
    "toxic_look_(typhos)": 94, "depression": 95, "irritability": 96, "muscle_pain": 97, "altered_sensorium": 98,
    "red_spots_over_body": 99, "belly_pain": 100, "abnormal_menstruation": 101, "dischromic _patches": 102,
    "watering_from_eyes": 103, "increased_appetite": 104, "polyuria": 105, "family_history": 106, "mucoid_sputum": 107,
    "rusty_sputum": 108, "lack_of_concentration": 109, "visual_disturbances": 110, "receiving_blood_transfusion": 111,
    "receiving_unsterile_injections": 112, "coma": 113, "stomach_bleeding": 114, "distention_of_abdomen": 115,
    "history_of_alcohol_consumption": 116, "fluid_overload.1": 117, "blood_in_sputum": 118, "prominent_veins_on_calf": 119,
    "palpitations": 120, "painful_walking": 121, "pus_filled_pimples": 122, "blackheads": 123, "scurring": 124,
    "skin_peeling": 125, "silver_like_dusting": 126, "small_dents_in_nails": 127, "inflammatory_nails": 128,
    "blister": 129, "red_sore_around_nose": 130, "yellow_crust_ooze": 131
}

# Disease-to-Specialist Mapping
specialists = {
    "Fungal infection": "Dermatologist",
    "Allergy": "Allergist",
    "GERD": "Gastroenterologist",
    "Chronic cholestasis": "Hepatologist",
    "Drug Reaction": "Allergist",
    "Peptic ulcer diseae": "Gastroenterologist",
    "AIDS": "Osteopathic",
    "Diabetes": "Endocrinologist",
    "Gastroenteritis": "Gastroenterologist",
    "Bronchial Asthma": "Pulmonologist",
    "Hypertension": "Cardiologist",
    "Migraine": "Neurologist",
    "Cervical spondylosis": "Neurologist",
    "Paralysis (brain hemorrhage)": "Neurologist",
    "Jaundice": "Gastroenterologist",
    "Malaria": "Internal Medcine",
    "Chicken pox": "Dermatologist",
    "Dengue": "Internal Medcine",
    "Typhoid": "Pediatrician",
    "hepatitis A": "Hepatologist",
    "Hepatitis B": "Hepatologist",
    "Hepatitis C": "Hepatologist",
    "Hepatitis D": "Hepatologist",
    "Hepatitis E": "Hepatologist",
    "Alcoholic hepatitis": "Hepatologist",
    "Tuberculosis": "Tuberculosis",
    "Common Cold": "Otolaryngologist",
    "Pneumonia": "Pulmonologist",
    "Dimorphic hemmorhoids(piles)": "Gastroenterologist",
    "Heart attack": "Cardiologist",
    "Varicose veins": "Phlebologist",
    "Hypothyroidism": "Endocrinologist",
    "Hyperthyroidism": "Endocrinologist",
    "Hypoglycemia": "Endocrinologist",
    "Osteoarthristis": "Rheumatologists",
    "Arthritis": "Rheumatologists",
    "(vertigo) Paroymsal Positional Vertigo": "Otolaryngologist",
    "Acne": "Dermatologist",
    "Urinary tract infection": "Gynecologist",
    "Psoriasis": "Dermatologist",
    "Impetigo": "Dermatologist"
}

diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction',
    33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ', 17: 'Gastroenteritis', 6: 'Bronchial Asthma',
    23: 'Hypertension ', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)',
    28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A',
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis',
    36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemmorhoids(piles)',
    18: 'Heart attack', 39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia',
    31: 'Osteoarthristis', 5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo', 2: 'Acne',
    38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'
}

# Convert symptoms to input vector
def create_input_vector(symptoms):
    input_vector = np.zeros(len(symptoms_list))
    for symptom in symptoms:
        if symptom in symptoms_list:
            input_vector[symptoms_list[symptom]] = 1
    return input_vector


def predict_disease(model, input_vector):
    predicted_label = model.predict([input_vector])[0]
    predicted_disease = diseases_list.get(predicted_label, "Unknown Disease")
    specialist = specialists.get(predicted_disease, "General Physician")
    return predicted_disease, specialist

# # Fetch disease info (currently hardcoded)
# def get_disease_info(disease):
#     disease_description = f"Sample description for {disease}"
#     precautions = ["Precaution 1", "Precaution 2", "Precaution 3"]
#     return disease_description, precautions

def fetch_doctors(specialist, city):
    """Fetch doctors from Firebase based on specialist and city."""
    doctors = []
    try:
        doctors_ref = db.collection(f"DoctorsBySpecialization/{specialist}/Doctors")
        query = doctors_ref.where(filter=FieldFilter("city", "==", city)).limit(4)  # Limit to 4 doctors
        docs = query.stream()

        for doc in docs:
            doctor = doc.to_dict()
            print(doctor)
            doctors.append(doctor)

    except Exception as e:
        print(f"Error fetching doctors: {e}")

    return doctors