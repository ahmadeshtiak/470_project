import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  updateUserRole,
  promoteToAdmin,
  disableUser,
  enableUser,
  deleteUser,
} from "../api/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers();
      if (res && res.data) setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChangeRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      await load();
    } catch (err) {
      alert(err.message || "Error changing role");
    }
  };

  const handlePromoteAdmin = async (userId) => {
    try {
      await promoteToAdmin(userId);
      await load();
    } catch (err) {
      alert(err.message || "Error promoting to admin");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.isActive) await disableUser(user._id);
      else await enableUser(user._id);
      await load();
    } catch (err) {
      alert(err.message || "Error toggling active state");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(userId);
      await load();
    } catch (err) {
      alert(err.message || "Error deleting user");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Manage Users</h2>
      {loading && <div>Loading users…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Yes" : "No"}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleChangeRole(u._id, e.target.value)}
                >
                  <option value="buyer">buyer</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
                <button onClick={() => handlePromoteAdmin(u._id)} style={{ marginLeft: 8 }}>Promote to Admin</button>
                <button onClick={() => handleToggleActive(u)} style={{ marginLeft: 8 }}>{u.isActive ? 'Disable' : 'Enable'}</button>
                <button onClick={() => handleDelete(u._id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
