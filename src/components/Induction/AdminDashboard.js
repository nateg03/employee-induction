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

 
  // ✅ Fetch Users with Progress
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

  useEffect(() => {
    fetchUsers();
  }, []);
  

  // ✅ Search Users
  useEffect(() => {
    const results = users.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(results);
  }, [search, users]);

  

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

      setUsers(users.filter((user) => user.id !== userId));
      setMessage("✅ User deleted successfully.");
    } catch (err) {
      console.error("❌ Delete User Error:", err.response?.data || err.message);
      setMessage("⚠️ Failed to delete user.");
    }
  };

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-gray-800 text-gray-200 p-6 flex flex-col justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-blue-400 flex items-center">
            <FaUsers className="mr-2" /> COMS Admin Dashboard
          </h1>
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search Users..."
              className="w-full p-2 bg-gray-700 rounded text-gray-200 border border-gray-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ADD USER FORM */}
<div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
  <h2 className="text-lg font-semibold mb-3 text-blue-600">Add New User</h2>
  <input
    type="text"
    placeholder="Username"
    value={newUser.username}
    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
    className="w-full mb-3 p-3 border border-gray-300 rounded bg-gray-100"
  />
  <input
    type="email"
    placeholder="Email"
    value={newUser.email}
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    className="w-full mb-3 p-3 border border-gray-300 rounded bg-gray-100"
  />
  <input
    type="password"
    placeholder="Password"
    value={newUser.password}
    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
    className="w-full mb-3 p-3 border border-gray-300 rounded bg-gray-100"
  />
  <select
    value={newUser.role}
    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
    className="w-full mb-3 p-3 border border-gray-300 rounded bg-gray-100 text-gray-700"
  >
    <option value="employee">Employee</option>
    <option value="admin">Admin</option>
  </select>
  <button
    onClick={handleAddUser}
    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center mt-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
  >
    <FaUserPlus className="mr-2" /> Add User
  </button>
  {message && <p className="text-center mt-2 text-gray-600">{message}</p>}
</div>


          {/* USER LIST */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">User List</h2>
            {loading ? (
              <p className="text-gray-600">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-600">No users found.</p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) =>
                  user.role !== "admin" && (
                    <div key={user.id} className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition border border-gray-300 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            Progress:{" "}
                            <span className="font-bold text-blue-500">{user.progress ? `${user.progress}%` : "0%"}</span>
                          </p>
                          <div className="w-full bg-gray-300 h-2 rounded-lg mt-1">
                            <div
                              className="bg-blue-500 h-2 rounded-lg transition-all duration-300"
                              style={{ width: `${user.progress ? user.progress : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
                      >
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    </div>
                  )
                )}
              </div>
              
            )}

          </div>
        </div>
     {/* Upload Section */}
<div className="bg-white p-6 mt-8 rounded-lg shadow border border-gray-300">
  <h2 className="text-lg font-semibold mb-3 text-blue-600">Upload Document</h2>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        await axios.post("http://localhost:5001/documents/upload", formData);
        alert("✅ Document uploaded!");
        e.target.reset();
      } catch (err) {
        console.error("Upload error:", err);
        alert("❌ Upload failed");
      }
    }}
  >
    <input name="title" type="text" placeholder="Document Title" required className="w-full mb-2 p-2 border rounded" />
    <input name="file" type="file" accept="application/pdf" required className="w-full mb-2" />
    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      Upload
    </button>
  </form>
</div>


      </div>
    </div>
  );
}
