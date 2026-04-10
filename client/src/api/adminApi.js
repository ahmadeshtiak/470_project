import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const fetchUsers = async () => {
  const res = await axios.get(`${API_BASE}/admin/users`);
  return res.data;
};

export const updateUserRole = async (userId, newRole) => {
  const res = await axios.put(`${API_BASE}/admin/users/${userId}/role`, { newRole });
  return res.data;
};

export const promoteToAdmin = async (userId) => {
  const res = await axios.put(`${API_BASE}/admin/users/${userId}/promote-to-admin`);
  return res.data;
};

export const disableUser = async (userId) => {
  const res = await axios.put(`${API_BASE}/admin/users/${userId}/disable`);
  return res.data;
};

export const enableUser = async (userId) => {
  const res = await axios.put(`${API_BASE}/admin/users/${userId}/enable`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await axios.delete(`${API_BASE}/admin/users/${userId}`);
  return res.data;
};
