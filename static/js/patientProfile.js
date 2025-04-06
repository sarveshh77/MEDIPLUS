import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

// Function to fetch both upcoming and completed appointments
async function getUserAppointments(userName) {
    try {
        console.log("Fetching appointments for user:", userName);

        if (!userName) {
            throw new Error("Missing userName");
        }

        // Get upcoming appointments
        const upcomingRef = collection(db, "users", userName, "appointments");
        const upcomingSnapshot = await getDocs(upcomingRef);
        
        // Get completed appointments
        const completedRef = collection(db, "users", userName, "completedAppointments");
        const completedSnapshot = await getDocs(completedRef);

        let upcomingAppointments = [];
        let completedAppointments = [];

        upcomingSnapshot.forEach((doc) => {
            upcomingAppointments.push({ 
                id: doc.id, 
                ...doc.data(),
                status: "upcoming"
            });
        });

        completedSnapshot.forEach((doc) => {
            completedAppointments.push({ 
                id: doc.id, 
                ...doc.data(),
                status: "completed"
            });
        });

        // Sort upcoming appointments by date (ascending)
        upcomingAppointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        
        // Sort completed appointments by date (descending)
        completedAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        return {
            upcoming: upcomingAppointments,
            completed: completedAppointments
        };
    } catch (error) {
        console.error("Error fetching appointments:", error.message);
        return {
            upcoming: [],
            completed: []
        };
    }
}

// Cancel appointment function (unchanged)
window.cancelAppointment = async function (userName, appointmentId, specialization, doctorName) {
    const isConfirmed = confirm("Are you sure you want to cancel this appointment?");
    if (!isConfirmed) {
        alert("Appointment cancellation aborted.");
        return;
    }

    try {
        // Delete from user's upcoming appointments
        await deleteDoc(doc(db, "users", userName, "appointments", appointmentId));
        
        // Delete from doctor's appointments
        await deleteDoc(doc(db, "DoctorsBySpecialization", specialization, "Doctors", doctorName, "Appointments", appointmentId));

        alert("Appointment is cancelled.");

        // Remove from UI immediately
        const appointmentElement = document.getElementById(`appointment-${appointmentId}`);
        if (appointmentElement) {
            appointmentElement.remove();
        }

        // Refresh the display
        displayAppointments(userName);

    } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Failed to cancel appointment. Please try again.");
    }
};

