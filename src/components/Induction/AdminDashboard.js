import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { auth, setAuth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "employee" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user || auth.user.role !== "admin") {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:5001/admin/get-all-progress", {
      headers: { Authorization: auth.token },
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error("Error fetching users:", err));
  }, [auth, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/auth/admin/register", formData, {
        headers: { Authorization: auth.token },
      });
      setMessage("User created successfully!");
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || "Failed to create user"));
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="mb-6">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <select name="role" onChange={handleChange} className="w-full p-2 border rounded mb-4">
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Create User</button>
      </form>

      <h3 className="text-xl font-semibold mb-4">User Progress</h3>
      <div className="overflow-auto max-h-96">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Progress</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(users).map(email => (
              <tr key={email}>
                <td className="py-2 px-4 border">{users[email].username}</td>
                <td className="py-2 px-4 border">{email}</td>
                <td className="py-2 px-4 border">
                  {Object.values(users[email].progress).filter(val => val).length} / 5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
