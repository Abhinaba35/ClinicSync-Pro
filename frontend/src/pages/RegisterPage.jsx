import { useState } from "react";
import api from "../api/client.js";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/api/auth/register", { ...form, role: "patient" });
      setMessage("Registered successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Patient Registration
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Create your patient account to book appointments
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              name="age"
              type="number"
              placeholder="Age (optional)"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.age}
              onChange={handleChange}
              min="1"
              max="120"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
            Login
          </a>
        </p>
        <p className="text-center text-gray-500 mt-2 text-xs">
          Note: Doctor accounts must be created by an administrator.
        </p>
      </div>
    </div>
  );
}
