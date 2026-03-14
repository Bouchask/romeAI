from flask import Blueprint, jsonify, request
from .models import db, Student, Professor, Filiere, Module, Room, Exam, Admin, Session, Department, Attendance, AuditSession, AuditExam, AuditModule
from datetime import datetime

api_bp = Blueprint('api', __name__)

def check_time_overlap(start1, end_time1, start2, end_time2):
    return not (end_time1 <= start2 or end_time2 <= start1)

# --- Auth ---
@api_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    role = data.get('role', '').lower()
    pwd = data.get('password', '')
    
    user = None
    if role == 'student': user = Student.query.filter_by(email=email).first()
    elif role == 'professor': user = Professor.query.filter_by(email=email).first()
    elif role == 'admin': user = Admin.query.filter_by(email=email).first()

    if user:
        if user.password == pwd: return jsonify(user.to_dict())
        return jsonify({"message": "Invalid password."}), 401
    return jsonify({"message": "Account not found."}), 404

# --- Departments ---
@api_bp.route('/departments', methods=['GET'])
def get_departments():
    return jsonify([d.to_dict() for d in Department.query.all()])

@api_bp.route('/departments', methods=['POST'])
def add_department():
    data = request.json
    new_dep = Department(name=data['name'])
    db.session.add(new_dep)
    db.session.commit()
    return jsonify(new_dep.to_dict()), 201

# --- Filieres ---
@api_bp.route('/filieres', methods=['GET'])
def get_filieres():
    return jsonify([f.to_dict() for f in Filiere.query.all()])

@api_bp.route('/filieres', methods=['POST'])
def add_filiere():
    data = request.json
    new_f = Filiere(name=data['name'], department_id=data['department_id'])
    db.session.add(new_f)
    db.session.commit()
    return jsonify(new_f.to_dict()), 201

# --- Modules ---
@api_bp.route('/modules', methods=['GET'])
def get_modules():
    return jsonify([m.to_dict() for m in Module.query.all()])

@api_bp.route('/modules/<int:id>', methods=['PUT'])
def update_module(id):
    mod = Module.query.get_or_404(id)
    data = request.json
    if 'professor_id' in data:
        p_id = data['professor_id']
        if p_id and Module.query.filter_by(professor_id=int(p_id)).count() >= 3:
            return jsonify({"message": "Professor at max load"}), 400
        mod.professor_id = int(p_id) if p_id else None
    mod.name = data.get('name', mod.name)
    db.session.commit()
    return jsonify(mod.to_dict())

@api_bp.route('/modules', methods=['POST'])
def add_module():
    data = request.json
    try:
        f_id = int(data['filiere_id'])
        if Module.query.filter_by(filiere_id=f_id).count() >= 7: return jsonify({"message": "Filiere full"}), 400
        new_m = Module(name=data['name'], filiere_id=f_id, professor_id=data.get('professor_id'))
        db.session.add(new_m)
        db.session.flush()
        db.session.add(AuditModule(module_id=new_m.id, field_changed="CREATION", old_value="None", new_value=f"New module: {new_m.name}"))
        db.session.commit()
        return jsonify(new_m.to_dict()), 201
    except Exception as e:
        db.session.rollback(); return jsonify({"message": str(e)}), 500

# --- Sessions ---
@api_bp.route('/sessions', methods=['GET'])
def get_sessions():
    return jsonify([s.to_dict() for s in Session.query.all()])

