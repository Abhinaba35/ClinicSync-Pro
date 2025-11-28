# 🚀 Quick Start Guide - Admin Login

## Step 1: Create Admin User

Since there's no default admin account, you need to create one first.

### Option A: Using the Script (Easiest)

1. **Navigate to project root:**
   ```bash
   cd /Users/abhinabadas/Desktop/MyP/Hos
   ```

2. **Activate virtual environment:**
   ```bash
   cd backend
   source venv/bin/activate
   ```

3. **Initialize database (if not done):**
   ```bash
   python -m backend.app
   ```
   Wait for "Backend running!" then press `Ctrl+C` to stop.

4. **Create admin user:**
   ```bash
   cd ..  # Go back to project root
   python3 -c "
from backend.app import create_app
from backend.models import User
from backend.extensions import db

app = create_app()
with app.app_context():
    # Check if admin exists
    admin = User.query.filter_by(email='admin@example.com').first()
    if not admin:
        admin = User(name='Admin', email='admin@example.com', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('✅ Admin created! Email: admin@example.com, Password: admin123')
    else:
        print('ℹ️  Admin already exists')
"
   ```

### Option B: Using Python Interactive Shell

1. **Start Python:**
   ```bash
   cd backend
   source venv/bin/activate
   python3
   ```

2. **Run these commands:**
   ```python
   from backend.app import create_app
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

3. **Exit Python:**
   ```python
   exit()
   ```

## Step 2: Start the Application

### Start Backend:
```bash
cd backend
source venv/bin/activate
python -m backend.app
```

### Start Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Step 3: Login as Admin

1. Open browser: `http://localhost:5173`
2. Click **"Login"**
3. Enter credentials:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`
4. You'll be redirected to the Admin Dashboard

## Default Admin Credentials

- **Email:** `admin@example.com`
- **Password:** `admin123`

⚠️ **Change these credentials in production!**

## What You Can Do as Admin

- ✅ View analytics dashboard
- ✅ Create doctor accounts
- ✅ Edit/Delete doctors
- ✅ View all appointments
- ✅ Manage the entire system

