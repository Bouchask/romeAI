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
        def add_column_if_missing(table, column, definition):
            try:
                db.session.execute(db.text(f"SELECT {column} FROM {table} LIMIT 1"))
            except Exception:
                db.session.rollback()
                print(f"Adding missing column '{column}' to table '{table}'...")
                try:
                    db.session.execute(db.text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
                    db.session.commit()
                except Exception as e:
                    print(f"Failed to add column: {e}")
                    db.session.rollback()

        add_column_if_missing('students', 'role', "VARCHAR(20) DEFAULT 'student'")
        add_column_if_missing('students', 'registration_number', "VARCHAR(50)")
        add_column_if_missing('professors', 'role', "VARCHAR(20) DEFAULT 'professor'")
        add_column_if_missing('professors', 'department_id', "INTEGER")
        add_column_if_missing('rooms', 'type', "VARCHAR(50) DEFAULT 'Classroom'")
        add_column_if_missing('rooms', 'status', "VARCHAR(20) DEFAULT 'active'")
        add_column_if_missing('rooms', 'has_wifi', "BOOLEAN DEFAULT 1")
        add_column_if_missing('rooms', 'has_projector', "BOOLEAN DEFAULT 1")
        add_column_if_missing('exam', 'start_time', "VARCHAR(20)")
        add_column_if_missing('exam', 'end_time', "VARCHAR(20)")
        add_column_if_missing('exam', 'type', "VARCHAR(20) DEFAULT 'Normal'")
        add_column_if_missing('exam', 'status', "VARCHAR(20) DEFAULT 'Published'")
        add_column_if_missing('sessions', 'is_cancelled', "BOOLEAN DEFAULT 0")

        # Seed initial data if empty
        from .models import Filiere, Room, Professor, Module, Admin, Student, Department, Exam
        if Department.query.count() == 0:
            print("Seeding Departments, Filieres, and Modules...")
            d1 = Department(name="Faculty of Science")
            d2 = Department(name="Faculty of Engineering")
            d3 = Department(name="Business School")
            db.session.add_all([d1, d2, d3])
            db.session.commit()

            f1 = Filiere(name="Computer Science", department_id=d1.id)
            f2 = Filiere(name="Mechanical Engineering", department_id=d2.id)
            f3 = Filiere(name="Business Administration", department_id=d3.id)
            db.session.add_all([f1, f2, f3])
            db.session.commit()
            
            r1 = Room(name="Amphi A", capacity=200)
            r2 = Room(name="Room 101", capacity=30)
            r3 = Room(name="Lab 1", capacity=20)
            db.session.add_all([r1, r2, r3])
            
            p1 = Professor(name="Dr. Smith", email="smith@university.edu", role="professor", department_id=d1.id)
            p2 = Professor(name="Pr. Johnson", email="johnson@university.edu", role="professor", department_id=d2.id)
            db.session.add_all([p1, p2])
            
            admin = Admin(name="System Admin", email="admin@university.edu", role="admin")
            db.session.add(admin)

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

            # Seed some Exams
            if not Exam.query.first():
                exams = [
                    Exam(module_id=m1.id, room_id=r1.id, date="2024-06-15", start_time="09:00", end_time="11:00", type="Normal", status="Published"),
                    Exam(module_id=m2.id, room_id=r2.id, date="2024-06-18", start_time="14:00", end_time="16:00", type="Normal", status="Published"),
                    Exam(module_id=m3.id, room_id=r1.id, date="2024-06-20", start_time="08:30", end_time="10:30", type="Rattrapage", status="Published"),
                    Exam(module_id=m5.id, room_id=r3.id, date="2024-06-22", start_time="10:00", end_time="12:00", type="Normal", status="Draft"),
                ]
                db.session.add_all(exams)
                db.session.commit()

            print("Seeding complete.")
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
