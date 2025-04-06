
const firebaseConfig = {
    apiKey: "AIzaSyC0ncA7or5DGpfMj3bxYpz7pAmNDhJy9aM",
    authDomain: "bookmydoc-7b3d1.firebaseapp.com",
    projectId: "bookmydoc-7b3d1",
    storageBucket: "bookmydoc-7b3d1.firebasestorage.app",
    messagingSenderId: "182899610658",
    appId: "1:182899610658:web:105b642d77c7a4b1fb267b",
    measurementId: "G-NBX1LDNMV3",
};

firebase.initializeApp(firebaseConfig);

// Firestore reference
const db = firebase.firestore();

// Function to find the nearest doctor
function findNearestDoctor() {
    const address = document.getElementById("addressInput").value;
    if (!address) {
        alert("Please enter your address!");
        return;
    }
    const API_KEY = "pk.f7f677b1db436ae4fa4c9cf3e985586c";
    // Convert address to latitude & longitude using LocationIQ API
    fetch(`https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(address)}&format=json`)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            console.log("Latitude:", lat, "Longitude:", lon);
            fetchDoctors(lat, lon);
        } else {
            alert("Address not found!");
        }
    })
    .catch(error => console.error("Error fetching location:", error));
}

// Function to fetch predicted doctor
async function fetchPredictedDoctor() {
    try {
        const response = await fetch('/getPredictedDoctor');
        const data = await response.json();
        
        if (response.ok) {
            return data.predictedDoctor;
        } else {
            console.error('Error fetching predicted doctor:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Network error:', error);
        return null;
    }
}

// Fetch doctors from Firestore
async function fetchDoctors(userLat, userLng) {
    try {
        // First fetch the predicted doctor specialization
        const response = await fetch('/getPredictedDoctor');
        const data = await response.json();
        
        if (!response.ok || data.predictedDoctor === "Not Calculated Yet") {
            console.error('No predicted doctor available');
            return;
        }

        const predictedSpecialization = data.predictedDoctor;
        const lowerpredicted = predictedSpecialization.toLowerCase();
        console.log(lowerpredicted);
        
        // Now fetch doctors filtered by this specialization
        db.collection("DoctorsBySpecialization")
          .doc(lowerpredicted) // Filter by predicted specialization
          .collection("Doctors")
          .get()
          .then(async (querySnapshot) => {
            let doctorList = [];

            for (const doc of querySnapshot.docs) {
                const doctor = doc.data();
                if (doctor.location && doctor.location.latitude && doctor.location.longitude) {
                    const distance = getDistance(userLat, userLng, 
                        doctor.location.latitude, doctor.location.longitude);
                    
                    // Convert doctor's latitude & longitude to address
                    const doctorAddress = await getDoctorAddress(doctor.location.latitude, doctor.location.longitude);
                    
                    doctorList.push({ 
                        ...doctor, 
                        distance,
                        address: doctorAddress,
                        id: doc.id // Include document ID for reference
                    });
                }
            }

            // Sort doctors by distance
            doctorList.sort((a, b) => a.distance - b.distance);

            // Get top 5 nearest doctors in this specialization
            const topDoctors = doctorList.slice(0, 5);
            displayDoctors(topDoctors, predictedSpecialization);
        })
        .catch(error => console.error("Error fetching doctors:", error));
    } catch (error) {
        console.error('Error fetching predicted doctor:', error);
    }
}

// Function to get doctor's address using reverse geocoding
async function getDoctorAddress(lat, lon) {
    const API_KEY = "pk.f7f677b1db436ae4fa4c9cf3e985586c";
    try {
        const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        return data.display_name || "Address not available";
    } catch (error) {
        console.error("Error fetching doctor's address:", error);
        return "Address not available";
    }
}

// Haversine Formula to Calculate Distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Function to display doctors
function displayDoctors(topDoctors) {
    const doctorContainer = document.getElementById("doctorList"); 
    doctorContainer.innerHTML = ""; 

    if (topDoctors.length === 0) {
        doctorContainer.innerHTML = "<p class='text-danger text-center'>No doctors found nearby.</p>";
        return;
    }

    topDoctors.forEach((doc, index) => {
        const doctorCard = document.createElement("div");
        doctorCard.classList.add("card", "mb-3", "shadow-sm");

        doctorCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title"><strong>${index + 1}. ${doc.fullName || "Unknown Doctor"}</strong></h5>
                <p class="card-text">
                    <strong>Specialization:</strong> ${doc.specialization || "Not Available"} <br>
                    <strong>Distance:</strong> ${doc.distance.toFixed(2)} km <br>
                    <strong>Contact:</strong> ${doc.phoneNumber || "Not Available"} <br>
                  
                    <strong>Address:</strong> ${doc.address || "Not Available"}
                </p>
                <button class="btn btn-success w-100" onclick="bookAppointment('${doc.fullName}', '${doc.specialization}')">
                    Book Appointment
                </button>
            </div>
        `;

        doctorContainer.appendChild(doctorCard);
    });
}


window.bookAppointment = (doctorName, specialization) => {
    sessionStorage.setItem("scrollToAppointment", "true");
    sessionStorage.setItem("selectedDoctor", doctorName);
    sessionStorage.setItem("selectedSpecialization", specialization);  

    window.location.href = '/Bookappointment';

    

};