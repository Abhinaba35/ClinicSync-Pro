import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../api/client.js";
import { format } from "date-fns";

export default function CalendarBooking({ doctorId, onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (doctorId && selectedDate) {
      loadAvailableSlots();
    }
  }, [doctorId, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await api.get("/api/appointments/available-slots", {
        params: { doctor_id: doctorId, date: dateStr },
      });

      setAvailableSlots(res.data.available_slots || []);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setAvailableSlots([]);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);

    for (let hour = 9; hour < 17; hour++) {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      slots.push(slot);
    }

    return slots;
  };

  // FIXED SLOT MATCHING (FULL DATE + TIME)
  const isSlotAvailable = (slotTime) => {
    return availableSlots.some((available) => {
      const a = new Date(available);

      return (
        a.getFullYear() === slotTime.getFullYear() &&
        a.getMonth() === slotTime.getMonth() &&
        a.getDate() === slotTime.getDate() &&
        a.getHours() === slotTime.getHours() &&
        a.getMinutes() === slotTime.getMinutes()
      );
    });
  };

  const handleBook = async () => {
    if (!selectedTime || !reason.trim()) {
      setError("Please select a time slot and provide a reason");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const startTime = new Date(selectedTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      // FIX: send ISO WITHOUT timezone ("Z") — backend needs local format
      const startLocal = format(startTime, "yyyy-MM-dd'T'HH:mm:ss");
      const endLocal = format(endTime, "yyyy-MM-dd'T'HH:mm:ss");

      await api.post("/api/appointments/book", {
        doctor_id: doctorId,
        start_time: startLocal,
        end_time: endLocal,
        reason,
      });

      setMessage("Appointment booked successfully!");
      setReason("");
      setSelectedTime(null);

      if (onBookingSuccess) onBookingSuccess();

      setTimeout(() => loadAvailableSlots(), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Select Date & Time</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="w-full border-0 rounded-lg"
          />
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-700">
            Available Time Slots for {format(selectedDate, "MMMM d, yyyy")}
          </h4>

          <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
            {timeSlots.map((slot, idx) => {
              const available = isSlotAvailable(slot);
              const isSelected =
                selectedTime && selectedTime.getTime() === slot.getTime();

              return (
                <button
                  key={idx}
                  onClick={() => available && setSelectedTime(slot)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg"
                      : available
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {format(slot, "h:mm a")}
                </button>
              );
            })}
          </div>

          {/* Selected Slot */}
          {selectedTime && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Selected Appointment:</p>
              <p className="font-semibold text-blue-800">
                {format(selectedDate, "MMMM d, yyyy")} at{" "}
                {format(selectedTime, "h:mm a")}
              </p>
            </div>
          )}

          <textarea
            placeholder="Reason for visit..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={loading || !selectedTime || !reason.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
