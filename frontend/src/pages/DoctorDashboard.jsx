import { useEffect, useState } from "react";
import api from "../api/client.js";
import { format } from "date-fns";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, scheduled, completed, cancelled

  const loadAppointments = async () => {
    try {
      const res = await api.get("/api/appointments/my");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedStatus === "all") return true;
    return apt.status === selectedStatus;
  });

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) > new Date() && apt.status === "scheduled"
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) <= new Date() || apt.status !== "scheduled"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Upcoming</h3>
              <p className="text-4xl font-bold">{upcomingAppointments.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Completed</h3>
              <p className="text-4xl font-bold">
                {appointments.filter((a) => a.status === "completed").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Total</h3>
              <p className="text-4xl font-bold">{appointments.length}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-lg">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus("scheduled")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === "scheduled"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setSelectedStatus("completed")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedStatus("cancelled")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === "cancelled"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No appointments found.</p>
            ) : (
              filteredAppointments.map((apt) => {
                const isUpcoming = new Date(apt.start_time) > new Date();
                return (
                  <div
                    key={apt.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {apt.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{apt.patient.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          📅 {format(new Date(apt.start_time), "MMMM d, yyyy 'at' h:mm a")} -{" "}
                          {format(new Date(apt.end_time), "h:mm a")}
                        </p>
                        {apt.reason && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Reason for visit:
                            </p>
                            <p className="text-sm text-gray-600">{apt.reason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
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

                    {/* Action Buttons */}
                    {apt.status === "scheduled" && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        {isUpcoming && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "completed")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "cancelled")}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                            >
                              Cancel Appointment
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
