from flask import Blueprint, jsonify, request
from .models import db, Student, Professor, Filiere, Module, Room, Exam, Admin, Session

api_bp = Blueprint('api', __name__)

# --- Sessions ---
@api_bp.route('/sessions', methods=['GET'])
def get_sessions():
    sessions = Session.query.all()
    return jsonify([s.to_dict() for s in sessions])

@api_bp.route('/sessions', methods=['POST'])
def add_session():
    data = request.json
    new_session = Session(
        module_id=data['module_id'], 
        room_id=data['room_id'],
        type=data['type'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        day=data['day']
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify(new_session.to_dict()), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    role_requested = data.get('role', '').lower()

    # 1. Check the requested role first
    user = None
    if role_requested == 'student':
        user = Student.query.filter_by(email=email).first()
    elif role_requested == 'professor':
        user = Professor.query.filter_by(email=email).first()
    elif role_requested == 'admin':
        user = Admin.query.filter_by(email=email).first()

    if user:
        return jsonify(user.to_dict())
    
    # 2. If not found, check other tables to help the user
    roles_to_check = ['student', 'professor', 'admin']
    roles_to_check.remove(role_requested)
    
    for r in roles_to_check:
        found_other = None
        if r == 'student': found_other = Student.query.filter_by(email=email).first()
        elif r == 'professor': found_other = Professor.query.filter_by(email=email).first()
        elif r == 'admin': found_other = Admin.query.filter_by(email=email).first()
        
        if found_other:
            return jsonify({
                "message": f"This email is registered as a {r.capitalize()}. Please select the correct role above."
            }), 400

    return jsonify({"message": "Account not found. Please register first."}), 404

# --- Admins ---
@api_bp.route('/admins', methods=['GET'])
def get_admins():
    admins = Admin.query.all()
    return jsonify([a.to_dict() for a in admins])

@api_bp.route('/admins', methods=['POST'])
def add_admin():
    data = request.json
    email = data.get('email', '').lower()
    
    # Check if email exists in ANY table
    if Student.query.filter_by(email=email).first() or \
       Professor.query.filter_by(email=email).first() or \
       Admin.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 400

    new_admin = Admin(name=data['name'], email=email)
    db.session.add(new_admin)
    db.session.commit()
    return jsonify(new_admin.to_dict()), 201

# --- Students ---
@api_bp.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students])

@api_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    email = data.get('email', '').lower()

    if Student.query.filter_by(email=email).first() or \
       Professor.query.filter_by(email=email).first() or \
       Admin.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 400

    new_student = Student(name=data['name'], email=email, filiere_id=data.get('filiere_id'))
    db.session.add(new_student)
    db.session.commit()
    return jsonify(new_student.to_dict()), 201

@api_bp.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get_or_404(id)
    data = request.json
    student.name = data.get('name', student.name)
    student.email = data.get('email', student.email)
    student.filiere_id = data.get('filiere_id', student.filiere_id)
    db.session.commit()
    return jsonify(student.to_dict())

@api_bp.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return '', 204

# --- Modules ---
@api_bp.route('/modules', methods=['GET'])
def get_modules():
    modules = Module.query.all()
    return jsonify([m.to_dict() for m in modules])

# --- Professors ---
@api_bp.route('/professors', methods=['GET'])
def get_professors():
    profs = Professor.query.all()
    return jsonify([p.to_dict() for p in profs])

@api_bp.route('/professors', methods=['POST'])
def add_professor():
    data = request.json
    email = data.get('email', '').lower()

    if Student.query.filter_by(email=email).first() or \
       Professor.query.filter_by(email=email).first() or \
       Admin.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 400

    new_prof = Professor(name=data['name'], email=email)
    db.session.add(new_prof)
    db.session.commit()
    return jsonify(new_prof.to_dict()), 201

# --- Rooms ---
@api_bp.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([r.to_dict() for r in rooms])

@api_bp.route('/rooms', methods=['POST'])
def add_room():
    data = request.json
    new_room = Room(name=data['name'], capacity=data['capacity'])
    db.session.add(new_room)
    db.session.commit()
    return jsonify(new_room.to_dict()), 201

# --- Exams ---
@api_bp.route('/exams', methods=['GET'])
def get_exams():
    exams = Exam.query.all()
    return jsonify([e.to_dict() for e in exams])

@api_bp.route('/exams', methods=['POST'])
def add_exam():
    data = request.json
    new_exam = Exam(module_id=data['module_id'], room_id=data['room_id'], date=data['date'])
    db.session.add(new_exam)
    db.session.commit()
    return jsonify(new_exam.to_dict()), 201

# --- Filieres ---
@api_bp.route('/filieres', methods=['GET'])
def get_filieres():
    filieres = Filiere.query.all()
    return jsonify([f.to_dict() for f in filieres])
