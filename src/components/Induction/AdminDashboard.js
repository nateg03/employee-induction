import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaSignOutAlt, FaTrash, FaUsers } from "react-icons/fa";

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
      if (!token) {
        setMessage("⚠️ No token found. Please log in.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5001/auth/users-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data);
      setFilteredUsers(res.data);
      setLoading(false);
      setMessage("");
    } catch (err) {
      console.error("❌ Fetch Users Error:", err.response?.data || err.message);
      setMessage("⚠️ Unauthorized. Please log in again.");
      setLoading(false);
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

      setUsers(users.filter((user) => user.id !== userId));
      setMessage("✅ User deleted successfully.");
    } catch (err) {
      console.error("❌ Delete User Error:", err.response?.data || err.message);
      setMessage("⚠️ Failed to delete user.");
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/documents/${id}`);
      setDocuments(prev => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("❌ Delete Document Error:", err);
      alert("Failed to delete document.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const currentAdminEmail = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).email;

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 text-gray-900 min-h-screen">
      <aside className="w-full lg:w-64 bg-gray-800 text-gray-200 p-6 shadow-lg">
        <h1 className="text-xl font-bold text-blue-400 flex items-center mb-6">
          <FaUsers className="mr-2" /> COMS Admin Dashboard
        </h1>
        <input
          type="text"
          placeholder="Search Users..."
          className="w-full p-2 bg-gray-700 rounded text-gray-200 border border-gray-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded flex items-center justify-center transition-all"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      <main className="flex-1 p-8 space-y-6">
        {/* Add New User */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Add New User</h2>
            <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full mb-2 p-2 border rounded bg-gray-100" />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full mb-2 p-2 border rounded bg-gray-100" />
            <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full mb-2 p-2 border rounded bg-gray-100" />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full mb-2 p-2 border rounded bg-gray-100">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddUser} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-all">
              <FaUserPlus className="mr-2 inline" /> Add User
            </button>
            {message && <p className="mt-2 text-gray-600 text-center">{message}</p>}
          </div>

          {/* Separated User List */}
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">User List</h2>

            {loading ? (
              <p className="text-gray-600">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-600">No users found.</p>
            ) : (
              <>
                <h3 className="text-md font-bold text-gray-700 mb-2">👷 Employees</h3>
                <div className="space-y-4 mb-6">
                  {filteredUsers.filter(u => u.role === "employee").map((user) => (
                    <div key={user.id} className="bg-gray-50 p-3 rounded shadow flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="text-sm text-gray-600 mt-1">
                          Progress: <span className="text-blue-600 font-semibold">{typeof user.progress === "number" ? `${user.progress.toFixed(0)}%` : "0%"}</span>
                          <div className="w-full bg-gray-300 h-2 rounded mt-1">
                            <div className="bg-blue-500 h-2 rounded" style={{ width: `${user.progress || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <h3 className="text-md font-bold text-gray-700 mb-2">🛠 Admins</h3>
                <div className="space-y-4">
                  {filteredUsers.filter(u => u.role === "admin").map((user) => (
                    <div key={user.id} className="bg-gray-50 p-3 rounded shadow flex justify-between items-center">
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
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
  <h2 className="text-lg font-semibold mb-3 text-blue-600">Upload Documents</h2>
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
    {/* REMOVE title input — not needed anymore */}
    <input name="files" type="file" multiple required accept="application/pdf" className="w-full mb-2" />
    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      Upload
    </button>
  </form>
</section>


        {/* Uploaded Documents */}
        <section className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-3 text-blue-600">Uploaded Documents</h2>
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200">
                <span className="text-gray-800">{doc.title}</span>
                <button onClick={() => handleDeleteDocument(doc.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
