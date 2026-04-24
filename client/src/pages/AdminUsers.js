import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const updateRole = async (id, role) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update role');
      setUsers((prev) => prev.map(u => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  const toggleBan = async (id, currentBanStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBanned: !currentBanStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update ban status');
      setUsers((prev) => prev.map(u => (u.id === id ? { ...u, isBanned: !currentBanStatus } : u)));
    } catch (err) {
      alert('Error updating ban status: ' + err.message);
    }
  };

  if (!token) return <div>Please login as admin to view this page.</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Admin: Manage Users</h2>
      {loading && <div>Loading users...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Ban Status</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{u.name}</td>
              <td style={{ padding: '8px' }}>{u.email}</td>
              <td style={{ padding: '8px' }}>
                <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                  <option value="buyer">buyer</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td style={{ padding: '8px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  backgroundColor: u.isBanned ? '#ffcccc' : '#ccffcc',
                  color: u.isBanned ? '#cc0000' : '#00cc00'
                }}>
                  {u.isBanned ? 'BANNED' : 'ACTIVE'}
                </span>
              </td>
              <td style={{ padding: '8px' }}>
                <button 
                  onClick={() => toggleBan(u.id, u.isBanned)} 
                  className="btn btn-secondary"
                  style={{ 
                    backgroundColor: u.isBanned ? '#4CAF50' : '#f44336',
                    color: 'white',
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {u.isBanned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
