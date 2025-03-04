import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaSignOutAlt, FaTrash, FaUsers } from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "employee" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Users with Saved Progress
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("⚠️ No token found. Please log in.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5001/auth/users-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data);
      setLoading(false);
      setMessage(""); // ✅ Clear errors
    } catch (err) {
      console.error("❌ Fetch Users Error:", err.response?.data || err.message);
      setMessage("⚠️ Unauthorized. Please log in again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Add User
  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:5001/auth/register", newUser, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("✅ User added successfully!");
      setNewUser({ username: "", email: "", password: "", role: "employee" });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error adding user:", err.response?.data || err.message);
      setMessage("⚠️ Failed to create user.");
    }
  };

  // ✅ Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("⚠️ No token found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:5001/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((user) => user.id !== userId)); // ✅ Update list without reloading
      setMessage("✅ User deleted successfully.");
    } catch (err) {
      console.error("❌ Delete User Error:", err.response?.data || err.message);
      setMessage("⚠️ Failed to delete user.");
    }
  };

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Clear token
    window.location.href = "/login";  // ✅ Redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 flex flex-col items-center">
      {/* Dashboard Header */}
      <div className="w-full flex justify-between items-center mb-6 p-4 bg-blue-600 text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold flex items-center">
          <FaUsers className="mr-3" /> Admin Dashboard
        </h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center">
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      {/* Add User Section */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Add New User</h2>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleAddUser}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center mt-2"
        >
          <FaUserPlus className="mr-2" /> Add User
        </button>
        {message && <p className="text-center mt-2 text-gray-700 dark:text-gray-300">{message}</p>}
      </div>

      {/* User List Section */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-xl font-semibold mb-3">User List</h2>
        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                <th className="border p-2">Username</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Progress</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="text-center border-b border-gray-300 dark:border-gray-700">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.progress}%</td> {/* ✅ Shows actual saved progress */}
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
