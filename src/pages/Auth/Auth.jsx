import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { studentLogin, studentRegister } from '../../services/api';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const response = await studentLogin({ 
          email: formData.email, 
          password: formData.password,
          role: formData.role 
        });

        if (response.data && response.data.success) {
          const rawUser = response.data.user;
          
          // 🟢 Standardizing keys: Using firstName/lastName consistently for the Dashboards
          const userToSave = {
            id: rawUser.id,
            firstName: rawUser.first_name || rawUser.firstName,
            lastName: rawUser.last_name || rawUser.lastName,
            email: rawUser.email,
            role: rawUser.role || formData.role
          };

          localStorage.setItem('user', JSON.stringify(userToSave));
          alert(response.data.message); 
          
          if (userToSave.role === 'Admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/student-dashboard');
          }
        } else {
          alert(response.data.message || "Login failed");
        }

      } else {
        // --- REGISTRATION LOGIC ---
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        // 🟢 FIX: Map frontend camelCase to backend snake_case
        const registrationData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          password: formData.password,
          role: formData.role
        };

        const response = await studentRegister(registrationData);
        
        if (response.data && response.data.success) {
          alert(response.data.message || "Registration successful!");
          setIsLogin(true); 
        } else {
          // If this fails, check if the email already exists in your DB
          alert(response.data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert(error.response?.data?.message || "Cannot connect to server. Check XAMPP!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">LostFound AI</h1>
        <p className="auth-subtitle">Campus Lost & Found System</p>

        <div className="toggle-container">
          <button 
            type="button"
            className={`toggle-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            type="button"
            className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="input-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="student@school.edu" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Who's Using</label>
                <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="input-row">
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="student@school.edu" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="auth-select" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Register As</label>
                <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : `Register as ${formData.role}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;