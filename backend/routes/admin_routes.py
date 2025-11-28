from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from ..extensions import db, mail
from flask_mail import Message
from ..models import User, DoctorProfile, PatientProfile, Appointment
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")




def admin_required(f):
    """Decorator to ensure only admin can access"""
    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()  # <-- FIX HERE
        if claims.get("role") != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return f(*args, **kwargs)
    return wrapper


@admin_bp.route("/doctors", methods=["POST"])
@admin_required
def create_doctor():
    """Create a new doctor account (admin only)"""
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    specialty = data.get("specialty")
    experience_years = data.get("experience_years", 0)
    rating = data.get("rating", 0.0)

    if not all([name, email, password, specialty]):
        return jsonify({"message": "Missing required fields"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "Email already registered"}), 400

    user = User(name=name, email=email, role="doctor")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    profile = DoctorProfile(
        user_id=user.id,
        specialty=specialty,
        experience_years=experience_years,
        rating=rating
    )
    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "Doctor created successfully",
        "doctor": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "specialty": specialty
        }
    }), 201


@admin_bp.route("/doctors", methods=["GET"])
@admin_required
def list_all_doctors():
    """List all doctors"""
    doctors = (
        User.query.filter_by(role="doctor")
        .join(DoctorProfile, DoctorProfile.user_id == User.id)
        .all()
    )

    result = []
    for doc in doctors:
        result.append({
            "id": doc.id,
            "name": doc.name,
            "email": doc.email,
            "specialty": doc.doctor_profile.specialty if doc.doctor_profile else None,
            "experience_years": doc.doctor_profile.experience_years if doc.doctor_profile else 0,
            "rating": doc.doctor_profile.rating if doc.doctor_profile else 0.0,
        })

    return jsonify(result), 200


@admin_bp.route("/doctors/<int:doctor_id>", methods=["PUT"])
@admin_required
def update_doctor(doctor_id):
    """Update doctor details"""
    doctor = User.query.filter_by(id=doctor_id, role="doctor").first()
    if not doctor:
        return jsonify({"message": "Doctor not found"}), 404

    data = request.get_json()
    if "name" in data:
        doctor.name = data["name"]
    if "email" in data:
        existing = User.query.filter_by(email=data["email"]).first()
        if existing and existing.id != doctor_id:
            return jsonify({"message": "Email already in use"}), 400
        doctor.email = data["email"]
    if "password" in data:
        doctor.set_password(data["password"])

    if doctor.doctor_profile:
        if "specialty" in data:
            doctor.doctor_profile.specialty = data["specialty"]
        if "experience_years" in data:
            doctor.doctor_profile.experience_years = data["experience_years"]
        if "rating" in data:
            doctor.doctor_profile.rating = data["rating"]

    db.session.commit()

    return jsonify({
        "message": "Doctor updated successfully",
        "doctor": {
            "id": doctor.id,
            "name": doctor.name,
            "email": doctor.email,
            "specialty": doctor.doctor_profile.specialty if doctor.doctor_profile else None,
        }
    }), 200


@admin_bp.route("/doctors/<int:doctor_id>", methods=["DELETE"])
@admin_required
def delete_doctor(doctor_id):
    """Delete a doctor"""
    doctor = User.query.filter_by(id=doctor_id, role="doctor").first()
    if not doctor:
        return jsonify({"message": "Doctor not found"}), 404

    # Delete profile first
    if doctor.doctor_profile:
        db.session.delete(doctor.doctor_profile)
    db.session.delete(doctor)
    db.session.commit()

    return jsonify({"message": "Doctor deleted successfully"}), 200


@admin_bp.route("/appointments", methods=["GET"])
@admin_required
def list_all_appointments():
    """List all appointments in the system"""
    appointments = Appointment.query.order_by(Appointment.start_time.desc()).all()

    result = []
    for apt in appointments:
        patient = User.query.get(apt.patient_id)
        doctor = User.query.get(apt.doctor_id)
        result.append({
            "id": apt.id,
            "patient": {
                "id": patient.id if patient else None,
                "name": patient.name if patient else "Unknown",
                "email": patient.email if patient else None,
            },
            "doctor": {
                "id": doctor.id if doctor else None,
                "name": doctor.name if doctor else "Unknown",
                "specialty": doctor.doctor_profile.specialty if doctor and doctor.doctor_profile else None,
            },
            "start_time": apt.start_time.isoformat(),
            "end_time": apt.end_time.isoformat(),
            "status": apt.status,
            "reason": apt.reason,
            "created_at": apt.created_at.isoformat() if apt.created_at else None,
        })

    return jsonify(result), 200


@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def get_analytics():
    """Get basic analytics"""
    total_doctors = User.query.filter_by(role="doctor").count()
    total_patients = User.query.filter_by(role="patient").count()
    total_appointments = Appointment.query.count()
    upcoming_appointments = Appointment.query.filter(
        Appointment.start_time >= datetime.utcnow(),
        Appointment.status == "scheduled"
    ).count()

    return jsonify({
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "upcoming_appointments": upcoming_appointments,
    }), 200

