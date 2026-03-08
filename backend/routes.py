from flask import Blueprint, jsonify, request
from .models import db, Student, Professor, Filiere, Module, Room, Exam, Admin, Session

api_bp = Blueprint('api', __name__)

# --- Departments ---
@api_bp.route('/departments', methods=['GET'])
def get_departments():
    deps = Department.query.all()
    return jsonify([d.to_dict() for d in deps])

@api_bp.route('/departments', methods=['POST'])
def add_department():
    data = request.json
    new_dep = Department(name=data['name'])
    db.session.add(new_dep)
    db.session.commit()
    return jsonify(new_dep.to_dict()), 201

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

    new_prof = Professor(
        name=data['name'], 
        email=email,
        department_id=data.get('department_id')
    )
    db.session.add(new_prof)
    db.session.flush() # Get prof ID

    # If a module was selected, link it
    module_id = data.get('module_id')
    if module_id:
        mod = Module.query.get(module_id)
        if mod:
            mod.professor_id = new_prof.id

    db.session.commit()
    return jsonify(new_prof.to_dict()), 201

@api_bp.route('/professors/<int:id>', methods=['PUT'])
def update_professor(id):
    prof = Professor.query.get_or_404(id)
    data = request.json
    prof.name = data.get('name', prof.name)
    prof.email = data.get('email', prof.email)
    prof.department_id = data.get('department_id', prof.department_id)
    
    # Update module link if provided
    module_id = data.get('module_id')
    if module_id:
        # Clear old links if any (simple logic: one module per prof for this demo)
        old_mods = Module.query.filter_by(professor_id=prof.id).all()
        for m in old_mods: m.professor_id = None
        
        new_mod = Module.query.get(module_id)
        if new_mod: new_mod.professor_id = prof.id

    db.session.commit()
    return jsonify(prof.to_dict())

@api_bp.route('/professors/<int:id>', methods=['DELETE'])
def delete_professor(id):
    prof = Professor.query.get_or_404(id)
    # Clear module associations before deleting
    mods = Module.query.filter_by(professor_id=prof.id).all()
    for m in mods: m.professor_id = None
    
    db.session.delete(prof)
    db.session.commit()
    return '', 204

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

@api_bp.route('/rooms/<int:id>', methods=['PUT'])
def update_room(id):
    room = Room.query.get_or_404(id)
    data = request.json
    room.name = data.get('name', room.name)
    room.capacity = data.get('capacity', room.capacity)
    room.type = data.get('type', room.type)
    room.status = data.get('status', room.status)
    room.has_wifi = data.get('has_wifi', room.has_wifi)
    room.has_projector = data.get('has_projector', room.has_projector)
    db.session.commit()
    return jsonify(room.to_dict())

# --- Exams ---
@api_bp.route('/exams', methods=['GET'])
def get_exams():
    exams = Exam.query.all()
    return jsonify([e.to_dict() for e in exams])

@api_bp.route('/exams', methods=['POST'])
def add_exam():
    data = request.json
    print(f"DEBUG: Incoming Exam Data: {data}")
    
    try:
        # Get required IDs and ensure they are integers
        mid = data.get('module_id')
        rid = data.get('room_id')
        
        if not mid or not rid:
            return jsonify({"message": "Module ID and Room ID are required"}), 400

        new_exam = Exam(
            module_id=int(mid), 
            room_id=int(rid), 
            date=data.get('date', '2024-01-01'),
            start_time=data.get('start_time', '09:00'),
            end_time=data.get('end_time', '11:00'),
            type=data.get('type', 'Normal'),
            status=data.get('status', 'Published')
        )
        db.session.add(new_exam)
        db.session.commit()
        print(f"DEBUG: Created Exam ID: {new_exam.id}")
        return jsonify(new_exam.to_dict()), 201
    except Exception as e:
        print(f"DEBUG: Exception in add_exam: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

# --- Filieres ---
@api_bp.route('/filieres', methods=['GET'])
def get_filieres():
    filieres = Filiere.query.all()
    return jsonify([f.to_dict() for f in filieres])
