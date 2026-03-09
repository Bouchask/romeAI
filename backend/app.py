from flask import Flask
from flask_cors import CORS
from .database import db
from .config import Config
from .routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    
    app.register_blueprint(api_bp, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
        
        # --- Simple Migration Logic ---
        def add_column_if_missing(table, column, definition):
            try:
                db.session.execute(db.text(f"SELECT {column} FROM {table} LIMIT 1"))
            except Exception:
                db.session.rollback()
                try:
                    db.session.execute(db.text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()

        add_column_if_missing('students', 'role', "VARCHAR(20) DEFAULT 'student'")
        add_column_if_missing('students', 'registration_number', "VARCHAR(50)")
        add_column_if_missing('students', 'password', "VARCHAR(100) DEFAULT 'Yahya2004@'")
        
        add_column_if_missing('professors', 'role', "VARCHAR(20) DEFAULT 'professor'")
        add_column_if_missing('professors', 'department_id', "INTEGER")
        add_column_if_missing('professors', 'password', "VARCHAR(100) DEFAULT 'Yahya2004@'")

        add_column_if_missing('admins', 'password', "VARCHAR(100) DEFAULT 'Yahya2004@'")
        add_column_if_missing('rooms', 'type', "VARCHAR(50) DEFAULT 'Classroom'")
        add_column_if_missing('rooms', 'status', "VARCHAR(20) DEFAULT 'active'")
        add_column_if_missing('rooms', 'has_wifi', "BOOLEAN DEFAULT 1")
        add_column_if_missing('rooms', 'has_projector', "BOOLEAN DEFAULT 1")
        add_column_if_missing('rooms', 'lien_gps', "VARCHAR(255)")
        add_column_if_missing('exam', 'start_time', "VARCHAR(20)")
        add_column_if_missing('exam', 'end_time', "VARCHAR(20)")
        add_column_if_missing('exam', 'type', "VARCHAR(20) DEFAULT 'Normal'")
        add_column_if_missing('exam', 'status', "VARCHAR(20) DEFAULT 'Published'")
        add_column_if_missing('sessions', 'date', "VARCHAR(50)")
        add_column_if_missing('sessions', 'is_cancelled', "BOOLEAN DEFAULT 0")
        add_column_if_missing('attendance', 'exam_id', "INTEGER")
        add_column_if_missing('attendance', 'session_id', "INTEGER") 

        # Seed initial data if empty
        from .models import Filiere, Room, Professor, Module, Admin, Student, Department, Exam, Session
        if Department.query.count() == 0:
            print("Seeding fresh data for testing...")
            d1 = Department(name="Faculty of Science")
            db.session.add(d1)
            db.session.commit()

            f1 = Filiere(name="Computer Science", department_id=d1.id)
            db.session.add(f1)
            db.session.commit()
            
            r1 = Room(name="Amphi A", capacity=200, type="Amphi", status="active")
            db.session.add(r1)
            
            # DEFAULT PROFESSOR
            p1 = Professor(name="Dr. Smith", email="prof@test.com", role="professor", department_id=d1.id)
            db.session.add(p1)
            
            # DEFAULT ADMIN
            admin = Admin(name="System Admin", email="admin@test.com", role="admin")
            db.session.add(admin)

            # DEFAULT STUDENT
            student = Student(name="John Doe", email="student@test.com", role="student", filiere_id=f1.id, registration_number="STU001")
            db.session.add(student)
            
            db.session.commit()

            m1 = Module(name="Advanced Programming", filiere_id=f1.id, professor_id=p1.id)
            db.session.add(m1)
            db.session.commit()

            print("Seeding complete. Use prof@test.com / admin@test.com / student@test.com to login.")
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
