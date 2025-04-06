// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, addDoc, getDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0ncA7or5DGpfMj3bxYpz7pAmNDhJy9aM",
    authDomain: "bookmydoc-7b3d1.firebaseapp.com",
    projectId: "bookmydoc-7b3d1",
    storageBucket: "bookmydoc-7b3d1.firebasestorage.app",
    messagingSenderId: "182899610658",
    appId: "1:182899610658:web:105b642d77c7a4b1fb267b",
    measurementId: "G-NBX1LDNMV3",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getCurrentUserId() {
    try {
        const storedUserEmail = sessionStorage.getItem("userEmail"); // Assuming email is stored in sessionStorage  
        if (!storedUserEmail) {
            alert("User email not found. Please log in again.");
            throw new Error("User email not found.");
        }

        const storedUserName = sessionStorage.getItem("userName"); // Assuming email is stored in sessionStorage  
        if (!storedUserEmail) {
            alert("User name not found. Please log in again.");
            throw new Error("User email not found.");
        }

        // Query Firestore to find the user by their email
        const userQuery = query(collection(db, "users"), where("name", "==", storedUserName));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            alert("User not found. Please register or log in.");
            throw new Error("User not found in Firestore.");
        }

        // alert("User identified successfully."+storedUserName);
        return storedUserName; // Return the Firestore document ID
    } catch (error) {
        console.error("Error retrieving user ID:", error);
        alert("Error retrieving user information. Please try again.");
        return null;
    }
}

async function storeUserAppointment(userName, appointmentData, consultationPref, appointmentDate) {
    try {
        console.log("Saving appointment for user:", userName);
        console.log("Appointment Data:", appointmentData);

        if (!userName || !appointmentData) {
            throw new Error("Missing userName or appointmentData");
        }

        // Reference to user's document
        const userRef = doc(db, "users", userName);

        // Reference to the appointment document in the subcollection
        const appointmentRef = doc(userRef, "appointments", `${consultationPref}_${appointmentDate}`);

        // Save appointment in the subcollection
        await setDoc(appointmentRef, appointmentData);

        // alert("Appointment stored successfully!");
    } catch (error) {
        console.error("Error storing appointment for user: ", error.message);
        alert(`Error: ${error.message}`);
    }
}

const specialization = sessionStorage.getItem("selectedSpecialization");

let severityValue; 

async function fetchSeverity(symptoms, days = 0, chronic_disease = false) {
    console.log("Sending Symptoms:", symptoms);  

    try {
        // Send symptoms to calculate severity
        const calcResponse = await fetch('/calculate_severity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms, days, chronic_disease })
        });

        if (!calcResponse.ok) throw new Error(`HTTP error! Status: ${calcResponse.status}`);

        // Fetch the updated severity
        const response = await fetch('/get_severity');
        const data = await response.json();

        console.log("Fetched Severity:", data.severity_score);  // Fixed key name

        return data.severity_score;  // Return correct value
    } catch (error) {
        console.error('Error fetching severity:', error);
        return 0; // Default severity value
    }
}

