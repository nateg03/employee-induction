import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaSignOutAlt, FaTrash, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "employee" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      setLoading(false);
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

  useEffect(() => {
    const results = users.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(results);
  }, [search, users]);

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
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error("❌ Delete User Error:", err);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error("❌ Delete Document Error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const currentAdminEmail = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).email;

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-[#f4f8fc] to-[#d7e3f4] text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.header className="bg-[#003c64] text-white py-4 shadow-md flex items-center justify-between px-6" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold flex items-center">
          <FaUsers className="mr-3 text-[#97d0ff]" /> COMS Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
        >
          <FaSignOutAlt /> Logout
        </button>
      </motion.header>

      <main className="max-w-7xl mx-auto p-6 space-y-10">
        <motion.section className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#4b9cd3]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-xl font-semibold text-[#003c64] mb-4">Add New User</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="p-2 border rounded bg-gray-100" />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="p-2 border rounded bg-gray-100" />
            <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="p-2 border rounded bg-gray-100" />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="p-2 border rounded bg-gray-100">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={handleAddUser} className="mt-4 bg-[#4b9cd3] hover:bg-[#367bb5] text-white px-4 py-2 rounded flex items-center gap-2">
            <FaUserPlus /> Add User
          </button>
          {message && <p className="mt-2 text-sm text-center text-gray-600">{message}</p>}
        </motion.section>

        <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {/* EMPLOYEES */}
          <motion.div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#4b9cd3]" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold text-[#003c64] mb-2">👷 Employees</h3>
            {filteredUsers.filter(u => u.role === "employee").map(user => (
              <motion.div key={user.id} className="bg-[#f8fafc] p-4 rounded-lg mb-3 flex justify-between items-center shadow-sm" whileHover={{ scale: 1.02 }}>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs mt-1">Progress: <span className="text-blue-600 font-semibold">{typeof user.progress === "number" ? `${user.progress.toFixed(0)}%` : "0%"}</span></p>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${user.progress || 0}%` }}></div>
                  </div>
                </div>
                <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* ADMINS */}
          <motion.div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#4b9cd3]" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold text-[#003c64] mb-2">🛠 Admins</h3>
            {filteredUsers.filter(u => u.role === "admin").map(user => (
              <motion.div key={user.id} className="bg-[#f8fafc] p-4 rounded-lg mb-3 flex justify-between items-center shadow-sm" whileHover={{ scale: 1.02 }}>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 italic">Admin</p>
                </div>
                {user.email !== currentAdminEmail && (
                  <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                    <FaTrash />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Upload Docs */}
        <motion.section className="bg-white p-6 rounded-lg shadow border-t-4 border-[#4b9cd3]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-lg font-semibold mb-3 text-[#003c64]">Upload Documents</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await axios.post("http://localhost:5001/documents/upload-multiple", formData);
              alert("✅ Documents uploaded!");
              e.target.reset();
              fetchDocuments();
            } catch (err) {
              console.error("Upload error:", err);
              alert("❌ Upload failed");
            }
          }}>
            <input name="files" type="file" multiple required accept="application/pdf" className="w-full mb-3 p-2 border rounded" />
            <button type="submit" className="bg-[#4b9cd3] hover:bg-[#367bb5] text-white px-4 py-2 rounded">
              Upload
            </button>
          </form>
        </motion.section>

        {/* Document List */}
        <motion.section className="bg-white p-6 rounded-lg shadow border-t-4 border-[#4b9cd3]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold mb-3 text-[#003c64]">Uploaded Documents</h2>
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center bg-[#f8f9fb] p-3 rounded border border-gray-200">
                <span className="text-gray-800">{doc.title}</span>
                <button onClick={() => handleDeleteDocument(doc.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </motion.section>
      </main>
    </motion.div>
  );
}
