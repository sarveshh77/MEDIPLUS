import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Initialize EmailJS
emailjs.init("vv72ulfdaUwhiLbIb");


function requestLocationPermission() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location access granted.");
        // You can optionally store the latitude and longitude for later use
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("Latitude:", latitude, "Longitude:", longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        Swal.fire({
          icon: 'error',
          title: 'Location Access Denied',
          text: 'Please enable location services to proceed with registration.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      },
      {
        enableHighAccuracy: true, // Request high accuracy
        timeout: 5000, // Timeout after 5 seconds
        maximumAge: 0, // Do not use a cached position
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}
window.addEventListener('load', () => {
  requestLocationPermission();
});

// Function to send email
function sendEmail(templateParams) {
  emailjs.send("service_cptpn7b", "template_g70eyfc", templateParams)
    .then((response) => {
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'A confirmation email has been sent to your inbox.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      console.log("Email sent:", response);
    })
    .catch((error) => {
      Swal.fire({
        icon: 'warning',
        title: 'Email Sending Failed!',
        text: 'Your registration was successful, but we couldn\'t send the email. Please check your spam folder or try again later.',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#d33'
      });
      console.error("Email error:", error);
    });
}

// Handle form submission
document.getElementById("doctorForm").addEventListener("submit", async (e) => {
  e.preventDefault();


  const submitBtn = document.querySelector('#doctorForm input[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.value = "Validating...";


  // Collect form data
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const specialization = document.getElementById("specialization").value;
  const qualification = document.getElementById("qualification").value;
  const issuingAuthority = document.getElementById("issuingAuthority").value;
  const licenseNumber = document.getElementById("licenseNumber").value;
  const languages = Array.from(document.getElementById("languages").selectedOptions).map(option => option.value);
  const clinicName = document.getElementById("clinicName").value;
  const steetaddress = document.getElementById("steetaddress").value;
  const city = document.getElementById("city").value;
  const zip = document.getElementById("zip").value;
  const country = document.getElementById("country").value;

  // Get appointment types
  const virtualAppointments = document.getElementById("virtualAppointments").checked;
  const inPersonAppointments = document.getElementById("inPersonAppointments").checked;

  // Virtual appointment details
  let virtualAppointmentData = null;
  if (virtualAppointments) {
    const meetlink = document.getElementById("meetlink").value;
    const virtualPatientsPerDay = document.getElementById("virtualPatientsPerDay").value;
    const virtualDays = Array.from(document.querySelectorAll("input[name='virtualDays']:checked")).map(input => input.value);
    const virtualAvailabilityFromTime = document.getElementById("virtualAvailabilityFromTime").value;
    const virtualAvailabilityToTime = document.getElementById("virtualAvailabilityToTime").value;

    virtualAppointmentData = {
      meetlink,
      patientsPerDay: virtualPatientsPerDay,
      days: virtualDays,
      fromTime: virtualAvailabilityFromTime,
      toTime: virtualAvailabilityToTime
    };
  }

  // In-person appointment details
  let inPersonAppointmentData = null;
  if (inPersonAppointments) {
    const inPersonPatientsPerDay = document.getElementById("inPersonPatientsPerDay").value;
    const inPersonDays = Array.from(document.querySelectorAll("input[name='inPersonDays']:checked")).map(input => input.value);
    const inPersonAvailabilityFromTime = document.getElementById("inPersonAvailabilityFromTime").value;
    const inPersonAvailabilityToTime = document.getElementById("inPersonAvailabilityToTime").value;

    inPersonAppointmentData = {
      patientsPerDay: inPersonPatientsPerDay,
      days: inPersonDays,
      fromTime: inPersonAvailabilityFromTime,
      toTime: inPersonAvailabilityToTime
    };
  }

  // Validate terms and appointment types
  const termsCheckbox = document.getElementById("terms");
  if (!termsCheckbox.checked) {
    alert("You must agree to the terms and conditions before registering.");
    return;
  }

  if (!virtualAppointments && !inPersonAppointments) {
    alert("Please select at least one appointment type.");
    return;
  }

  // Step 1: NMC Validation
  try {
    const validationResponse = await fetch('/validate_doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: fullName,
        licenseNumber: licenseNumber,
      }),
    });

    const validationData = await validationResponse.json();

    if (validationResponse.status == 500 || !validationData.valid) {
      const errorMsg = 'Doctor validation failed. Please check the name and license number.';
      throw new Error(errorMsg);
    }
    //else
    alert('Doctor validated successfully!');


  } catch (error) {
    console.error('Error during NMC validation:', error);
    Swal.fire({
      icon: 'error',
      title: 'Validation Failed',
      text: error.message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    });
    return;
  }

  // Step 2: Generate a unique login key
  function generateUniqueKey(length = 10) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let uniqueKey = "";
    for (let i = 0; i < length; i++) {
      uniqueKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return uniqueKey;
  }

  let uniqueKey = generateUniqueKey();

  // Step 3: Capture geolocation and store data in Firebase
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const uniqueId = fullName;

        const doctorData = {
          fullName,
          email,
          phoneNumber,
          specialization,
          qualification,
          issuingAuthority,
          licenseNumber,
          languages,
          clinicName,
          steetaddress,
          city,
          zip,
          country,
          uniqueKey,
          appointmentTypes: {
            virtual: virtualAppointments,
            inPerson: inPersonAppointments
          },
          virtualAppointments: virtualAppointmentData,
          inPersonAppointments: inPersonAppointmentData,
          location: {
            latitude,
            longitude,
          },
          registrationDate: new Date().toISOString()
        };

        // Debugging: Log the doctor data and document path
        console.log("Doctor Data:", doctorData);
        console.log("Document Path:", `DoctorsBySpecialization/${specialization}/Doctors/${uniqueId}`);

        try {
          const specializationDocRef = doc(db, `DoctorsBySpecialization/${specialization}/Doctors`, uniqueId);
          await setDoc(specializationDocRef, doctorData);
          console.log("Doctor data stored successfully!");

          // Send registration email
          let registrationEmailParams = {
            to_mail: email, // Recipient Email
            subject: "🎉 Welcome to MediPlus – Your Secure Login Key 🔑",
            message: `
              Hello ${fullName},

              Congratulations! 🎉 You have successfully registered on MediPlus.

              🔑 Your Unique Login Key: ${uniqueKey}

              Please keep this key secure. It is required for login and authentication.

            `,
            from_name: "MediPlus",
            reply_to: email,
          };

          sendEmail(registrationEmailParams);
          
          document.getElementById("doctorForm").reset();
          // Hide the appointment sections after successful registration
          document.getElementById("virtualAppointmentsSection").style.display = "none";
          document.getElementById("inPersonAppointmentsSection").style.display = "none";
        } catch (error) {
          console.error("Error storing doctor data:", error);
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed!',
            text: 'Something went wrong. Please try again.',
            confirmButtonText: 'Retry',
            confirmButtonColor: '#d33'
          });
        }
      },
      (error) => {
        console.error("Error getting location: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Location Error!',
          text: 'Please enable location services and try again.',
          confirmButtonText: 'Retry',
          confirmButtonColor: '#d33'
        });
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});