async function checkDoctorAvailability(doctorId, appointmentDate, appointmentTime, consultationPref) {
    try {
        const specialization = sessionStorage.getItem("selectedSpecialization");
        if (!specialization) {
            alert("Specialization not found! Please select a specialization.");
            return false;
        }

        // Reference to the doctor document
        const doctorRef = doc(db, "DoctorsBySpecialization", specialization, "Doctors", doctorId);
        const doctorSnap = await getDoc(doctorRef);

        if (!doctorSnap.exists()) {
            alert("Doctor not found in specialization: " + specialization);
            return false;
        }

        const doctorData = doctorSnap.data();
        const appointmentTypes = doctorData.appointmentTypes || {};

        console.log("Doctor Data:", doctorData);
        console.log("Selected Consultation Preference:", consultationPref);

        // Ensure the doctor supports the selected consultation preference
        if ((consultationPref === "in-person" && !appointmentTypes.inPerson) || 
            (consultationPref === "virtual" && !appointmentTypes.virtual)) {
            alert(`This doctor does not accept ${consultationPref} appointments.`);
            return false;
        }

        // Select the correct appointment type data
        const availability = consultationPref === "in-person" ? doctorData.inPersonAppointments : doctorData.virtualAppointments;

        if (!availability || !availability.days || availability.days.length === 0) {
            alert(`Doctor's ${consultationPref} availability data is missing!`);
            return false;
        }

        console.log("Availability:", availability);

        const workingDays = availability.days || [];
        const fromTime = availability.fromTime || "00:00";
        const toTime = availability.toTime || "23:59";
        const maxAppointments = parseInt(availability.patientsPerDay) || 0;

        // Get the day of the week from appointment date
        const appointmentDay = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' });
        console.log("Appointment Day:", appointmentDay);

        // Check if the doctor is available on the specified day
        if (!workingDays.includes(appointmentDay)) {
            alert(`Doctor is not available on ${appointmentDay} for ${consultationPref} appointments.`);
            return false;
        }

        // Validate the time range
        const isWithinTimeRange = (time, start, end) => {
            const [h, m] = time.split(":").map(Number);
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);

            const appointmentMinutes = h * 60 + m;
            const startMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;

            return appointmentMinutes >= startMinutes && appointmentMinutes <= endMinutes;
        };

        if (!isWithinTimeRange(appointmentTime, fromTime, toTime)) {
            alert(`Doctor is only available between ${fromTime} - ${toTime} for ${consultationPref} appointments.`);
            return false;
        }

        // Construct the path for appointments based on consultation preference
        const appointmentPath = `${consultationPref}/${appointmentDate}`;
        const appointmentsRef = collection(db, "DoctorsBySpecialization", specialization, "Doctors", doctorId, "Appointments", appointmentPath);
        const appointmentSnap = await getDocs(appointmentsRef);

        console.log("Existing Appointments:", appointmentSnap.size);

        if (appointmentSnap.size >= maxAppointments) {
            alert(`Doctor has reached the maximum number of ${consultationPref} appointments for this day.`);
            return false;
        }

        // Check if the requested time slot is already taken
        let isTimeSlotTaken = false;
        appointmentSnap.forEach((doc) => {
            const appointmentData = doc.data();
            if (appointmentData.appointmentTime === appointmentTime) {
                isTimeSlotTaken = true;
            }
        });

        if (isTimeSlotTaken) {
            alert("This time slot is already booked. Please select another time.");
            return false;
        }

        // alert("Doctor is available for the selected appointment.");
        return true; // Doctor is available
    } catch (error) {
        console.error("Error checking doctor availability:", error);
        alert("An error occurred while checking doctor availability.");
        return false;
    }
}
function formatTime(timeStr) {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}


