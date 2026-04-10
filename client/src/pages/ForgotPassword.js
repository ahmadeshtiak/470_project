import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { requestPasswordReset, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await requestPasswordReset(formData.email);
      setSuccessMessage('OTP sent to your email. Please check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPassword(formData.email, formData.otp, formData.password, formData.confirmPassword);
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    try {
      await requestPasswordReset(formData.email);
      setSuccessMessage('OTP resent successfully. Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="form-container">
      {step === 1 ? (
        <>
          <h2 className="card-title">Forgot Password</h2>
          <p className="card-subtitle">Recover your AutoForge account</p>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleRequestReset}>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Reset Code'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Remembered your password? <Link to="/login" style={{ color: 'var(--brand-maroon)', textDecoration: 'none' }}>Login</Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="card-title">Reset Password</h2>
          <p className="card-subtitle">Enter code and choose a new password</p>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <input
                type="text"
                maxLength="6"
                name="otp"
                className="form-input"
                value={formData.otp}
                onChange={(e) => setFormData((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                placeholder="000000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
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
              <label className="form-label">Confirm New Password</label>
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
              {loading ? <span className="spinner"></span> : 'Reset Password'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResendOtp}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            Resend OTP
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--brand-maroon)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to email entry
            </button>
          </p>
        </>
      )}
    </div>
  );
}
