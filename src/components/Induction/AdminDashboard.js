import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaSignOutAlt, FaTrash, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import QuizSubmissions from "./QuizSubmissions";
import QuizEditor from "./QuizEditor";
import ManualHandlingSubmissions from "./ManualHandlingSubmissions";
import ManualHandlingQuizEditor from "./ManualHandlingQuizEditor";
import '../../styles/adminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5001/auth/users-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("❌ Fetch Users Error:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:5001/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Error loading documents:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDocuments();
  }, []);

  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:5001/auth/register", newUser);
      setMessage("✅ User added successfully!");
      setNewUser({ username: "", email: "", password: "", role: "employee" });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error adding user:", err);
      setMessage("⚠️ Failed to create user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("❌ Delete User Error:", err);
      alert("❌ Failed to delete user. Please try again.");
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("❌ Delete Document Error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  let currentAdminEmail = null;
const token = localStorage.getItem("token");

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    currentAdminEmail = payload.email;
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
  }
}


  return (
    <motion.div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>
          <FaUsers /> COMS Admin Dashboard
        </h1>
        <button onClick={handleLogout} className="button">
          <FaSignOutAlt /> Logout
        </button>
      </header>

      {/* Add User */}
      <div className="section-card">
        <h2>Add New User</h2>
        <form className="grid-two" autoComplete="off">
          <input
            type="text"
            name="username"
            autoComplete="off"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            name="email"
            autoComplete="off"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            name="role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </form>
        <button onClick={handleAddUser} className="button mt-4">
          <FaUserPlus /> Add User
        </button>
        {message && <p className="alert mt-2">{message}</p>}
      </div>

      {/* Users */}
      <div className="grid-two">
        {/* Employees */}
        <div className="section-card">
          <h3>👷 Employees</h3>
          {filteredUsers
            .filter((u) => u.role === "employee")
            .map((user) => (
              <div key={user.id} className="user-card">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="user-progress-bar">
                    <div
                      className="user-progress-fill"
                      style={{ width: `${user.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {user.progress?.toFixed(0)}% Complete
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="button bg-red-500 hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
        </div>

        {/* Admins */}
        <div className="section-card">
          <h3>🛠 Admins</h3>
          {filteredUsers
            .filter((u) => u.role === "admin")
            .map((user) => (
              <div key={user.id} className="user-card">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 italic">Admin</p>
                </div>
                {user.email !== currentAdminEmail && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="button bg-red-500 hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Documents Upload */}
      <div className="section-card">
        <h2>Upload Documents</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await axios.post(
                "http://localhost:5001/documents/upload-multiple",
                formData
              );
              e.target.reset();
              fetchDocuments();
            } catch (err) {
              console.error("Upload error:", err);
              alert("❌ Upload failed");
            }
          }}
        >
          <input
            name="files"
            type="file"
            multiple
            required
            accept="application/pdf"
          />
          <button type="submit" className="button mt-4">
            Upload
          </button>
        </form>
      </div>

      {/* Uploaded Docs */}
      <div className="section-card">
        <h2>Uploaded Documents</h2>
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li key={doc.id} className="doc-item">
              <span>{doc.title}</span>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="button bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz Editors Side-by-Side and Compact */}
      <div className="grid-two">
        <div className="section-card">
          <div className="quiz-editor">
            <QuizEditor />
          </div>
        </div>
        <div className="section-card">
          <div className="manual-handling-editor">
            <ManualHandlingQuizEditor />
          </div>
        </div>
      </div>

      {/* Quiz Submissions */}
      <div className="grid-two">
        <div className="section-card">
          <QuizSubmissions />
        </div>
        <div className="section-card">
          <ManualHandlingSubmissions />
        </div>
      </div>
    </motion.div>
  );
}