@api_bp.route('/sessions', methods=['POST'])
def add_session():
    data = request.json
    try:
        mid, rid = int(data['module_id']), int(data['room_id'])
        date_str, start, end = data['date'], data['start_time'], data['end_time']
        
        # Check for overlap with other teaching sessions
        conf_sessions = Session.query.filter_by(room_id=rid, date=date_str).all()
        for s in conf_sessions:
            if check_time_overlap(start, end, s.start_time, s.end_time):
                return jsonify({"message": f"Room already booked for a session from {s.start_time} to {s.end_time}"}), 400
        
        # Check for overlap with exams
        conf_exams = Exam.query.filter_by(room_id=rid, date=date_str).all()
        for e in conf_exams:
            if check_time_overlap(start, end, e.start_time, e.end_time):
                return jsonify({"message": f"Room already booked for an exam from {e.start_time} to {e.end_time}"}), 400

        new_session = Session(
            module_id=mid, 
            room_id=rid, 
            type=data['type'], 
            date=date_str, 
            start_time=start, 
            end_time=end, 
            day=data['day']
        )
        db.session.add(new_session)
        db.session.flush() # Get session ID
        
        # Add creation audit for notification
        db.session.add(AuditSession(
            session_id=new_session.id,
            field_changed="CREATION",
            old_value="None",
            new_value=f"{new_session.type} scheduled"
        ))
        
        db.session.commit()
        return jsonify(new_session.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@api_bp.route('/sessions/<int:id>', methods=['PUT'])
def update_session(id):
    session = Session.query.get_or_404(id)
    data = request.json
    try:
        new_rid = int(data.get('room_id', session.room_id))
        new_date = data.get('date', session.date)
        new_start = data.get('start_time', session.start_time)
        new_end = data.get('end_time', session.end_time)

        # Check for overlap excluding current session
        conf_sessions = Session.query.filter(Session.room_id == new_rid, Session.date == new_date, Session.id != session.id).all()
        for s in conf_sessions:
            if check_time_overlap(new_start, new_end, s.start_time, s.end_time):
                return jsonify({"message": "Room booked for another session"}), 400
        
        conf_exams = Exam.query.filter_by(room_id=new_rid, date=new_date).all()
        for e in conf_exams:
            if check_time_overlap(new_start, new_end, e.start_time, e.end_time):
                return jsonify({"message": "Room booked for an exam"}), 400

        if int(data.get('room_id', session.room_id)) != session.room_id:
            db.session.add(AuditSession(session_id=session.id, field_changed="ROOM", old_value=str(session.room_id), new_value=str(data['room_id'])))
            session.room_id = int(data['room_id'])
        if data.get('date') and data['date'] != session.date:
            db.session.add(AuditSession(session_id=session.id, field_changed="DATE", old_value=str(session.date), new_value=str(data['date'])))
            session.date = data['date']
            
        session.start_time = new_start
        session.end_time = new_end
        db.session.commit()
        return jsonify(session.to_dict())
    except Exception as ex:
        db.session.rollback()
        return jsonify({"message": str(ex)}), 500

@api_bp.route('/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    s = Session.query.get_or_404(id); db.session.delete(s); db.session.commit(); return '', 204

# --- Audits ---
@api_bp.route('/audits/sessions', methods=['GET'])
def get_session_audits():
    fid = request.args.get('filiere_id')
    query = AuditSession.query.join(Session).join(Module)
    if fid: query = query.filter(Module.filiere_id == int(fid))
    return jsonify([a.to_dict() for a in query.order_by(AuditSession.modification_time.desc()).all()])

@api_bp.route('/audits/exams', methods=['GET'])
def get_exam_audits():
    fid = request.args.get('filiere_id')
    query = AuditExam.query.join(Exam).join(Module)
    if fid: query = query.filter(Module.filiere_id == int(fid))
    return jsonify([a.to_dict() for a in query.order_by(AuditExam.modification_time.desc()).all()])

@api_bp.route('/audits/modules', methods=['GET'])
def get_module_audits():
    fid = request.args.get('filiere_id')
    query = AuditModule.query.join(Module)
    if fid: query = query.filter(Module.filiere_id == int(fid))
    return jsonify([a.to_dict() for a in query.order_by(AuditModule.modification_time.desc()).all()])

# --- Users ---
@api_bp.route('/students', methods=['GET'])
def get_students(): return jsonify([s.to_dict() for s in Student.query.all()])

@api_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    new_s = Student(name=data['name'], email=data['email'].lower(), filiere_id=data.get('filiere_id'), password=data.get('password', 'Yahya2004@'))
    db.session.add(new_s); db.session.commit(); return jsonify(new_s.to_dict()), 201

@api_bp.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    s = Student.query.get_or_404(id); data = request.json
    s.name, s.filiere_id = data.get('name', s.name), data.get('filiere_id', s.filiere_id)
    if data.get('password'): s.password = data['password']
    db.session.commit(); return jsonify(s.to_dict())

@api_bp.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    s = Student.query.get_or_404(id); db.session.delete(s); db.session.commit(); return '', 204

@api_bp.route('/professors', methods=['GET'])
def get_professors(): return jsonify([p.to_dict() for p in Professor.query.all()])

@api_bp.route('/professors', methods=['POST'])
def add_professor():
    data = request.json
    new_p = Professor(name=data['name'], email=data['email'].lower(), department_id=data.get('department_id'), password=data.get('password', 'Yahya2004@'))
    db.session.add(new_p); db.session.flush()
    if data.get('module_id'):
        m = Module.query.get(data['module_id'])
        if m: m.professor_id = new_p.id
    db.session.commit(); return jsonify(new_p.to_dict()), 201

@api_bp.route('/professors/<int:id>', methods=['PUT'])
def update_professor(id):
    p = Professor.query.get_or_404(id); data = request.json
    p.name, p.department_id = data.get('name', p.name), data.get('department_id', p.department_id)
    if data.get('password'): p.password = data['password']
    db.session.commit(); return jsonify(p.to_dict())

@api_bp.route('/professors/<int:id>', methods=['DELETE'])
def delete_professor(id):
    p = Professor.query.get_or_404(id); db.session.delete(p); db.session.commit(); return '', 204

# --- Rooms ---
@api_bp.route('/rooms', methods=['GET'])
def get_rooms(): return jsonify([r.to_dict() for r in Room.query.all()])

@api_bp.route('/rooms', methods=['POST'])
def add_room():
    data = request.json
    new_r = Room(name=data['name'], capacity=data['capacity'], lien_gps=data.get('lien_gps'))
    db.session.add(new_r); db.session.commit(); return jsonify(new_r.to_dict()), 201

@api_bp.route('/rooms/<int:id>', methods=['PUT'])
def update_room(id):
    r = Room.query.get_or_404(id)
    data = request.json
    r.name = data.get('name', r.name)
    r.capacity = data.get('capacity', r.capacity)
    r.type = data.get('type', r.type)
    r.status = data.get('status', r.status)
    r.lien_gps = data.get('lien_gps', r.lien_gps)
    r.has_wifi = data.get('has_wifi', r.has_wifi)
    r.has_projector = data.get('has_projector', r.has_projector)
    db.session.commit()
    return jsonify(r.to_dict())

# --- Exams ---
@api_bp.route('/exams', methods=['GET'])
def get_exams(): return jsonify([e.to_dict() for e in Exam.query.all()])

@api_bp.route('/exams', methods=['POST'])
def add_exam():
    data = request.json
    try:
        mid = int(data['module_id'])
        etype = data.get('type', 'Normal')
        
        # Rule: Only one Normal and one Rattrapage per module
        existing_exams = Exam.query.filter_by(module_id=mid).all()
        has_normal = any(e.type == 'Normal' for e in existing_exams)
        has_ratt = any(e.type == 'Rattrapage' for e in existing_exams)
        
        if etype == 'Normal' and has_normal:
            return jsonify({"message": "A Normal session exam already exists for this module."}), 400
        if etype == 'Rattrapage' and has_ratt:
            return jsonify({"message": "A Rattrapage session exam already exists for this module."}), 400
        if has_normal and has_ratt:
            return jsonify({"message": "Both Normal and Rattrapage exams already exist for this module. No more exams allowed."}), 400

        rid = int(data['room_id'])
        date_str, start, end = data['date'], data['start_time'], data['end_time']
        
        # Check for overlap with other exams in the same room
        conf_exams = Exam.query.filter_by(room_id=rid, date=date_str).all()
        for e in conf_exams:
            if check_time_overlap(start, end, e.start_time, e.end_time):
                return jsonify({"message": f"Room already booked for an exam from {e.start_time} to {e.end_time}"}), 400
        
        # Check for overlap with teaching sessions in the same room
        conf_sessions = Session.query.filter_by(room_id=rid, date=date_str).all()
        for s in conf_sessions:
            if check_time_overlap(start, end, s.start_time, s.end_time):
                return jsonify({"message": f"Room already booked for a teaching session from {s.start_time} to {s.end_time}"}), 400

        new_e = Exam(
            module_id=int(data['module_id']), 
            room_id=rid, 
            date=date_str, 
            start_time=start, 
            end_time=end, 
            type=data.get('type', 'Normal')
        )
        db.session.add(new_e)
        db.session.flush() # Get exam ID
        
        # Add creation audit for notification
        db.session.add(AuditExam(
            exam_id=new_e.id,
            field_changed="CREATION",
            old_value="None",
            new_value=f"Exam ({new_e.type}) scheduled"
        ))
        
        db.session.commit()
        return jsonify(new_e.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@api_bp.route('/exams/<int:id>', methods=['PUT'])
def update_exam(id):
    e = Exam.query.get_or_404(id)
    data = request.json
    try:
        new_rid = int(data.get('room_id', e.room_id))
        new_date = data.get('date', e.date)
        new_start = data.get('start_time', e.start_time)
        new_end = data.get('end_time', e.end_time)

        # Check for overlap excluding current exam
        conf_exams = Exam.query.filter(Exam.room_id == new_rid, Exam.date == new_date, Exam.id != e.id).all()
        for ex in conf_exams:
            if check_time_overlap(new_start, new_end, ex.start_time, ex.end_time):
                return jsonify({"message": "Room booked for another exam"}), 400
        
        conf_sessions = Session.query.filter_by(room_id=new_rid, date=new_date).all()
        for s in conf_sessions:
            if check_time_overlap(new_start, new_end, s.start_time, s.end_time):
                return jsonify({"message": "Room booked for a teaching session"}), 400

        if int(data.get('room_id', e.room_id)) != e.room_id:
            db.session.add(AuditExam(exam_id=e.id, field_changed="ROOM", old_value=str(e.room_id), new_value=str(data['room_id'])))
            e.room_id = int(data['room_id'])
        if data.get('date') and data['date'] != e.date:
            db.session.add(AuditExam(exam_id=e.id, field_changed="DATE", old_value=str(e.date), new_value=str(data['date'])))
            e.date = data['date']
        
        e.start_time = new_start
        e.end_time = new_end
        db.session.commit()
        return jsonify(e.to_dict())
    except Exception as ex:
        db.session.rollback()
        return jsonify({"message": str(ex)}), 500

# --- Attendance ---
@api_bp.route('/attendance', methods=['POST'])
def submit_attendance():
    data = request.json
    if not isinstance(data, list): data = [data]
    for item in data:
        filters = {'student_id': int(item['student_id']), 'date': item['date']}
        if item.get('session_id'): filters['session_id'] = int(item['session_id'])
        if item.get('exam_id'): filters['exam_id'] = int(item['exam_id'])
        existing = Attendance.query.filter_by(**filters).first()
        if existing: existing.status = item['status']
        else:
            db.session.add(Attendance(student_id=int(item['student_id']), session_id=item.get('session_id'), exam_id=item.get('exam_id'), status=item['status'], date=item['date']))
    db.session.commit(); return jsonify({"message": "Success"}), 201

@api_bp.route('/attendance', methods=['GET'])
def get_attendance():
    sid, eid = request.args.get('session_id'), request.args.get('exam_id')
    if sid and sid != 'undefined': atts = Attendance.query.filter_by(session_id=int(sid)).all()
    elif eid and eid != 'undefined': atts = Attendance.query.filter_by(exam_id=int(eid)).all()
    else: atts = Attendance.query.all()
    return jsonify([a.to_dict() for a in atts])
