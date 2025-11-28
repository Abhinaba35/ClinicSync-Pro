from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, DoctorProfile

doctor_bp = Blueprint("doctor", __name__, url_prefix="/api/doctors")


@doctor_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def list_doctors():
    doctors = (
        User.query.filter_by(role="doctor")
        .join(DoctorProfile, DoctorProfile.user_id == User.id)
        .all()
    )

    result = []
    for doc in doctors:
        result.append(
            {
                "id": doc.id,
                "name": doc.name,
                "email": doc.email,
                "specialty": doc.doctor_profile.specialty if doc.doctor_profile else None,
                "rating": doc.doctor_profile.rating if doc.doctor_profile else None,
            }
        )

    return jsonify(result), 200
