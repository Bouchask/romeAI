from .database import db
from datetime import datetime

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    
    # Relationships
    filieres = db.relationship('Filiere', backref='dept_ref', lazy=True)
    professors = db.relationship('Professor', backref='dept_ref', lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class Filiere(db.Model):
    __tablename__ = 'filieres'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    
    # Relationships
    students = db.relationship('Student', backref='filiere_obj', lazy=True)
    modules_list = db.relationship('Module', backref='filiere_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "department_id": self.department_id,
            "department_name": self.dept_ref.name if self.dept_ref else "None"
        }

class Professor(db.Model):
    __tablename__ = 'professors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='professor')
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    
    # Relationships
    modules_taught = db.relationship('Module', backref='professor_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "email": self.email, 
            "role": self.role,
            "department_id": self.department_id,
            "department_name": self.dept_ref.name if self.dept_ref else "None"
        }

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=True)
    role = db.Column(db.String(20), default='student')
    filiere_id = db.Column(db.Integer, db.ForeignKey('filieres.id'), nullable=True)
    
    # Relationships
    attendances = db.relationship('Attendance', backref='student_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "email": self.email, 
            "registration_number": self.registration_number,
            "role": self.role,
            "filiere_id": self.filiere_id,
            "filiere_name": self.filiere_obj.name if self.filiere_obj else "None",
            "department_name": self.filiere_obj.dept_ref.name if self.filiere_obj and self.filiere_obj.dept_ref else "None"
        }

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='admin')

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "role": self.role}

class Module(db.Model):
    __tablename__ = 'modules'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    filiere_id = db.Column(db.Integer, db.ForeignKey('filieres.id'), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey('professors.id'), nullable=True)
    
    # Relationships
    sessions = db.relationship('Session', backref='module_obj', lazy=True)
    exams = db.relationship('Exam', backref='module_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "filiere_id": self.filiere_id,
            "filiere_name": self.filiere_obj.name if self.filiere_obj else "None",
            "department_id": self.filiere_obj.department_id if self.filiere_obj else None,
            "department_name": self.filiere_obj.dept_ref.name if self.filiere_obj and self.filiere_obj.dept_ref else "None",
            "professor_id": self.professor_id,
            "professor_name": self.professor_obj.name if self.professor_obj else "None"
        }

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    capacity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), default='Classroom')
    status = db.Column(db.String(20), default='active')
    has_wifi = db.Column(db.Boolean, default=True)
    has_projector = db.Column(db.Boolean, default=True)
    lien_gps = db.Column(db.String(255), nullable=True)
    
    # Relationships
    sessions = db.relationship('Session', backref='room_obj', lazy=True)
    exams = db.relationship('Exam', backref='room_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "capacity": self.capacity,
            "type": self.type,
            "status": self.status,
            "has_wifi": self.has_wifi,
            "has_projector": self.has_projector,
            "lien_gps": self.lien_gps
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(50), nullable=True) 
    start_time = db.Column(db.String(50), nullable=False)
    end_time = db.Column(db.String(50), nullable=False)
    day = db.Column(db.String(20), nullable=False)
    is_cancelled = db.Column(db.Boolean, default=False)
    
    # Relationships
    attendances = db.relationship('Attendance', backref='session_obj', lazy=True)
    audits = db.relationship('AuditSession', backref='session_ref', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "module_id": self.module_id,
            "module_name": self.module_obj.name if self.module_obj else "Unknown",
            "professor_id": self.module_obj.professor_id if self.module_obj else None,
            "professor_name": self.module_obj.professor_obj.name if self.module_obj and self.module_obj.professor_obj else "Unknown",
            "room_id": self.room_id,
            "room_name": self.room_obj.name if self.room_obj else "Unknown",
            "room_gps": self.room_obj.lien_gps if self.room_obj else None,
            "type": self.type,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "day": self.day,
            "is_cancelled": self.is_cancelled
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=True)
    status = db.Column(db.String(20), default='present')
    date = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student_obj.name if self.student_obj else "Unknown",
            "session_id": self.session_id,
            "exam_id": self.exam_id,
            "status": self.status,
            "date": self.date
        }

class Exam(db.Model):
    __tablename__ = 'exam' 
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.String(20), nullable=True)
    end_time = db.Column(db.String(20), nullable=True)
    type = db.Column(db.String(20), default='Normal')
    status = db.Column(db.String(20), default='Published')
    
    # Relationships
    attendances = db.relationship('Attendance', backref='exam_obj', lazy=True)
    audits = db.relationship('AuditExam', backref='exam_ref', lazy=True)

    def to_dict(self):
        mod_name = self.module_obj.name if self.module_obj else "Unknown"
        fil_name = self.module_obj.filiere_obj.name if self.module_obj and self.module_obj.filiere_obj else "Unknown"
        r_name = self.room_obj.name if self.room_obj else "Unknown"
        r_gps = self.room_obj.lien_gps if self.room_obj else None

        return {
            "id": self.id, 
            "module_id": self.module_id, 
            "module_name": mod_name,
            "filiere_name": fil_name,
            "room_id": self.room_id, 
            "room_name": r_name,
            "room_gps": r_gps,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "type": self.type,
            "status": self.status
        }

class AuditSession(db.Model):
    __tablename__ = 'audit_session'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    field_changed = db.Column(db.String(50))
    old_value = db.Column(db.String(255))
    new_value = db.Column(db.String(255))
    modification_time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "field": self.field_changed,
            "old": self.old_value,
            "new": self.new_value,
            "time": self.modification_time.isoformat()
        }

class AuditExam(db.Model):
    __tablename__ = 'audit_exam'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    field_changed = db.Column(db.String(50))
    old_value = db.Column(db.String(255))
    new_value = db.Column(db.String(255))
    modification_time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "exam_id": self.exam_id,
            "field": self.field_changed,
            "old": self.old_value,
            "new": self.new_value,
            "time": self.modification_time.isoformat()
        }
