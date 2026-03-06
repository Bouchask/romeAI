from .database import db

class Filiere(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    students = db.relationship('Student', backref='filiere', lazy=True)
    modules = db.relationship('Module', backref='filiere', lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class Professor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='professor')
    modules = db.relationship('Module', backref='professor', lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "role": self.role}

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='student')
    filiere_id = db.Column(db.Integer, db.ForeignKey('filiere.id'), nullable=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "email": self.email, 
            "role": self.role,
            "filiere_id": self.filiere_id,
            "filiere_name": self.filiere.name if self.filiere else "None"
        }

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    role = db.Column(db.String(20), default='admin')

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "role": self.role}

class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    filiere_id = db.Column(db.Integer, db.ForeignKey('filiere.id'), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey('professor.id'), nullable=True)

    def to_dict(self):
        return {
            "id": self.id, 
            "name": self.name, 
            "filiere_id": self.filiere_id,
            "professor_id": self.professor_id
        }

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    capacity = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "capacity": self.capacity}

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False) # Cours, TD, TP
    start_time = db.Column(db.String(50), nullable=False)
    end_time = db.Column(db.String(50), nullable=False)
    day = db.Column(db.String(20), nullable=False) # Monday, Tuesday...

    def to_dict(self):
        return {
            "id": self.id,
            "module_id": self.module_id,
            "module_name": self.module.name if self.module else "Unknown",
            "professor_name": self.module.professor.name if self.module and self.module.professor else "Unknown",
            "room_id": self.room_id,
            "room_name": self.room.name if self.room else "Unknown",
            "type": self.type,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "day": self.day
        }

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, 
            "module_id": self.module_id, 
            "room_id": self.room_id, 
            "date": self.date
        }
