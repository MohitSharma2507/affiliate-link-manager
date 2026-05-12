#!/usr/bin/env bash
set -e

pip install -r requirements.txt

# Initialize the database (create tables + default admin)
python -c "
from app import app, db, Admin
with app.app_context():
    db.create_all()
    if not Admin.query.first():
        from app import Admin
        admin = Admin(username='octakid')
        admin.set_password('octakid@2610')
        db.session.add(admin)
        db.session.commit()
        print('Admin created.')
    else:
        print('Admin already exists.')
"
