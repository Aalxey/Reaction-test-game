import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function Signin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Handle signup logic here
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name, // Mapping 'name' field to 'username' expected by backend
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user info (simulated session)
        localStorage.setItem('user', JSON.stringify({ username: data.username, token: data.token }));

        console.log('Signup successful:', data);
        navigate('/dashboard');
      } else {
        console.error('Signup failed:', data);
        alert('Signup failed. See console for details.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Network error. Is the backend running?');
    }
  }

  return (
    <div className="login-container">
      {/* Decorative background dots */}
      <div className="bg-dot bg-dot-1"></div>
      <div className="bg-dot bg-dot-2"></div>
      <div className="bg-dot bg-dot-3"></div>
      <div className="bg-dot bg-dot-4"></div>
      <div className="bg-dot bg-dot-5"></div>

      <div className="login-wrapper">
        <div className="login-header">
          <h1>Create Account</h1>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8Z" fill="#6B7280" />
                    <path d="M0 14C0 10.134 3.13401 7 7 7C10.866 7 14 10.134 14 14V16H0V14Z" fill="#6B7280" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 2C0 0.895431 0.895431 0 2 0H12C13.1046 0 14 0.895431 14 2V14C14 15.1046 13.1046 16 12 16H2C0.895431 16 0 15.1046 0 14V2Z" fill="#6B7280" />
                    <path d="M1 3L7 8L13 3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0C5.34315 0 4 1.34315 4 3V7C4 8.65685 5.34315 10 7 10C8.65685 10 10 8.65685 10 7V3C10 1.34315 8.65685 0 7 0ZM8.5 7C8.5 7.82843 7.82843 8.5 7 8.5C6.17157 8.5 5.5 7.82843 5.5 7V3C5.5 2.17157 6.17157 1.5 7 1.5C7.82843 1.5 8.5 2.17157 8.5 3V7Z" fill="#6B7280" />
                    <path d="M2 12V14H12V12H2Z" fill="#6B7280" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 0C5 0 1.73 3.11 0 7.5C1.73 11.89 5 15 9 15C13 15 16.27 11.89 18 7.5C16.27 3.11 13 0 9 0ZM9 12.5C6.52 12.5 4.5 10.48 4.5 8C4.5 5.52 6.52 3.5 9 3.5C11.48 3.5 13.5 5.52 13.5 8C13.5 10.48 11.48 12.5 9 12.5ZM9 5C7.62 5 6.5 6.12 6.5 7.5C6.5 8.88 7.62 10 9 10C10.38 10 11.5 8.88 11.5 7.5C11.5 6.12 10.38 5 9 5Z" fill="#6B7280" />
                      <path d="M1 1L17 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 0C5 0 1.73 3.11 0 7.5C1.73 11.89 5 15 9 15C13 15 16.27 11.89 18 7.5C16.27 3.11 13 0 9 0ZM9 12.5C6.52 12.5 4.5 10.48 4.5 8C4.5 5.52 6.52 3.5 9 3.5C11.48 3.5 13.5 5.52 13.5 8C13.5 10.48 11.48 12.5 9 12.5ZM9 5C7.62 5 6.5 6.12 6.5 7.5C6.5 8.88 7.62 10 9 10C10.38 10 11.5 8.88 11.5 7.5C11.5 6.12 10.38 5 9 5Z" fill="#6B7280" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0C5.34315 0 4 1.34315 4 3V7C4 8.65685 5.34315 10 7 10C8.65685 10 10 8.65685 10 7V3C10 1.34315 8.65685 0 7 0ZM8.5 7C8.5 7.82843 7.82843 8.5 7 8.5C6.17157 8.5 5.5 7.82843 5.5 7V3C5.5 2.17157 6.17157 1.5 7 1.5C7.82843 1.5 8.5 2.17157 8.5 3V7Z" fill="#6B7280" />
                    <path d="M2 12V14H12V12H2Z" fill="#6B7280" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 0C5 0 1.73 3.11 0 7.5C1.73 11.89 5 15 9 15C13 15 16.27 11.89 18 7.5C16.27 3.11 13 0 9 0ZM9 12.5C6.52 12.5 4.5 10.48 4.5 8C4.5 5.52 6.52 3.5 9 3.5C11.48 3.5 13.5 5.52 13.5 8C13.5 10.48 11.48 12.5 9 12.5ZM9 5C7.62 5 6.5 6.12 6.5 7.5C6.5 8.88 7.62 10 9 10C10.38 10 11.5 8.88 11.5 7.5C11.5 6.12 10.38 5 9 5Z" fill="#6B7280" />
                      <path d="M1 1L17 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 0C5 0 1.73 3.11 0 7.5C1.73 11.89 5 15 9 15C13 15 16.27 11.89 18 7.5C16.27 3.11 13 0 9 0ZM9 12.5C6.52 12.5 4.5 10.48 4.5 8C4.5 5.52 6.52 3.5 9 3.5C11.48 3.5 13.5 5.52 13.5 8C13.5 10.48 11.48 12.5 9 12.5ZM9 5C7.62 5 6.5 6.12 6.5 7.5C6.5 8.88 7.62 10 9 10C10.38 10 11.5 8.88 11.5 7.5C11.5 6.12 10.38 5 9 5Z" fill="#6B7280" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the Terms and Conditions</span>
              </label>
            </div>

            {errors.form && <div className="error-message" style={{ textAlign: 'center', marginBottom: '16px' }}>{errors.form}</div>}

            <button type="submit" className="login-button">Sign Up</button>
          </form>

          <div className="login-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="register-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin

