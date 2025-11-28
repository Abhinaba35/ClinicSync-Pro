import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "admin") return "/admin";
    if (user.role === "doctor") return "/doctor";
    if (user.role === "patient") return "/patient";
    return "/";
  };

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <Link to="/" className="font-bold text-xl hover:text-blue-300 transition-colors">
        🏥 ClinicSync Pro
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {getDashboardLink() && (
              <Link
                to={getDashboardLink()}
                className="text-sm hover:text-blue-300 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <span className="text-sm">
              {user.name} <span className="text-blue-300">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:text-blue-300 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="p-4 max-w-5xl mx-auto">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : user.role === "patient" ? (
                  <Navigate to="/patient" />
                ) : (
                  <Navigate to="/doctor" />
                )
              ) : (
                <div className="text-center mt-20">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Welcome to HealthCare Appointment AI
                  </h1>
                  <p className="text-slate-700 text-lg mb-8">
                    Login or register to book and manage appointments.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/login"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/patient"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
