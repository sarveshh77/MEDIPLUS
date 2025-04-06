// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Your Firebase configuration
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

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // Registration Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const country = document.getElementById('country').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      

      
      // Validate password match
      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Passwords do not match!'
        });
        return;
      }
      
      try {
        // Check if user already exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          Swal.fire({
            icon: 'warning',
            title: 'Account Exists',
            text: 'An account with this email already exists. Please login instead.'
          });
          return;
        }
        
        // Create sanitized username for document ID (convert to lowercase, remove spaces)
        const docId = name;
        
        // Add user to Firestore with custom ID
        await setDoc(doc(db, "users", docId), {
          name,
          email,
          phone,
          country,
          password,
          registeredOn: new Date().toISOString(),
          appointments: []
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Registration successful!',
          confirmButtonText: 'Login Now'
        }).then((result) => {
          if (result.isConfirmed) {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            registerForm.reset();
          }
        });
      } catch (error) {
        console.error("Error adding user: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An error occurred during registration. Please try again.'
        });
      }
    });
  }
  
  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        // Query Firestore for user
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'User not found. Please check your email or register for an account.'
          });
          return;
        }
        
        // Check password
        let userFound = false;
        let userData = null;
        
        querySnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.password === password) {
            userFound = true;
            userData = {
              docId: doc.id,
              ...user
            };
          }
        });
        
        if (userFound) {
          // Store user info in session storage
          sessionStorage.setItem('currentUser', JSON.stringify(userData));
          sessionStorage.setItem("userEmail", email);
          sessionStorage.setItem("userName", userData.name);
          
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Welcome back, ' + userData.name + '!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            // Redirect to patient profile page
            window.location.href = '/patient_profile';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Incorrect password. Please try again.'
          });
        }
      } catch (error) {
        console.error("Error during login: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'An error occurred during login. Please try again.'
        });
      }
    });
  }
});