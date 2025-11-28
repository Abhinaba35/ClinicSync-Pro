from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
from ..extensions import db, mail
from flask_mail import Message
from ..models import Appointment, User

appointment_bp = Blueprint("appointment", __name__, url_prefix="/api/appointments")


# ==========================================================
# HELPERS
# ==========================================================

def is_conflict(doctor_id, start_time, end_time, exclude_id=None):
    query = Appointment.query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
        Appointment.status == "scheduled",
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    return query.first() is not None


def is_patient_conflict(patient_id, start_time, end_time, exclude_id=None):
    query = Appointment.query.filter(
        Appointment.patient_id == patient_id,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
        Appointment.status == "scheduled",
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    return query.first() is not None


def send_appointment_email(user_email, user_name, doctor_name, start_time, end_time, action="confirmed"):
    try:
        if action == "confirmed":
            subject = "Appointment Confirmation"
            body = f"""
            Dear {user_name},

            Your appointment with Dr. {doctor_name} has been confirmed.

            Date & Time: {start_time.strftime('%Y-%m-%d %H:%M')} - {end_time.strftime('%H:%M')}

            Please arrive 10 minutes early.

            Regards,
            Healthcare AI System
            """
        elif action == "cancelled":
            subject = "Appointment Cancelled"
            body = f"""
            Dear {user_name},

            Your appointment with Dr. {doctor_name} scheduled for 
            {start_time.strftime('%Y-%m-%d %H:%M')} has been cancelled.

            Regards,
            Healthcare AI System
            """

        msg = Message(subject, recipients=[user_email], body=body)
        mail.send(msg)

    except Exception as e:
        print("Email sending failed:", e)


# ==========================================================
# BOOK APPOINTMENT
# ==========================================================

@appointment_bp.route("/book", methods=["POST"])
@jwt_required()
def book_appointment():
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())   # convert to int

    if role != "patient":
        return jsonify({"message": "Only patients can book appointments"}), 403

    data = request.get_json()
    doctor_id = data.get("doctor_id")
    start_time_str = data.get("start_time")
    end_time_str = data.get("end_time")
    reason = data.get("reason")

    # Parse datetime safely
    try:
        if start_time_str.endswith("Z"):
            start_time_str = start_time_str.replace("Z", "+00:00")
        if end_time_str.endswith("Z"):
            end_time_str = end_time_str.replace("Z", "+00:00")

        start_time = datetime.fromisoformat(start_time_str)
        end_time = datetime.fromisoformat(end_time_str)

        if start_time.tzinfo:
            start_time = start_time.replace(tzinfo=None)
        if end_time.tzinfo:
            end_time = end_time.replace(tzinfo=None)

    except Exception:
        return jsonify({"message": "Invalid datetime format"}), 400

    # Conflict checks
    if is_conflict(doctor_id, start_time, end_time):
        return jsonify({"message": "Doctor time slot already booked"}), 409

    if is_patient_conflict(user_id, start_time, end_time):
        return jsonify({"message": "You already have an appointment at this time"}), 409

    if start_time < datetime.utcnow():
        return jsonify({"message": "Cannot book appointments in the past"}), 400

    doctor = User.query.get(doctor_id)
    if not doctor or doctor.role != "doctor":
        return jsonify({"message": "Invalid doctor"}), 404

    patient = User.query.get(user_id)

    appointment = Appointment(
        patient_id=user_id,
        doctor_id=doctor_id,
        start_time=start_time,
        end_time=end_time,
        reason=reason,
        status="scheduled",
    )

    db.session.add(appointment)
    db.session.commit()

    send_appointment_email(
        patient.email, patient.name, doctor.name,
        start_time, end_time, action="confirmed"
    )

    return jsonify({
        "message": "Appointment booked successfully",
        "appointment": {
            "id": appointment.id,
            "start_time": appointment.start_time.isoformat(),
            "end_time": appointment.end_time.isoformat(),
            "status": appointment.status,
        }
    }), 201


# ==========================================================
# GET MY APPOINTMENTS
# ==========================================================

@appointment_bp.route("/my", methods=["GET"])
@jwt_required()
def my_appointments():
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    if role == "patient":
        appts = Appointment.query.filter_by(
            patient_id=user_id
        ).order_by(Appointment.start_time.desc()).all()

    elif role == "doctor":
        appts = Appointment.query.filter_by(
            doctor_id=user_id
        ).order_by(Appointment.start_time.desc()).all()

    else:
        return jsonify({"message": "Invalid role"}), 403

    result = []
    for a in appts:
        patient = User.query.get(a.patient_id)
        doctor = User.query.get(a.doctor_id)

        result.append({
            "id": a.id,
            "patient": {
                "id": patient.id if patient else None,
                "name": patient.name if patient else "Unknown",
                "email": patient.email if patient else None,
            },
            "doctor": {
                "id": doctor.id if doctor else None,
                "name": doctor.name if doctor else "Unknown",
                "specialty": doctor.doctor_profile.specialty
                if doctor and doctor.doctor_profile else None,
            },
            "start_time": a.start_time.isoformat(),
            "end_time": a.end_time.isoformat(),
            "status": a.status,
            "reason": a.reason,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })

    return jsonify(result), 200


# ==========================================================
# CANCEL APPOINTMENT
# ==========================================================

@appointment_bp.route("/<int:appointment_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_appointment(appointment_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404

    if role == "patient" and appointment.patient_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    if role == "doctor" and appointment.doctor_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    if appointment.status != "scheduled":
        return jsonify({"message": "Only scheduled appointments can be cancelled"}), 400

    appointment.status = "cancelled"
    db.session.commit()

    patient = User.query.get(appointment.patient_id)
    doctor = User.query.get(appointment.doctor_id)

    send_appointment_email(
        patient.email, patient.name, doctor.name,
        appointment.start_time, appointment.end_time, action="cancelled"
    )

    return jsonify({"message": "Appointment cancelled successfully"}), 200


# ==========================================================
# UPDATE STATUS (DOCTOR ONLY)
# ==========================================================

@appointment_bp.route("/<int:appointment_id>/status", methods=["PUT"])
@jwt_required()
def update_appointment_status(appointment_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    if role != "doctor":
        return jsonify({"message": "Only doctors can update appointment status"}), 403

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404

    if appointment.doctor_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["scheduled", "completed", "cancelled"]:
        return jsonify({"message": "Invalid status"}), 400

    appointment.status = new_status
    db.session.commit()

    return jsonify({
        "message": "Appointment status updated",
        "appointment": {"id": appointment.id, "status": appointment.status}
    }), 200


# ==========================================================
# AVAILABLE SLOTS
# ==========================================================

@appointment_bp.route("/available-slots", methods=["GET"])
@jwt_required()
def get_available_slots():
    doctor_id = request.args.get("doctor_id", type=int)
    date_str = request.args.get("date")

    if not doctor_id or not date_str:
        return jsonify({"message": "doctor_id and date are required"}), 400

    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format, use YYYY-MM-DD"}), 400

    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = datetime.combine(date, datetime.max.time())

    existing_appointments = Appointment.query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.start_time >= start_of_day,
        Appointment.start_time < end_of_day,
        Appointment.status == "scheduled"
    ).all()

    booked_hours = {apt.start_time.hour for apt in existing_appointments}

    available_slots = []
    for hour in range(9, 17):
        if hour not in booked_hours:
            slot = datetime.combine(date, datetime.min.time().replace(hour=hour))
            available_slots.append(slot.isoformat())

    return jsonify({
        "date": date_str,
        "doctor_id": doctor_id,
        "available_slots": available_slots
    }), 200
