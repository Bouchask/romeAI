import os
import shutil
from backend.app import create_app
from backend.database import db
from backend.models import Department, Filiere, Room, Professor, Module, Admin, Student, Exam

def nuclear_reset():
    db_path = "instance/campus.db"
    print(f"Targeting database at: {db_path}")
    
    # 1. Delete the database file if it exists
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print("Successfully deleted existing database file.")
        except Exception as e:
            print(f"Error deleting database: {e}. Please stop the backend server first!")
            return

    # 2. Recreate and seed
    app = create_app()
    with app.app_context():
        print("Recreating tables...")
        db.create_all()
        
        print("Seeding fresh data...")
        d1 = Department(name="Faculty of Science")
        db.session.add(d1)
        db.session.commit()

        f1 = Filiere(name="Computer Science", department_id=d1.id)
        db.session.add(f1)
        db.session.commit()

        r1 = Room(name="Amphi A", capacity=200, type="Amphi", status="active")
        r2 = Room(name="Room 101", capacity=30, type="Classroom", status="active")
        db.session.add_all([r1, r2])
        db.session.commit()

        p1 = Professor(name="Dr. Smith", email="smith@university.edu", role="professor", department_id=d1.id)
        db.session.add(p1)
        db.session.commit()

        m1 = Module(name="Data Structures", filiere_id=f1.id, professor_id=p1.id)
        m2 = Module(name="Algorithms", filiere_id=f1.id, professor_id=p1.id)
        db.session.add_all([m1, m2])
        db.session.commit()

        # SEED FAKE EXAMS
        print("Seeding Fake Exams...")
        e1 = Exam(module_id=m1.id, room_id=r1.id, date="2024-06-15", start_time="09:00", end_time="11:00", type="Normal", status="Published")
        e2 = Exam(module_id=m2.id, room_id=r2.id, date="2024-06-18", start_time="14:00", end_time="16:00", type="Normal", status="Published")
        db.session.add_all([e1, e2])
        
        # Admin & Student
        db.session.add(Admin(name="System Admin", email="admin@university.edu", role="admin"))
        db.session.add(Student(name="John Student", email="student@university.edu", role="student", filiere_id=f1.id, registration_number="STU001"))
        
        db.session.commit()
        print("Verification: Exam count in DB =", Exam.query.count())
        print("NUCLEAR RESET COMPLETE. Restart your backend now.")

if __name__ == "__main__":
    nuclear_reset()
