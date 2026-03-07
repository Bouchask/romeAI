from .database import db

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    
    # One-to-Many
    filieres = db.relationship('Filiere', backref='department_obj', lazy=True)
    professors = db.relationship('Professor', backref='department_obj', lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class Filiere(db.Model):
    __tablename__ = 'filieres'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    
    # One-to-Many
    students = db.relationship('Student', backref='filiere_obj', lazy=True)
    modules = db.relationship('Module', backref='filiere_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "department_id": self.department_id,
            "department_name": self.department_obj.name if self.department_obj else "None"
        }

class Professor(db.Model):
    __tablename__ = 'professors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='professor')
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    
    # One-to-Many
    modules = db.relationship('Module', backref='professor_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "email": self.email, 
            "role": self.role,
            "department_id": self.department_id,
            "department_name": self.department_obj.name if self.department_obj else "None"
        }

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=True)
    role = db.Column(db.String(20), default='student')
    filiere_id = db.Column(db.Integer, db.ForeignKey('filieres.id'), nullable=True)
    
    # One-to-Many
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
            "department_name": self.filiere_obj.department_obj.name if self.filiere_obj and self.filiere_obj.department_obj else "None"
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
    
    # One-to-Many
    sessions = db.relationship('Session', backref='module_obj', lazy=True)
    exams = db.relationship('Exam', backref='module_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "filiere_id": self.filiere_id,
            "filiere_name": self.filiere_obj.name if self.filiere_obj else "None",
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
    
    # One-to-Many
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
            "has_projector": self.has_projector
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(50), nullable=False)
    end_time = db.Column(db.String(50), nullable=False)
    day = db.Column(db.String(20), nullable=False)
    is_cancelled = db.Column(db.Boolean, default=False)
    
    # One-to-Many
    attendances = db.relationship('Attendance', backref='session_obj', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "module_id": self.module_id,
            "module_name": self.module_obj.name if self.module_obj else "Unknown",
            "professor_name": self.module_obj.professor_obj.name if self.module_obj and self.module_obj.professor_obj else "Unknown",
            "room_id": self.room_id,
            "room_name": self.room_obj.name if self.room_obj else "Unknown",
            "type": self.type,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "day": self.day,
            "is_cancelled": self.is_cancelled
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    status = db.Column(db.String(20), default='present')
    date = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student_obj.name if self.student_obj else "Unknown",
            "session_id": self.session_id,
            "status": self.status,
            "date": self.date
        }

class Exam(db.Model):
    __tablename__ = 'exam' # Explicitly singular
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.String(20), nullable=True)
    end_time = db.Column(db.String(20), nullable=True)
    type = db.Column(db.String(20), default='Normal')
    status = db.Column(db.String(20), default='Published')

    def to_dict(self):
        mod_name = self.module_obj.name if self.module_obj else "Unknown"
        fil_name = self.module_obj.filiere_obj.name if self.module_obj and self.module_obj.filiere_obj else "Unknown"
        r_name = self.room_obj.name if self.room_obj else "Unknown"

        return {
            "id": self.id, 
            "module_id": self.module_id, 
            "module_name": mod_name,
            "filiere_name": fil_name,
            "room_id": self.room_id, 
            "room_name": r_name,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "type": self.type,
            "status": self.status
        }
