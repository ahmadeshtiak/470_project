import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Title outside the inner block */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Your personal Information</h2>
        <div className="flex gap-3">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/my-designs')}
          >
            My Design
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/latest-listings')}
          >
            Check Latest Listings
          </button>
        </div>
      </div>

      {/* Inner main block with lighter background */}
      <div className="dashboard-card">
        {/* User Identity Section */}
        <div className="user-identity-section">
          <div className="user-avatar-section">
            <div className="user-avatar">
              {getInitials(user?.name)}
            </div>
            <h3 className="user-name">{user?.name || 'User'}</h3>
          </div>
          <button 
            className="btn btn-secondary edit-profile-btn"
            onClick={() => navigate('/edit-profile')}
          >
            Edit my profile
          </button>
        </div>

        {/* Information Fields */}
        <div className="user-info-grid">
          <div className="info-field">
            <label className="info-label">
              <span className="info-icon">✉️</span>
              Email
            </label>
            <div className="info-value">{user?.email || 'N/A'}</div>
          </div>

          <div className="info-field">
            <label className="info-label">
              <span className="info-icon">📱</span>
              Mobile Number
            </label>
            <div className="info-value">{user?.phone || 'N/A'}</div>
          </div>

          <div className="info-field info-field-full">
            <label className="info-label">
              Address
            </label>
            <div className="info-value">{user?.address || 'N/A'}</div>
          </div>

          <div className="info-field info-field-full">
            <label className="info-label">
              About
            </label>
            <div className="info-value">{user?.about || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
