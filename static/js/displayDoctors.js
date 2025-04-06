import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0ncA7or5DGpfMj3bxYpz7pAmNDhJy9aM",
    authDomain: "bookmydoc-7b3d1.firebaseapp.com",
    projectId: "bookmydoc-7b3d1",
    storageBucket: "bookmydoc-7b3d1.firebasestorage.app",
    messagingSenderId: "182899610658",
    appId: "1:182899610658:web:105b642d77c7a4b1fb267b",
    measurementId: "G-NBX1LDNMV3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Specializations list
const specializations = [
    "allergist", "cardiologist", "dermatologist", "endocrinologist",
    "gastroenterologist", "gynecologist", "hepatologist", "internal_medicine",
    "neurologist", "osteopathic_physician", "otolaryngologist", "pediatrician",
    "phlebologist", "pulmonologist", "rheumatologist", "tuberculosis_specialist"
];

// Container for tables
const container = document.getElementById("specializationsContainer");

// Function to fetch and display doctors for a specialization
async function fetchDoctorsBySpecialization(specialization) {
    try {
        const doctorsCollection = collection(db, `DoctorsBySpecialization/${specialization}/Doctors`);
        const snapshot = await getDocs(doctorsCollection);

        if (snapshot.empty) {
            console.log(`No doctors found for specialization: ${specialization}`);
            return;
        }

        // Create a table for this specialization
        const section = document.createElement("div");
        section.classList.add("specialization-section");

        const title = document.createElement("h2");
        title.textContent = specialization.replace(/_/g, " ");
        section.appendChild(title);

        const table = document.createElement("table");
        const tableHeader = `
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Clinic</th>
                    <th>Email</th>
                    <th>Availability</th>
                    <th>Languages</th>
                    <th>Country</th>
                    <th>Action</th>
                </tr>
            </thead>`;
        table.innerHTML = tableHeader;
        const tableBody = document.createElement("tbody");

        snapshot.forEach((doc) => {
            const doctor = doc.data();
        
            // Handle virtual availability
            const virtualAvailability = doctor.virtualAppointments
                ? `Virtual: ${doctor.virtualAppointments.days?.join(", ") || "N/A"}<br>
                   From: ${doctor.virtualAppointments.fromTime || "N/A"} To: ${doctor.virtualAppointments.toTime || "N/A"}`
                : "Virtual: Not Available";
        
            // Handle in-person availability
            const inPersonAvailability = doctor.inPersonAppointments
                ? `In-Person: ${doctor.inPersonAppointments.days?.join(", ") || "N/A"}<br>
                   From: ${doctor.inPersonAppointments.fromTime || "N/A"} To: ${doctor.inPersonAppointments.toTime || "N/A"}`
                : "In-Person: Not Available";
        
            // Combine both availabilities
            const availability = `${virtualAvailability}<br><br>${inPersonAvailability}`;
        
            const languages = doctor.languages ? doctor.languages.join(", ") : "N/A";
        
            const row = `
        <tr>
            <td>${doctor.fullName || "N/A"}</td>
            <td>${doctor.clinicName || "N/A"}</td>
            <td>${doctor.email || "N/A"}</td>
            <td>${availability}</td>
            <td>${languages}</td>
            <td>${doctor.country || "N/A"}</td>
            <td>
                <button class="btn" onclick="bookAppointment('${doctor.fullName || ""}', '${specialization}')">
                    Book Appointment
                </button>
            </td>
        </tr>`;
        
            tableBody.innerHTML += row;
        });

        table.appendChild(tableBody);
        section.appendChild(table);
        container.appendChild(section);
    } catch (error) {
        console.error(`Error fetching doctors for ${specialization}:`, error);
    }
}

// Fetch and display doctors for all specializations
specializations.forEach((specialization) => {
    fetchDoctorsBySpecialization(specialization);
});

// Book Appointment Function
window.bookAppointment = (doctorName, specialization) => {
    sessionStorage.setItem("scrollToAppointment", "true");
    sessionStorage.setItem("selectedDoctor", doctorName);
    sessionStorage.setItem("selectedSpecialization", specialization);  
    window.location.href = '/Bookappointment';
};