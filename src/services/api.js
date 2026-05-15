import axios from 'axios';

/**
 * API SERVICE CONFIGURATION
 * This bridge connects your React Frontend to your PHP Backend.
 */
const API = axios.create({
  // Ensure this folder name matches your XAMPP htdocs folder exactly
  baseURL: 'http://localhost/lostfound_backend/', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- AUTHENTICATION SERVICES ---

/**
 * Handles Registration
 * Sends all registration data including firstName, lastName, email, gender, and password.
 */
export const studentRegister = (data) => API.post('register.php', data);

/**
 * Handles Login for both Admin and Student
 * This sends the email, password, and role to login.php.
 * By using a single endpoint, we ensure consistent role verification.
 */
export const studentLogin = (data) => API.post('login.php', data);

/**
 * Admin Login also uses login.php
 * This is kept for backward compatibility with your Auth.jsx logic.
 */
export const adminLogin = (data) => API.post('login.php', data);

export default API;