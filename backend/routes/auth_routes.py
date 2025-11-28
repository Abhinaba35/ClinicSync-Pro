from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..extensions import db
from ..models import User, PatientProfile, DoctorProfile

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Patient self-registration only. Doctors must be created by admin."""
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")  # Default to patient
    age = data.get("age")  # for patient

    # Only allow patient registration
    if role != "patient":
        return jsonify({"message": "Only patient registration is allowed. Doctors must be created by admin."}), 403

    if not all([name, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "Email already registered"}), 400

    user = User(name=name, email=email, role="patient")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()  # get user.id

    profile = PatientProfile(user_id=user.id, age=age)
    db.session.add(profile)

    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    
    token = create_access_token(
    identity=str(user.id),   # must be string
    additional_claims={
        "role": user.role,
        "name": user.name
    }
    )

    return jsonify(
        {
            "access_token": token,
            "user": {"id": user.id, "name": user.name, "role": user.role, "email": user.email},
        }
    ), 200
