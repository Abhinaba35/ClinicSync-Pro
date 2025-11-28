# 🏥 AI-Powered Healthcare Appointment Management System

A complete production-ready full-stack application for managing healthcare appointments with AI-powered symptom analysis.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Patient self-registration
- Admin-only doctor account creation
- Secure password hashing with bcrypt

### Admin Dashboard
- Create, edit, and delete doctor accounts
- View all appointments in the system
- Analytics dashboard (total doctors, patients, appointments)
- Manage doctor profiles with specialty, experience, and ratings

### Doctor Dashboard
- View upcoming and past appointments
- Mark appointments as completed or cancelled
- View patient information
- Filter appointments by status

### Patient Dashboard
- Browse all doctors with specialties and ratings
- Calendar-based appointment booking UI
- View and cancel appointments
- AI symptom analyzer for specialty recommendations

### Appointment System
- Prevents doctor double-booking
- Prevents patient overlapping bookings
- 30-minute default appointment slots
- Server-side validation
- Email notifications (confirmation and cancellation)

### AI Features
- Rule-based symptom → specialty recommendation
- Optional OpenAI GPT integration
- Supports: Cardiologist, Dermatologist, Neurologist, General Physician, etc.

## 🛠️ Tech Stack

### Backend
- Flask (Python)
- PostgreSQL (or SQLite for development)
- Flask-JWT-Extended
- Flask-Mail
- Flask-Bcrypt
- SQLAlchemy
- OpenAI API (optional)

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- React Calendar
- Axios

## 📦 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost/healthcare_db
# Or for SQLite (development):
# DATABASE_URL=sqlite:///app.db

# Email Configuration (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# OpenAI API (optional)
OPENAI_API_KEY=your-openai-api-key
```

5. Initialize the database:
```bash
python -m backend.app
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://127.0.0.1:5000
```

4. Start the development server:
```bash
npm run dev
```

## 🚀 Running the Application

### Backend
```bash
cd backend
source venv/bin/activate
python -m backend.app
```

The backend will run on `http://127.0.0.1:5000`

### Frontend
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port Vite assigns)

## 👤 Creating an Admin User

To create an admin user, you'll need to do it manually in the database or create a script:

```python
from backend import create_app
from backend.models import User
from backend.extensions import db

app = create_app()
with app.app_context():
    admin = User(name="Admin", email="admin@example.com", role="admin")
    admin.set_password("admin123")
    db.session.add(admin)
    db.session.commit()
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Login

### Admin (requires admin role)
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/doctors` - List all doctors
- `POST /api/admin/doctors` - Create doctor
- `PUT /api/admin/doctors/<id>` - Update doctor
- `DELETE /api/admin/doctors/<id>` - Delete doctor
- `GET /api/admin/appointments` - List all appointments

### Doctors
- `GET /api/doctors/` - List all doctors (public)

### Appointments
- `POST /api/appointments/book` - Book appointment (patient only)
- `GET /api/appointments/my` - Get my appointments
- `POST /api/appointments/<id>/cancel` - Cancel appointment
- `PUT /api/appointments/<id>/status` - Update status (doctor only)
- `GET /api/appointments/available-slots` - Get available slots

### AI
- `POST /api/ai/recommend-doctor` - Get specialty recommendation

## 🎨 UI Features

- Modern, responsive design with Tailwind CSS
- Smooth animations and hover effects
- Calendar-based booking interface
- Role-aware navigation
- Clean card-based layouts
- Mobile-responsive

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based route protection
- Server-side validation
- CORS configuration

## 📧 Email Notifications

The system sends email notifications for:
- Appointment confirmations
- Appointment cancellations

Configure email settings in the `.env` file. For Gmail, you'll need to use an App Password.

## 🤖 AI Integration

The symptom analyzer uses:
1. **Rule-based system** (default) - Fast and free
2. **OpenAI GPT** (optional) - More accurate, requires API key

Set `OPENAI_API_KEY` in `.env` to enable OpenAI integration.

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

