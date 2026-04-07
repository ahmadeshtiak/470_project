import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EditProfile.css';

export default function EditProfile() {
  const { user, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    about: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        about: user.about || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name cannot be empty';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number cannot be empty';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address cannot be empty';
    }
    if (!formData.about.trim()) {
      newErrors.about = 'About cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      setSubmitError('Please fill in all fields correctly');
      return;
    }

    try {
      await updateProfile(formData.name, formData.email, formData.phone, formData.address, formData.about);
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h2 className="edit-profile-title">Edit my profile</h2>
      </div>

      <div className="edit-profile-card">
        <form onSubmit={handleSubmit}>
          <div className="edit-profile-grid">
            <div className="edit-field">
              <label className="edit-label">
                <span className="edit-icon">👤</span>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`edit-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="edit-field">
              <label className="edit-label">
                <span className="edit-icon">✉️</span>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`edit-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="edit-field">
              <label className="edit-label">
                <span className="edit-icon">📱</span>
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`edit-input ${errors.phone ? 'error' : ''}`}
                placeholder="Enter your mobile number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="edit-field edit-field-full">
              <label className="edit-label">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`edit-input ${errors.address ? 'error' : ''}`}
                placeholder="Enter your address"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="edit-field edit-field-full">
              <label className="edit-label">
                About
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                className={`edit-input edit-textarea ${errors.about ? 'error' : ''}`}
                placeholder="Tell us about yourself"
                rows="4"
              />
              {errors.about && <span className="error-message">{errors.about}</span>}
            </div>
          </div>

          {submitError && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {submitError}
            </div>
          )}

          <div className="edit-profile-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


