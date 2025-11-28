# 👤 Admin User Setup Guide

## How to Create an Admin User

Since admin users cannot be registered through the web interface (for security), you need to create one using a Python script.

### Method 1: Interactive Script (Recommended)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Activate your virtual environment:**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Make sure the database is initialized:**
   ```bash
   python -m backend.app
   ```
   (Press Ctrl+C to stop after the database is created)

4. **Run the admin creation script:**
   ```bash
   python create_admin.py
   ```

5. **Follow the prompts:**
   - Enter admin email (e.g., `admin@example.com`)
   - Enter admin password (e.g., `admin123`)
   - Confirm password
   - Enter admin name (default: "Admin")

### Method 2: Command Line Arguments

```bash
python create_admin.py --email admin@example.com --password admin123 --name "Admin User"
```

### Method 3: Python Script (Manual)

If you prefer to create it manually, you can use Python:

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
    print("Admin user created!")
```

## Default Admin Credentials (Example)

After running the script, you can use these credentials to login:

- **Email:** `admin@example.com` (or whatever you set)
- **Password:** `admin123` (or whatever you set)

## Login Steps

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   python -m backend.app
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and go to: `http://localhost:5173`

4. Click on "Login"

5. Enter your admin credentials

6. You'll be redirected to the Admin Dashboard

## Admin Dashboard Features

Once logged in as admin, you can:
- ✅ View analytics (total doctors, patients, appointments)
- ✅ Create new doctor accounts
- ✅ Edit doctor details
- ✅ Delete doctors
- ✅ View all appointments in the system

## Troubleshooting

### "Admin user already exists"
- The email you're trying to use is already registered
- Either use a different email or convert the existing user to admin

### "Database not initialized"
- Run `python -m backend.app` first to create the database tables

### "Module not found"
- Make sure you're in the backend directory
- Make sure your virtual environment is activated
- Make sure all dependencies are installed: `pip install -r requirements.txt`

## Security Note

⚠️ **Important:** Change the default admin password in production! Use a strong password.

