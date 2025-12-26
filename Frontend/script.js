/**
 * script.js - Login logic for authentication
 * For Viva: This file handles user validation. It prevents unauthorized access 
 * by checking credentials against predefined demo values.
 */

const loginForm = document.getElementById('loginForm');
const errorDisplay = document.getElementById('errorMessage');

loginForm.addEventListener('submit', function(event) {
    // Prevent the page from refreshing on form submission
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Reset error message
    errorDisplay.textContent = "";

    // Required Logic: Check credentials based on role
    if (role === "user") {
        if (email === "user@mail.com" && password === "user") {
            // Redirect Patient
            window.location.href = "user_dashboard.html";
        } else {
            errorDisplay.textContent = "Invalid Patient credentials.";
        }
    } else if (role === "admin") {
        if (email === "admin@mail.com" && password === "admin") {
            // Redirect Admin
            window.location.href = "admin_dashboard.html";
        } else {
            errorDisplay.textContent = "Invalid Admin credentials.";
        }
    }
});