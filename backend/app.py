from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .config import Config
from .extensions import db, bcrypt, jwt, cors, mail
from .routes.auth_routes import auth_bp
from .routes.doctor_routes import doctor_bp
from .routes.appointment_routes import appointment_bp
from .routes.ai_routes import ai_bp
from .routes.admin_routes import admin_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    cors.init_app(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)


    # blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(admin_bp)

    @app.route("/")
    def home():
        return "Backend running!"

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": "Not found"}), 404

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        from . import models  # ensures tables load
        db.create_all()
    app.run(debug=True)
