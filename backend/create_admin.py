#!/usr/bin/env python3
"""
Script to create an admin user for the Healthcare Appointment System.
Run this script to create your first admin account.

Usage:
    python create_admin.py
    or
    python create_admin.py --email admin@example.com --password admin123 --name "Admin User"
"""

import sys
import os
import argparse

# Add parent directory to path to allow imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.models import User
from backend.extensions import db

def create_admin_user(email, password, name="Admin"):
    """Create an admin user in the database"""
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        existing = User.query.filter_by(email=email).first()
        if existing:
            if existing.role == "admin":
                print(f"❌ Admin user with email '{email}' already exists!")
                return False
            else:
                print(f"❌ User with email '{email}' exists but is not an admin (role: {existing.role})")
                response = input("Do you want to convert this user to admin? (yes/no): ").lower()
                if response == "yes":
                    existing.role = "admin"
                    existing.set_password(password)
                    db.session.commit()
                    print(f"✅ User '{email}' has been converted to admin!")
                    return True
                else:
                    return False
        
        # Create new admin user
        admin = User(name=name, email=email, role="admin")
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Role: admin")
        print(f"\n📝 You can now login with these credentials.")
        return True

def main():
    parser = argparse.ArgumentParser(description="Create an admin user for Healthcare Appointment System")
    parser.add_argument("--email", type=str, help="Admin email address")
    parser.add_argument("--password", type=str, help="Admin password")
    parser.add_argument("--name", type=str, default="Admin", help="Admin name (default: Admin)")
    
    args = parser.parse_args()
    
    # Interactive mode if no arguments provided
    if not args.email or not args.password:
        print("=" * 60)
        print("🏥 Healthcare Appointment System - Admin User Creation")
        print("=" * 60)
        print()
        
        email = input("Enter admin email: ").strip()
        if not email:
            print("❌ Email is required!")
            sys.exit(1)
        
        password = input("Enter admin password: ").strip()
        if not password:
            print("❌ Password is required!")
            sys.exit(1)
        
        confirm_password = input("Confirm admin password: ").strip()
        if password != confirm_password:
            print("❌ Passwords do not match!")
            sys.exit(1)
        
        name = input("Enter admin name (default: Admin): ").strip() or "Admin"
    else:
        email = args.email
        password = args.password
        name = args.name
    
    # Validate email format (basic)
    if "@" not in email or "." not in email.split("@")[1]:
        print("❌ Invalid email format!")
        sys.exit(1)
    
    # Validate password length
    if len(password) < 6:
        print("❌ Password must be at least 6 characters long!")
        sys.exit(1)
    
    # Create admin user
    success = create_admin_user(email, password, name)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()

