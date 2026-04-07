import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    about: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signup, loading, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Word limit validation for about field
    if (name === 'about') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length > 100) {
        return; // Don't update if exceeds 100 words
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const getWordCount = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.about || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate word count for about field
    const wordCount = getWordCount(formData.about);
    if (wordCount > 100) {
      setError('About section must not exceed 100 words');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.phone, formData.address, formData.about, formData.password, formData.confirmPassword);
      setSuccessMessage('OTP sent to your email. Please check your inbox.');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await verifyOTP(formData.email, otp);
      setSuccessMessage('Email verified successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');

    try {
      await resendOTP(formData.email);
      setSuccessMessage('OTP resent successfully. Check your email.');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="form-container">
      {step === 1 ? (
        <>
          <h2 className="card-title">Create Account</h2>
          <p className="card-subtitle">Join MotorWala today</p>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 01712345678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main St, Dhaka"
              />
            </div>

            <div className="form-group">
              <label className="form-label">About</label>
              <textarea
                name="about"
                className="form-input"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell us a little about yourself"
                rows="4"
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {getWordCount(formData.about)} / 100 words
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="spinner"></span>
                </div>
              ) : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--brand-maroon)', textDecoration: 'none' }}>Login</Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="card-title">Verify Email</h2>
          <p className="card-subtitle">Enter the OTP sent to {formData.email}</p>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleOtpVerify}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                maxLength="6"
                className="form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{ fontSize: '2rem', letterSpacing: '10px', textAlign: 'center' }}
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                OTP is valid for 10 minutes
              </small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="spinner"></span>
                </div>
              ) : 'Verify OTP'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Didn't receive the OTP?
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>

          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand-maroon)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to signup
            </button>
          </p>
        </>
      )}
    </div>
  );
}
