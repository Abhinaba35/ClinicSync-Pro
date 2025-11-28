import { useEffect, useState } from "react";
import api from "../api/client.js";
import CalendarBooking from "../components/CalendarBooking.jsx";
import { format } from "date-fns";

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("book"); // "book", "appointments", "ai"
  const [symptoms, setSymptoms] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/api/doctors/");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get("/api/appointments/my");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const handleBookingSuccess = () => {
    loadAppointments();
    setActiveTab("appointments");
  };

  const handleAiRecommend = async (useOpenAI = false) => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setAiRecommendation(null);
    try {
      const res = await api.post("/api/ai/recommend-doctor", {
        symptoms,
        use_openai: useOpenAI,
      });
      setAiRecommendation(res.data);
    } catch (err) {
      console.error("AI recommendation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.post(`/api/appointments/${appointmentId}/cancel`);
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) > new Date() && apt.status === "scheduled"
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) <= new Date() || apt.status !== "scheduled"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
          <button
            onClick={() => setActiveTab("book")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "book"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "appointments"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "ai"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            AI Symptom Analyzer
          </button>
        </div>

        {/* Book Appointment Tab */}
        {activeTab === "book" && (
          <div className="space-y-6">
            {/* Doctor Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Select a Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDoctor === doctor.id
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {doctor.specialty}
                    </p>
                    {doctor.rating && (
                      <p className="text-sm text-gray-600 mt-2">
                        ⭐ {doctor.rating.toFixed(1)} / 5.0
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Booking */}
            {selectedDoctor && (
              <CalendarBooking
                doctorId={selectedDoctor}
                onBookingSuccess={handleBookingSuccess}
              />
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-600">No upcoming appointments.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            Dr. {apt.doctor.name}
                          </h3>
                          <p className="text-sm text-blue-600">{apt.doctor.specialty}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            📅 {format(new Date(apt.start_time), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                          {apt.reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {apt.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              apt.status === "scheduled"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {apt.status}
                          </span>
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Past Appointments</h2>
              {pastAppointments.length === 0 ? (
                <p className="text-gray-600">No past appointments.</p>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Dr. {apt.doctor.name}
                          </h3>
                          <p className="text-sm text-blue-600">{apt.doctor.specialty}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            📅 {format(new Date(apt.start_time), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                          {apt.reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {apt.reason}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : apt.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Symptom Analyzer Tab */}
        {activeTab === "ai" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Symptom Analyzer</h2>
            <p className="text-gray-600 mb-4">
              Describe your symptoms and get a recommendation for the best specialist to consult.
            </p>

            <textarea
              className="w-full border rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="Describe your symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleAiRecommend(false)}
                disabled={loading || !symptoms.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Analyzing..." : "Get Recommendation"}
              </button>
              <button
                onClick={() => handleAiRecommend(true)}
                disabled={loading || !symptoms.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Analyzing..." : "Use AI (OpenAI)"}
              </button>
            </div>

            {aiRecommendation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Recommendation</h3>
                <p className="text-lg text-blue-700 font-medium mb-2">
                  {aiRecommendation.message}
                </p>
                <p className="text-sm text-gray-600">
                  Method: {aiRecommendation.method === "openai" ? "OpenAI GPT" : "Rule-based"}
                </p>
                {aiRecommendation.specialty && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Recommended doctors:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {doctors
                        .filter((doc) => doc.specialty === aiRecommendation.specialty)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white rounded-lg p-3 border border-gray-200"
                          >
                            <p className="font-semibold text-gray-800">{doc.name}</p>
                            <p className="text-sm text-blue-600">{doc.specialty}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