// Handle Form Submission
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("appointmentForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const userId = await getCurrentUserId();

        if (!userId) return;

        const name = document.getElementById("name")?.value || "";
        const age = document.getElementById("age")?.value || "";
        const gender = document.getElementById("gender")?.value || "";
        const country = document.getElementById("country")?.value || "";
        const days = document.getElementById("days")?.value || "";
        const chronicDisease = document.getElementById("chronicDisease")?.value || "";
        const consultationPref = document.querySelector('input[name="consultationPref"]:checked')?.value || "";
        const doctorSelect = document.querySelector('input[name="doctorSelect"]:checked')?.value || "";
        const manualDoctor = document.getElementById("manualDoctor")?.value || "";
        const language = document.getElementById("language")?.value || "";
        const appointmentDate = document.getElementById("appointmentDate")?.value || "";
        const appointmentTime = document.getElementById("appointmentTime")?.value || "";
        const symptoms = selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "";
        const selectedDoctor = doctorSelect === "manual" ? manualDoctor : "Auto Assigned";
        const username = document.getElementById("username")?.value || ""; // Retrieve the username field

        if (!appointmentDate || !appointmentTime || !selectedDoctor) {
            alert("Please fill in all required fields!");
            return;
        }

        const isAvailable = await checkDoctorAvailability(selectedDoctor, appointmentDate, appointmentTime, consultationPref);
        if (!isAvailable) return;

        try {
            const doctorSpecialization = specialization;

            const patientRef = doc(
                db,
                "DoctorsBySpecialization",
                doctorSpecialization,
                "Doctors",
                selectedDoctor,
                "Appointments",
                consultationPref,
                appointmentDate,
                name
            );

            const severityValue = await fetchSeverity(selectedSymptoms);

            const appointmentData = {
                name,
                age,
                gender,
                country,
                symptoms,
                days,
                chronicDisease,
                doctorSelect,
                language,
                appointmentDate,
                appointmentTime,
                severityValue,
                consultationPref,
                username, 
                selectedDoctor,// Add username to the appointment data
                timestamp: serverTimestamp(),
            };

            const appointmentDataPatient = {
                name,
                selectedDoctor,
                symptoms,
                doctorSelect,
                appointmentDate,
                appointmentTime,
                severityValue,
                consultationPref,
                username, // Add username to the patient appointment data
                timestamp: serverTimestamp(),
            };

            // Store appointment in Doctor's database
            await setDoc(patientRef, appointmentData);

            // Store appointment in User's database
            await storeUserAppointment(userId, appointmentDataPatient, consultationPref, appointmentDate);

            alert("Appointment booked successfully!");

            // Probably should be in a function

            const isVirtual = consultationPref.toLowerCase() === 'virtual';
    
            // 2. Correct Firebase document reference path
            const doctorRef = doc(db, 'DoctorsBySpecialization', specialization, 'Doctors', manualDoctor);
            
            try {
                const docSnap = await getDoc(doctorRef);
                if (!docSnap.exists()) throw new Error('Doctor not found');
        
                const doctorData = docSnap.data();
                
                // 3. Fixed time source selection - checks both possible structures
                const timeSource = isVirtual 
                    ? doctorData.virtualAppointments || {}  // Fallback to empty object
                    : doctorData.inPersonAppointments || doctorData; // Fallback to root if inPersonAppointments doesn't exist
                
                // Safely extract values
                const fromTime = timeSource.fromTime || (isVirtual ? "09:00" : "10:30");
                const toTime = timeSource.toTime || "17:00";
                const patientsPerDay = parseInt(timeSource.patientsPerDay) || (isVirtual ? 10 : 20);

                // Calculate time difference
                const [fromH, fromM] = fromTime.split(':').map(Number);
                const [toH, toM] = toTime.split(':').map(Number);
                const totalMinutes = ((toH * 60) + toM) - ((fromH * 60) + fromM);
                
                if (totalMinutes <= 0) {
                    throw new Error('Invalid time range');
                }

                const avgTimeMinutes = totalMinutes / patientsPerDay;

                    // alert(`🕒 ${consultationPref} Consultation Available\n\n` +
                    //     `Start Time: ${formatTime(timeSource.fromTime)}\n` +
                    //     `End Time: ${formatTime(timeSource.toTime)}\n` +
                    //     `Avg time: ${avgTimeMinutes}`);

                // 4. Get current date for queue processing
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                // alert(`Today: ${today}\n`+`Doc selection: ${manualDoctor}`);





                // 5. Process appointment queue
                const queueRef = collection(
                    db,
                    "DoctorsBySpecialization",
                    specialization,
                    "Doctors",
                    manualDoctor,
                    "Appointments",
                    consultationPref,
                    appointmentDate
                );

                const queueSnapshot = await getDocs(queueRef);

                // Check if collection exists
                console.log("Number of documents found:", queueSnapshot.size);
                // alert(`Found ${queueSnapshot.size} appointments in queue`);


                const appointments = [];
                
                queueSnapshot.forEach((patient) => {
                    const apptData = patient.data();
                    // if (apptData.status !== 'pending') return;

                        appointments.push({
                        patientName: apptData.name,
                        bookingTime: apptData.appointmentTime,
                        severity: apptData.severityValue || 0
                        });
                });
                
                    // Sorting queue
                    appointments.sort((a, b) => {
                        // Higher severity first
                        if (b.severity !== a.severity) return b.severity - a.severity;
                    });


                    // 6. Check for priority boosts (2-hour threshold)
                    
                    const PRIORITY_THRESHOLD_HOURS = 1 * 60;
                    let position = 0;

                    function timeToMinutes(timeStr) {
                        const [hours, minutes] = timeStr.split(":").map(Number);
                        return hours * 60 + minutes; // Convert time to total minutes
                    }                    

                    for (const appt of appointments) {
                        appt.position = ++position;
                        /// Calculate estimated appointment time (hours and minutes only)
                        const totalMinutes = fromH * 60 + fromM + (avgTimeMinutes * position);
                        const estHours = Math.floor(totalMinutes / 60) % 24;
                        const estMinutes = Math.floor(totalMinutes % 60);
                        appt.estimatedTime = `${String(estHours).padStart(2, '0')}:${String(estMinutes).padStart(2, '0')}`;
                        // alert(`Est Time: ${estTimeStr}`);

                        // alert(`Position: ${appt.position}\n`+`Patient: ${appt.patientName}\nEst Time: ${appt.estimatedTime}`);

                        const delay = timeToMinutes(appt.estimatedTime) - timeToMinutes(appt.bookingTime);

                        if (delay > PRIORITY_THRESHOLD_HOURS) {

                            await updateDoc(doc(queueRef, appt.patientName), {
                                severityValue: appt.severity + 1
                            });
                            // alert(`Severity boosted: ${appt.patientName}`);


                            // alert(`✅ Queue processed for ${today}\n` +
                            // `⚠️ Priority Boost for ${appt.patientName}!\n` +
                            // `Delay: ${delay.toFixed(1)} hours\n` +
                            // `Severity: ${appt.severity}`);

                        }
                    }
                return {
                    fromTime: timeSource.fromTime || (isVirtual ? "09:00" : "10:30"),
                    toTime: timeSource.toTime || "17:00"
                };

            }catch (error) {
                console.error('Queue processing error:', error);
                alert('⚠️ Failed to process queue. See console for details.');
            }
        

            // Probably should be in a function

            // window.location.href = "/patient_profile";
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("Failed to book appointment. Try again.");
        }
    });
});
export function toggleDoctorInput() {
    const manualDoctorInput = document.getElementById("manualDoctor");
    const doctorSelectValue = document.querySelector('input[name="doctorSelect"]:checked')?.value;
    manualDoctorInput.style.display = doctorSelectValue === "manual" ? "block" : "none";
}



                    