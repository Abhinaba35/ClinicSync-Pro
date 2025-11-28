import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    experience_years: 0,
    rating: 0.0,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/api/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await api.get("/api/admin/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get("/api/admin/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadDoctors();
    loadAppointments();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/api/admin/doctors", formData);
      setMessage("Doctor created successfully");
      setShowCreateForm(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        specialty: "",
        experience_years: 0,
        rating: 0.0,
      });
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create doctor");
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: "",
      specialty: doctor.specialty,
      experience_years: doctor.experience_years || 0,
      rating: doctor.rating || 0.0,
    });
    setShowCreateForm(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await api.put(`/api/admin/doctors/${editingDoctor.id}`, updateData);
      setMessage("Doctor updated successfully");
      setShowCreateForm(false);
      setEditingDoctor(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        specialty: "",
        experience_years: 0,
        rating: 0.0,
      });
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor");
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`/api/admin/doctors/${doctorId}`);
      setMessage("Doctor deleted successfully");
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete doctor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-sm font-semibold opacity-90 mb-2">Total Doctors</h3>
                <p className="text-4xl font-bold">{analytics.total_doctors}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-sm font-semibold opacity-90 mb-2">Total Patients</h3>
                <p className="text-4xl font-bold">{analytics.total_patients}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-sm font-semibold opacity-90 mb-2">Total Appointments</h3>
                <p className="text-4xl font-bold">{analytics.total_appointments}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-sm font-semibold opacity-90 mb-2">Upcoming</h3>
                <p className="text-4xl font-bold">{analytics.upcoming_appointments}</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Create/Edit Doctor Form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
              <h2 className="text-xl font-semibold mb-4">
                {editingDoctor ? "Edit Doctor" : "Create New Doctor"}
              </h2>
              <form
                onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Doctor Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder={editingDoctor ? "New Password (leave blank to keep current)" : "Password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingDoctor}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="specialty"
                    placeholder="Specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="experience_years"
                    placeholder="Experience (years)"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="rating"
                    placeholder="Rating (0-5)"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingDoctor ? "Update Doctor" : "Create Doctor"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingDoctor(null);
                      setFormData({
                        name: "",
                        email: "",
                        password: "",
                        specialty: "",
                        experience_years: 0,
                        rating: 0.0,
                      });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Create Doctor Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              + Create New Doctor
            </button>
          )}

          {/* Doctors List */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.email}</p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {doctor.specialty}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      {doctor.experience_years} years • ⭐ {doctor.rating.toFixed(1)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Appointments</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.length === 0 ? (
                <p className="text-gray-600">No appointments yet.</p>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {apt.patient.name} → Dr. {apt.doctor.name}
                        </p>
                        <p className="text-sm text-gray-600">{apt.doctor.specialty}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(apt.start_time).toLocaleString()}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-gray-600 mt-1">Reason: {apt.reason}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