// Display appointments in the UI
async function displayAppointments(userName) {
    const { upcoming, completed } = await getUserAppointments(userName);
    console.log("Upcoming Appointments:", upcoming);
    console.log("Completed Appointments:", completed);

    const today = new Date().toISOString().split("T")[0];
    const upcomingContainer = document.getElementById("upcomingAppointmentsContainer");
    const pastContainer = document.getElementById("pastAppointmentsContainer");

    // Clear previous content
    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    // Display upcoming appointments
    if (upcoming.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h5>No Upcoming Appointments</h5>
                <p>You don't have any scheduled appointments right now.</p>
                <a href="{{ url_for('Bookappointment') }}" class="btn btn-book mt-2">
                    <i class="fas fa-calendar-plus me-1"></i> Book Appointment
                </a>
            </div>`;
    } else {
        upcoming.forEach(app => {
            const appointmentCard = `
                <div id="appointment-${app.id}" class="appointment-card">
                    <h6>${app.consultationPref || "(No Type Provided)"}</h6>
                    <p><strong>Date:</strong> ${app.appointmentDate || "Unknown Date"}</p>
                    <p><strong>Time:</strong> ${app.appointmentTime || "(Time Not Provided)"}</p>
                    <p><strong>Doctor:</strong> ${app.selectedDoctor || "(No Doctor Assigned)"}</p>
                    <p><strong>Severity:</strong> ${app.severityValue || "(No Severity Info)"}</p>
                    <p><strong>Symptoms:</strong> ${app.symptoms || "(No Symptoms Provided)"}</p>
                    <button class="btn btn-danger mt-2" 
                            onclick="cancelAppointment('${userName}', '${app.id}', '${app.specialization}', '${app.selectedDoctor}')">
                        <i class="fas fa-times-circle me-1"></i> Cancel Appointment
                    </button>
                </div>`;
            upcomingContainer.innerHTML += appointmentCard;
        });
    }

    // Display completed appointments
    if (completed.length === 0) {
        pastContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h5>No Past Appointments</h5>
                <p>Your past appointments will appear here.</p>
            </div>`;
    } else {
        completed.forEach(app => {
            const appointmentCard = `
                <div class="appointment-card completed">
                    <h6>${app.type || "(No Type Provided)"}</h6>
                    <p><strong>Date:</strong> ${app.originalDate || "Unknown Date"}</p>
                    <p><strong>Doctor:</strong> ${app.doctorName || "(No Doctor Assigned)"}</p>
                    ${app.prescription?.diagnosis ? `<p><strong>Diagnosis:</strong> ${app.prescription.diagnosis}</p>` : ''}
                    ${app.prescription?.medications?.length > 0 ? `
                        <p><strong>Medications:</strong></p>
                        <ul>
                            ${app.prescription.medications.map(med => 
                                `<li>${med.name} - ${med.dosage} for ${med.duration}</li>`
                            ).join('')}
                        </ul>
                    ` : ''}
                </div>`;
            pastContainer.innerHTML += appointmentCard;
        });
    }

    // Update queue status with the first upcoming appointment (if any)
    // if (upcoming.length > 0) {
    //     const latestAppointment = upcoming[0]; // Already sorted by date
    //     updateQueueStatus(
    //         latestAppointment.specialization,
    //         latestAppointment.selectedDoctor,
    //         latestAppointment.consultationPref,
    //         latestAppointment.appointmentDate,
    //         latestAppointment.id
    //     );
    // } else {
    //     document.getElementById("currentQueueContainer").style.display = "none";
    //     document.getElementById("noQueueMessage").style.display = "block";
    // }
}

// Queue status functions (unchanged)
// async function getQueueNumber(specialization, doctorName, appointmentType, appointmentDate, appointmentId) {
//     try {
//         const appointmentsRef = collection(db, 
//             "DoctorsBySpecialization", specialization, 
//             "Doctors", doctorName, 
//             "Appointments", appointmentType, appointmentDate);

//         const snapshot = await getDocs(appointmentsRef);
//         let appointments = [];

//         snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.appointmentTime) {
//                 appointments.push({
//                     id: doc.id,
//                     appointmentTime: data.appointmentTime
//                 });
//             }
//         });

//         appointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
//         const index = appointments.findIndex(app => app.id === appointmentId);
//         return index !== -1 ? index + 1 : null;

//     } catch (error) {
//         console.error("Error fetching queue number:", error);
//         return null;
//     }
// }

// async function updateQueueStatus(specialization, doctorName, appointmentType, appointmentDate, appointmentId) {
//     try {
//         const queueNumber = await getQueueNumber(specialization, doctorName, appointmentType, appointmentDate, appointmentId);
        
//         const queueNumberElement = document.getElementById("queueNumber");
//         const queueDoctorElement = document.getElementById("queueDoctor");
//         const queueDepartmentElement = document.getElementById("queueDepartment");
//         const noQueueMessage = document.getElementById("noQueueMessage");
//         const currentQueueContainer = document.getElementById("currentQueueContainer");

//         if (queueNumber !== null) {
//             queueNumberElement.textContent = queueNumber;
//             queueDoctorElement.textContent = `Doctor: ${doctorName}`;
//             queueDepartmentElement.textContent = `Specialist: ${specialization}`;
//             currentQueueContainer.style.display = "block";
//             noQueueMessage.style.display = "none";
//         } else {
//             currentQueueContainer.style.display = "none";
//             noQueueMessage.style.display = "block";
//         }
//     } catch (error) {
//         console.error("Error updating queue status:", error);
//     }
// }

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
        displayAppointments(storedUserName);
    } else {
        alert("Please log in to view appointments");
        window.location.href = "/login";
    }
});