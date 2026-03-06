from flask import Flask
from flask_cors import CORS
from .database import db
from .config import Config
from .routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    
    app.register_blueprint(api_bp, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
        
        # --- Simple Migration Logic for existing databases ---
        try:
            # Check if 'role' column exists in student table
            db.session.execute(db.text("SELECT role FROM student LIMIT 1"))
        except Exception:
            db.session.rollback()
            print("Detected missing 'role' column. Patching database...")
            try:
                db.session.execute(db.text("ALTER TABLE student ADD COLUMN role VARCHAR(20) DEFAULT 'student'"))
                db.session.execute(db.text("ALTER TABLE professor ADD COLUMN role VARCHAR(20) DEFAULT 'professor'"))
                db.session.commit()
                print("Database patched successfully.")
            except Exception as e:
                print(f"Migration failed: {e}")
                db.session.rollback()

        # Seed initial data if empty
        from .models import Filiere, Room, Professor, Module, Admin, Student
        if not Filiere.query.first():
            f1 = Filiere(name="Computer Science")
            f2 = Filiere(name="Mechanical Engineering")
            f3 = Filiere(name="Business Administration")
            db.session.add_all([f1, f2, f3])
            db.session.commit() # Commit to get IDs
            
            r1 = Room(name="Amphi A", capacity=200)
            r2 = Room(name="Room 101", capacity=30)
            r3 = Room(name="Lab 1", capacity=20)
            db.session.add_all([r1, r2, r3])
            
            p1 = Professor(name="Dr. Smith", email="smith@university.edu", role="professor")
            p2 = Professor(name="Pr. Johnson", email="johnson@university.edu", role="professor")
            db.session.add_all([p1, p2])
            
            # Seed a default Admin
            admin = Admin(name="System Admin", email="admin@university.edu", role="admin")
            db.session.add(admin)

            # Seed a default Student
            student = Student(name="John Student", email="student@university.edu", role="student", filiere_id=f1.id)
            db.session.add(student)
            
            db.session.commit()

            m1 = Module(name="Data Structures", filiere_id=f1.id, professor_id=p1.id)
            m2 = Module(name="Algorithms", filiere_id=f1.id, professor_id=p1.id)
            m3 = Module(name="Thermodynamics", filiere_id=f2.id, professor_id=p2.id)
            m4 = Module(name="Fluid Mechanics", filiere_id=f2.id, professor_id=p2.id)
            m5 = Module(name="Marketing 101", filiere_id=f3.id, professor_id=p1.id)
            m6 = Module(name="Microeconomics", filiere_id=f3.id, professor_id=p2.id)
            
            db.session.add_all([m1, m2, m3, m4, m5, m6])
            db.session.commit()
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
