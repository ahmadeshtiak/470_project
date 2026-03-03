import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none' }}>
          <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.5 13.5c0-1.6.9-2.5 2.4-2.9l2.6-.6c.3-.6.8-1.2 1.4-1.7 1-.8 2.2-1.3 3.5-1.3h3.1c1 0 1.8.7 2 1.6l1.3 4.9c.3 1-.5 2-1.6 2H19c-.4 1.4-1.7 2.5-3.2 2.5-1.6 0-2.9-1-3.3-2.5H9.5c-.4 1.4-1.7 2.5-3.2 2.5-1.8 0-3.3-1.5-3.3-3.5Zm3.2 2c.8 0 1.5-.7 1.5-1.5 0-.9-.7-1.5-1.5-1.5-.9 0-1.5.6-1.5 1.5 0 .8.6 1.5 1.5 1.5Zm9.1 0c.8 0 1.5-.7 1.5-1.5 0-.9-.7-1.5-1.5-1.5-.8 0-1.5.6-1.5 1.5 0 .8.7 1.5 1.5 1.5Zm-8-3h3.6c.5 0 .8-.3 1-.7l.2-.6c.3-1 .9-1.7 1.7-2.2.5-.3 1-.4 1.5-.4h2.8l-.3-1.2c-.1-.2-.3-.4-.6-.4h-3.1c-1.7 0-3.2 1-3.8 2.5-.1.2-.3.4-.6.5l-3 .7c-.7.1-1 .5-1 .8H5c-.6 0-1 .4-1 .9s.4.9 1 .9h.8Z" />
            </svg>
          </span>
          MotorWala, An Innovation with Cars
        </Link>
      </div>
      <ul className="navbar-links">
        {!token || !user ? (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/cars">Cars</Link>
            </li>
            <li>
              <Link to="/customization">Customization</Link>
            </li>
            <li>
              <Link to="/parts">Parts</Link>
            </li>
            <li>
              <Link to="/orders">Orders</Link>
            </li>
            <li>
              <Link to="/messages">💬 Messages</Link>
            </li>
            <li>
              <Link to="/transactions">💳 Transactions</Link>
            </li>
            <li>
              <Link
                to="/cart"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
              >
                🛒 Cart
                {getCartCount() > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </li>
            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/users">Admin Panel</Link>
                </li>
                <li>
                  <Link to="/admin/transactions">Admin Transactions</Link>
                </li>
              </>
            )}
            <li>
              <span style={{ color: 'var(--text-secondary)' }}>Hi, {user?.name}</span>
            </li>
            <li>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Logout
              </button>
            </li>
          </>
        )}
        <li className="contact-us-section">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Contact Us
            <span className="social-icons">
              <span className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12.073C22 6.505 17.523 2 12 2S2 6.505 2 12.073c0 5.022 3.657 9.19 8.438 9.93v-7.03H7.898v-2.9h2.54V9.845c0-2.506 1.492-3.89 3.778-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.776-1.63 1.571v1.888h2.773l-.443 2.9h-2.33v7.03C18.343 21.263 22 17.095 22 12.073Z" />
                </svg>
              </span>
              <span className="social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.497-4.945 13.986-13.986 13.986-2.784 0-5.375-.81-7.56-2.21.388.045.762.06 1.165.06 2.31 0 4.433-.78 6.124-2.1a4.92 4.92 0 0 1-4.6-3.417c.3.045.6.075.915.075.435 0 .87-.06 1.274-.165a4.914 4.914 0 0 1-3.94-4.827v-.06c.66.366 1.425.6 2.235.63a4.907 4.907 0 0 1-2.19-4.092c0-.9.24-1.71.66-2.43a13.95 13.95 0 0 0 10.125 5.145 5.538 5.538 0 0 1-.12-1.125 4.91 4.91 0 0 1 4.908-4.905c1.41 0 2.685.6 3.58 1.56a9.72 9.72 0 0 0 3.12-1.2 4.865 4.865 0 0 1-2.16 2.7 9.83 9.83 0 0 0 2.835-.765 10.85 10.85 0 0 1-2.46 2.55Z" />
                </svg>
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
