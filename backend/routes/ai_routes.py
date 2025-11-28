from flask import Blueprint, request, jsonify
import os

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def simple_specialty_recommendation(symptoms: str) -> str:
    """Rule-based specialty recommendation"""
    s = symptoms.lower()
    if any(word in s for word in ["heart", "chest pain", "bp", "blood pressure", "cardiac"]):
        return "Cardiologist"
    if any(word in s for word in ["skin", "rash", "itch", "allergy", "dermatitis", "acne"]):
        return "Dermatologist"
    if any(word in s for word in ["headache", "seizure", "stroke", "numbness", "migraine", "neurological"]):
        return "Neurologist"
    if any(word in s for word in ["fever", "cold", "cough", "flu", "infection"]):
        return "General Physician"
    return "General Physician"


def openai_recommendation(symptoms: str) -> str:
    """Use OpenAI API for specialty recommendation if available"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        return None

    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)
        
        prompt = f"""Based on the following symptoms, recommend the most appropriate medical specialty:
Symptoms: {symptoms}

Choose from: Cardiologist, Dermatologist, Neurologist, General Physician, Orthopedist, Gastroenterologist, Ophthalmologist, ENT Specialist

Respond with only the specialty name."""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50
        )
        
        specialty = response.choices[0].message.content.strip()
        # Validate the response
        valid_specialties = ["Cardiologist", "Dermatologist", "Neurologist", "General Physician", 
                           "Orthopedist", "Gastroenterologist", "Ophthalmologist", "ENT Specialist"]
        if specialty in valid_specialties:
            return specialty
        return None
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


@ai_bp.route("/recommend-doctor", methods=["POST"])
def recommend_doctor():
    data = request.get_json()
    symptoms = data.get("symptoms", "")
    use_openai = data.get("use_openai", False)

    if not symptoms:
        return jsonify({"message": "Symptoms are required"}), 400

    specialty = None
    method = "rule-based"

    # Try OpenAI if requested and available
    if use_openai:
        try:
            specialty = openai_recommendation(symptoms)
            if specialty:
                method = "openai"
        except Exception as e:
            print(f"OpenAI failed: {e}")

    # Fallback to rule-based
    if not specialty:
        specialty = simple_specialty_recommendation(symptoms)

    return jsonify({
        "specialty": specialty,
        "method": method,
        "message": f"Based on your symptoms, we recommend consulting a {specialty}.",
        "symptoms": symptoms,
    }), 200
