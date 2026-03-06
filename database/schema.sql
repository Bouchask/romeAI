-- Campus Room Manager - PostgreSQL Schema

-- 1. Filières (Departments)
CREATE TABLE filieres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Professors
CREATE TABLE professors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- 3. Modules
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    filiere_id INTEGER REFERENCES filieres(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(id) ON DELETE SET NULL
);

-- 4. Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    filiere_id INTEGER REFERENCES filieres(id) ON DELETE SET NULL
);

-- 5. Rooms (Classrooms)
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'Classroom', -- Lecture Hall, Lab, etc.
    status VARCHAR(20) DEFAULT 'available' -- available, occupied, maintenance
);

-- 6. Sessions (Classes/Exams)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    session_type VARCHAR(20) NOT NULL, -- Lecture, TD, TP, Exam
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' -- scheduled, draft, upcoming, completed
);

-- 7. Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'present', -- present, late, excused, absent
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- Initial Mock Data
INSERT INTO filieres (name) VALUES ('Computer Science'), ('Mechanical Engineering'), ('Business Administration');

INSERT INTO professors (name, email, password_hash) VALUES 
('Dr. Ahmed', 'ahmed@university.edu', '$2b$10$hashed_pwd_here'),
('Dr. Jane Smith', 'jane@university.edu', '$2b$10$hashed_pwd_here');

INSERT INTO modules (name, filiere_id, professor_id) VALUES 
('Database Systems', 1, 1),
('Web Development', 1, 1),
('Thermodynamics', 2, 2);

INSERT INTO students (name, email, filiere_id) VALUES 
('Alex Johnson', 'alex@student.edu', 1),
('Maria Garcia', 'maria@student.edu', 2);

INSERT INTO rooms (name, capacity, type, status) VALUES 
('Room 101', 40, 'Lecture Hall', 'available'),
('Room 205', 50, 'Lab', 'available');
