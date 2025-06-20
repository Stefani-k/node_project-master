// src/components/AuthPage/AuthPage.jsx

import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import styles from '../Forms/Form.module.css';

function AuthPage({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Validation function
  const validateInput = () => {
    setError('');

    // Email validation 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password validation (3-8 characters, alphanumeric with at least one letter and one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be 3-8 characters long and contain at least one letter and one number.");
      return false;
    }

    // Registration mode specific validation
    if (!isLoginMode) {
      // First name validation (minimum 2 letters only)
      if (formData.firstName.length < 2 || !/^[A-Za-z]+$/.test(formData.firstName)) {
        setError("First name must contain only letters and have a minimum length of 2.");
        return false;
      }

      // Last name validation (minimum 2 letters only)
      if (formData.lastName.length < 2 || !/^[A-Za-z]+$/.test(formData.lastName)) {
        setError("Last name must contain only letters and have a minimum length of 2.");
        return false;
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickFill = () => {
    setFormData(prev => ({
      ...prev,
      email: 'admin@gmail.com',
      password: 'admin1'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLoginMode) {
        // Login
        const response = await axiosInstance.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        const responseData = response.data;
        localStorage.setItem('authToken', responseData.token);
        localStorage.setItem('userInfo', JSON.stringify(responseData.user));
        onLoginSuccess(responseData.user);
      } else {
        // Registration
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "customer",
        };

        await axiosInstance.post('/auth/register', userData);
        setSuccess('Registration successful! Please login.');
        setIsLoginMode(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Auth process failed:', err);
      let errorMessage = isLoginMode
        ? 'Login failed. Please check your credentials and try again.'
        : 'Registration failed. Please try again.';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h1 className={styles.title}>
        {isLoginMode ? 'ברוכים הבאים' : 'הרשמה'}
      </h1>
      <p className={styles.subtitle}>
        {isLoginMode
          ? 'הזן את האימייל והסיסמה שלך להתחברות'
          : 'מלא את הפרטים ליצירת חשבון חדש'
        }
      </p>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}

      <div className={styles.inputGrid}>
        {!isLoginMode && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="שם פרטי"
              className={styles.inputField}
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="lastName"
              placeholder="שם משפחה"
              className={styles.inputField}
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="tel"
              name="phone"
              placeholder="מספר טלפון"
              className={styles.inputField}
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="אימייל"
          className={styles.inputField}
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          autoComplete="email"
        />

        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          className={styles.inputField}
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          autoComplete={isLoginMode ? "current-password" : "new-password"}
        />

        {!isLoginMode && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="אימות סיסמה"
            className={styles.inputField}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        )}
      </div>

      {isLoginMode && (
        <div className={styles.quickLoginContainer}>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={handleQuickFill}
            disabled={isLoading}
          >
            Admin
          </button>
        </div>
      )}

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading
          ? (isLoginMode ? 'מתחבר...' : 'רושם...')
          : (isLoginMode ? 'התחבר' : 'הרשם')
        }
      </button>

      <button
        type="button"
        className={styles.switchLink}
        onClick={() => setIsLoginMode(prevMode => !prevMode)}
        disabled={isLoading}
      >
        {isLoginMode ? "אין לך חשבון? הרשם כאן" : "יש לך כבר חשבון? התחבר כאן"}
      </button>
    </form>
  );
}

export default AuthPage;