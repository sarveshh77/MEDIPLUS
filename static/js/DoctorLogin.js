// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0ncA7or5DGpfMj3bxYpz7pAmNDhJy9aM",
    authDomain: "bookmydoc-7b3d1.firebaseapp.com",
    projectId: "bookmydoc-7b3d1",
    storageBucket: "bookmydoc-7b3d1.appspot.com",
    messagingSenderId: "182899610658",
    appId: "1:182899610658:web:105b642d77c7a4b1fb267b",
    measurementId: "G-NBX1LDNMV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ✅ Handle Doctor Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("doctorEmail").value.trim().toLowerCase(); // Normalize email
    const uniqueKey = document.getElementById("doctorKey").value.trim(); // Trim spaces
    const specialization = document.getElementById("specialization").value; // Get specialization

    let doctorFound = false; // Flag for finding an email match
    let loginSuccess = false; // Flag for successful login

    try {
        // Search only within the specified specialization
        const querySnapshot = await getDocs(collection(db, `DoctorsBySpecialization/${specialization}/Doctors`));

        querySnapshot.forEach((doc) => { 
            const doctor = doc.data();

            if (doctor.email.toLowerCase() === email) { // Normalize stored email
                doctorFound = true; // Mark email as found

                if (doctor.uniqueKey === uniqueKey) {
                    loginSuccess = true; // Successful login
                
                    // Store the doctor's unique key and specialization in localStorage
                    localStorage.setItem("doctorUniqueKey", uniqueKey); // Store the unique key
                    localStorage.setItem("doctorSpecialization", specialization); // Store the specialization
                    console.log("Stored doctorUniqueKey in localStorage:", uniqueKey); // Debugging line
                    console.log("Stored doctorSpecialization in localStorage:", specialization); // Debugging line
                
                    Swal.fire({
                        icon: "success",
                        title: `Welcome, Dr. ${doctor.fullName}!`,
                        text: "Login successful. Redirecting to your profile...",
                        confirmButtonColor: "#3085d6",
                    }).then(() => {
                        // Use the URL passed from Flask
                        window.location.href = doctorProfileUrl;
                    });

                    return; // ✅ Exit function after successful login
                }
            }
        });

        // ❌ If email exists but uniqueKey is wrong, show incorrect key message
        if (doctorFound && !loginSuccess) {
            Swal.fire({
                icon: "error",
                title: "Login Failed!",
                text: "Incorrect Unique Key. Please try again.",
                confirmButtonColor: "#d33"
            });
            return; // ❌ Stop further execution
        }

        // ❌ If no doctor with the email was found at all, show not registered message
        if (!doctorFound) {
            Swal.fire({
                icon: "error",
                title: "Doctor Not Registered!",
                text: "No account found with this email and specialization. Please register first.",
                confirmButtonColor: "#d33"
            });
            return; // ❌ Stop further execution
        }

    } catch (error) {
        console.error("Error during login:", error);
        Swal.fire({
            icon: "error",
            title: "Login Error!",
            text: "Something went wrong. Please try again later.",
            confirmButtonColor: "#d33"
        });
    }
});