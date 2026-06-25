# RomeAI - Campus Room Manager

**RomeAI** is a comprehensive university classroom and session management system. It features a React Native (Expo) mobile application and a Flask REST API backend. The system is designed to streamline room bookings, session scheduling, and attendance tracking for students, professors, and administrators.

## Developed By
- **Yahya Bouchak**
- **Student in Master SIIA**
- **Faculty of Sciences (FP), Khouribga**
- **Sara Arroub**
- **Student in Master SIIA**
- **Faculty of Sciences (FP), Khouribga**
- **fatim zahra daoudi**
- **Student in Master SIIA**
- **Faculty of Sciences (FP), Khouribga**

---

## 🚀 Features

### 👨‍🎓 Student Role
- **Personal Dashboard**: View today's classes and active modules.
- **Schedules**: Access weekly session schedules and upcoming exam dates.
- **Notifications**: Stay updated with real-time academic alerts.
- **Profile**: Manage personal academic information.
- **Chatbot**: Query about exams, modules, attendance, and session locations.

### 👨‍🏫 Professor Role
- **Session Management**: Create, modify, or cancel teaching sessions.
- **Room Availability**: Real-time view of available classrooms and amphitheatres.
- **Attendance**: Track student attendance for both sessions and exams.
- **Booking Requests**: Request specific rooms for extra sessions.
- **Chatbot**: Query about available rooms, student lists, attendance, and exams.

### 🔑 Admin Role
- **Central Dashboard**: Overview of campus statistics (total rooms, sessions, active users).
- **User Management**: Create and manage Student and Professor accounts.
- **Room Management**: Add, update, or remove classrooms with capacity and equipment details.
- **Exam Management**: Schedule and publish exam timetables.
- **Audit Logs**: Track changes to modules, sessions, and exams.

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6 (Native Stack, Bottom Tabs)
- **State Management**: React Context API
- **UI**: Custom components with React Native Gesture Handler
- **Database**: SQLite via expo-sqlite (local caching)
- **Networking**: Axios with custom API service layer
- **Styling**: Custom theme with colors and spacing system

### Backend (API Server)
- **Framework**: Flask (Python)
- **ORM**: Flask-SQLAlchemy
- **CORS**: Flask-CORS for cross-origin requests
- **Database**: SQLite (SQLAlchemy)
- **Authentication**: Simple token-based (email, role, password)

### Tools & Libraries
- **Ngrok**: For exposing local backend to mobile devices
- **Patch Package**: For managing npm package patches
- **Babel**: JavaScript transpilation

---

## 📂 Project Structure

```
romeAI/
├── App.js                          # Main application entry point
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel configuration
├── package.json                    # Node.js dependencies
├── package-lock.json               # Dependency lock file
├── 
├── backend/                        # Flask Backend
│   ├── __init__.py                 # Package initializer
│   ├── app.py                      # Flask application factory
│   ├── config.py                   # Configuration settings
│   ├── database.py                 # Database initialization
│   ├── models.py                   # SQLAlchemy models (12 models)
│   ├── routes.py                   # API routes (50+ endpoints)
│   ├── force_reset.py              # Database reset utility
│   └── venv/                       # Python virtual environment
│   └── instance/                   # Flask instance folder
│
├── database/                       # Database Schema
│   ├── adapter-app.js              # Database adapter for frontend
│   └── schema.sql                  # PostgreSQL schema definition
│
├── src/                            # React Native Source
│   ├── components/                 # Reusable UI Components
│   │   ├── AnimatedStatCard.js
│   │   ├── Card.js
│   │   ├── Chatbot.js
│   │   ├── ErrorBoundary.js
│   │   ├── InputField.js
│   │   ├── ListItem.js
│   │   ├── Modal.js
│   │   ├── StatCard.js
│   │   └── ...
│   │
│   ├── constants/                   # Application Constants
│   │   ├── colors.js
│   │   ├── roles.js
│   │   └── spacing.js
│   │
│   ├── context/                     # React Context Providers
│   │   └── AuthContext.js           # Authentication state management
│   │
│   ├── database/                    # Local Database
│   │   ├── database.js
│   │   └── initDatabase.js
│   │
│   ├── data/                        # Mock Data
│   │   └── mockData.js
│   │
│   ├── navigation/                  # Navigation Configuration
│   │   ├── AdminStack.js
│   │   ├── AdminTabs.js
│   │   ├── AuthStack.js
│   │   ├── ProfessorStack.js
│   │   ├── ProfessorTabs.js
│   │   ├── ScheduleStack.js
│   │   ├── StudentExamsStack.js
│   │   ├── StudentStack.js
│   │   └── StudentTabs.js
│   │
│   ├── screens/                      # Application Screens
│   │   ├── admin/                   # Admin Screens (12 screens)
│   │   │   ├── AdminDashboardScreen.js
│   │   │   ├── AdminProfileScreen.js
│   │   │   ├── CreateExamScreen.js
│   │   │   ├── ExamDetailScreen.js
│   │   │   ├── ExamManagementScreen.js
│   │   │   ├── FiliereModulesScreen.js
│   │   │   ├── ModuleDetailScreen.js
│   │   │   ├── ModifyRoomScreen.js
│   │   │   ├── ProfessorDetailScreen.js
│   │   │   ├── RoomManagementScreen.js
│   │   │   ├── StudentDetailScreen.js
│   │   │   └── UserManagementScreen.js
│   │   │
│   │   ├── auth/                    # Authentication Screens
│   │   │   ├── ForgotPasswordScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   │
│   │   ├── professor/               # Professor Screens (10 screens)
│   │   │   ├── AvailableClassroomsScreen.js
│   │   │   ├── AttendanceManagementScreen.js
│   │   │   ├── CreateSessionScreen.js
│   │   │   ├── ModuleSessionsScreen.js
│   │   │   ├── ModifySessionScreen.js
│   │   │   ├── ProfessorDashboardScreen.js
│   │   │   ├── ProfessorFilieresScreen.js
│   │   │   ├── ProfessorModuleDetailScreen.js
│   │   │   ├── ProfessorProfileScreen.js
│   │   │   └── RequestBookingScreen.js
│   │   │   └── SessionManagementScreen.js
│   │   │
│   │   └── student/                  # Student Screens (6 screens)
│   │       ├── ModuleHistoryScreen.js
│   │       ├── SessionDetailScreen.js
│   │       ├── StudentDashboardScreen.js
│   │       ├── StudentExamScheduleScreen.js
│   │       ├── StudentNotificationsScreen.js
│   │       ├── StudentProfileScreen.js
│   │       └── StudentScheduleScreen.js
│   │
│   ├── services/                    # API Services
│   │   └── api.js                   # Axios API client with all endpoints
│   │
│   └── theme/                       # Theme & Styling
│       ├── colors.js
│       ├── spacing.js
│       └── theme.js
│
├── .expo/                           # Expo configuration
├── .git/                            # Git repository
├── .gitignore                       # Git ignore rules
├── instance/                        # Additional instance files
├── patches/                         # NPM patch files
├── node_modules/                    # Node.js dependencies
└── README.md                        # Project documentation
```

---

## 🗄 Database Structure

The application uses **SQLite** via **Flask-SQLAlchemy** with **12 database models**:

### Entity Relationship Diagram (Conceptual)

```
┌─────────────────────┐       ┌─────────────────────┐
│      Department       │       │       Filiere        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)              │◄──────│ id (PK)              │
│ name                 │       │ name                 │
└─────────────────────┘       │ department_id (FK)    │
                              └─────────────────────┘
                                        │
                                        ▼
┌─────────────────────┐       ┌─────────────────────┐
│      Professor       │       │       Module         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)              │       │ id (PK)              │
│ name                 │◄──────│ name                 │
│ email (unique)       │       │ filiere_id (FK)      │
│ password             │       │ professor_id (FK)    │
│ role                 │       └─────────────────────┘
│ department_id (FK)    │                │
└─────────────────────┘                ▼
                              ┌─────────────────────┐
                              │       Session        │
┌─────────────────────┐       ├─────────────────────┤
│       Student        │       │ id (PK)              │
├─────────────────────┤       │ module_id (FK)       │
│ id (PK)              │◄──────│ room_id (FK)         │
│ name                 │       │ type                 │
│ email (unique)       │       │ date                 │
│ password             │       │ start_time           │
│ registration_number  │       │ end_time             │
│ role                 │       │ day                  │
│ filiere_id (FK)      │       │ is_cancelled         │
└─────────────────────┘       └─────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────────┐
                              │     Attendance       │
┌─────────────────────┐       ├─────────────────────┤
│        Room          │       │ id (PK)              │
├─────────────────────┤       │ student_id (FK)      │
│ id (PK)              │◄──────│ session_id (FK)      │
│ name (unique)        │       │ exam_id (FK)         │
│ capacity             │       │ status               │
│ type                 │       │ date                 │
│ status               │       └─────────────────────┘
│ has_wifi             │
│ has_projector        │
│ lien_gps             │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│        Exam          │
├─────────────────────┤
│ id (PK)              │
│ module_id (FK)       │
│ room_id (FK)         │
│ date                 │
│ start_time           │
│ end_time             │
│ type (Normal/Rattrap)│
│ status               │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   AuditSession       │       │     AuditExam        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)              │       │ id (PK)              │
│ session_id (FK)      │       │ exam_id (FK)         │
│ field_changed        │       │ field_changed        │
│ old_value            │       │ old_value            │
│ new_value            │       │ new_value            │
│ modification_time     │       │ modification_time     │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────┐
│    AuditModule       │
├─────────────────────┤
│ id (PK)              │
│ module_id (FK)       │
│ field_changed        │
│ old_value            │
│ new_value            │
│ modification_time     │
└─────────────────────┘

┌─────────────────────┐
│        Admin         │
├─────────────────────┤
│ id (PK)              │
│ name                 │
│ email (unique)       │
│ password             │
│ role                 │
└─────────────────────┘
```

### Model Definitions

#### 1. **Department** (`departments`)
- `id`: Primary Key
- `name`: Department name (unique)
- **Relationships**: Has many Filieres, Has many Professors

#### 2. **Filiere** (`filieres`)
- `id`: Primary Key
- `name`: Program/Field name (unique)
- `department_id`: Foreign Key to Department
- **Relationships**: Belongs to Department, Has many Students, Has many Modules

#### 3. **Professor** (`professors`)
- `id`: Primary Key
- `name`: Professor name
- `email`: Email (unique)
- `password`: Password (default: 'Yahya2004@')
- `role`: User role (default: 'professor')
- `department_id`: Foreign Key to Department
- **Relationships**: Belongs to Department, Teaches many Modules

#### 4. **Student** (`students`)
- `id`: Primary Key
- `name`: Student name
- `email`: Email (unique)
- `password`: Password (default: 'Yahya2004@')
- `registration_number`: Student ID (unique)
- `role`: User role (default: 'student')
- `filiere_id`: Foreign Key to Filiere
- **Relationships**: Belongs to Filiere, Has many Attendance records

#### 5. **Module** (`modules`)
- `id`: Primary Key
- `name`: Module/Course name
- `filiere_id`: Foreign Key to Filiere (required)
- `professor_id`: Foreign Key to Professor (optional)
- **Relationships**: Belongs to Filiere, Belongs to Professor, Has many Sessions, Has many Exams

#### 6. **Room** (`rooms`)
- `id`: Primary Key
- `name`: Room name (unique)
- `capacity`: Maximum capacity
- `type`: Room type (Classroom, Amphi, TD, TP, Lab) - default: 'Classroom'
- `status`: Availability status (active, maintenance) - default: 'active'
- `has_wifi`: Boolean - default: True
- `has_projector`: Boolean - default: True
- `lien_gps`: GPS coordinates (optional)
- **Relationships**: Hosts many Sessions, Hosts many Exams

#### 7. **Session** (`sessions`)
- `id`: Primary Key
- `module_id`: Foreign Key to Module (required)
- `room_id`: Foreign Key to Room (required)
- `type`: Session type (Lecture, TD, TP, Exam)
- `date`: Date string
- `start_time`: Start time
- `end_time`: End time
- `day`: Day of week
- `is_cancelled`: Boolean - default: False
- **Relationships**: Belongs to Module, Belongs to Room, Has many Attendance records, Has many AuditSession records

#### 8. **Exam** (`exam`)
- `id`: Primary Key
- `module_id`: Foreign Key to Module (required)
- `room_id`: Foreign Key to Room (required)
- `date`: Date string
- `start_time`: Start time
- `end_time`: End time
- `type`: Exam type (Normal, Rattrapage) - default: 'Normal'
- `status`: Publication status (Published, Draft) - default: 'Published'
- **Relationships**: Belongs to Module, Belongs to Room, Has many Attendance records, Has many AuditExam records

#### 9. **Attendance** (`attendance`)
- `id`: Primary Key
- `student_id`: Foreign Key to Student (required)
- `session_id`: Foreign Key to Session (optional)
- `exam_id`: Foreign Key to Exam (optional)
- `status`: Attendance status (present, late, excused, absent) - default: 'present'
- `date`: Date string
- **Relationships**: Belongs to Student, Belongs to Session or Exam

#### 10. **Admin** (`admins`)
- `id`: Primary Key
- `name`: Admin name
- `email`: Email (unique)
- `password`: Password (default: 'Yahya2004@')
- `role`: User role (default: 'admin')

#### 11-13. **Audit Models** (`audit_session`, `audit_exam`, `audit_module`)
- Track all changes to Sessions, Exams, and Modules
- Fields: `id`, `*_id` (FK), `field_changed`, `old_value`, `new_value`, `modification_time`

---

## 🎯 Principal Functions

### Backend API Endpoints

The Flask backend provides **50+ RESTful API endpoints** organized in the following categories:

#### Authentication
- `POST /api/login` - User login (email, role, password)

#### Chatbot (AI Assistant)
- `POST /api/chatbot` - Natural language query processing with role-based responses
  - **Professor queries**: Available rooms, student lists, attendance, exams
  - **Student queries**: Exams, modules, attendance, session locations
  - Features intent detection, room filtering (wifi, projector, type), and context-aware responses

#### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create new department

#### Filieres (Programs)
- `GET /api/filieres` - List all filieres
- `POST /api/filieres` - Create new filiere

#### Users
- **Students**: `GET|POST|PUT|DELETE /api/students`
- **Professors**: `GET|POST|PUT|DELETE /api/professors`

#### Modules
- `GET /api/modules` - List all modules
- `POST /api/modules` - Create new module (max 7 per filiere)
- `PUT /api/modules/<id>` - Update module (max 3 modules per professor)

#### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/<id>` - Update room (capacity, type, status, equipment)

#### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session with overlap checking
- `PUT /api/sessions/<id>` - Update session with audit logging
- `DELETE /api/sessions/<id>` - Delete session

#### Exams
- `GET /api/exams` - List all exams
- `POST /api/exams` - Create exam (enforces 1 Normal + 1 Rattrapage per module max)
- `PUT /api/exams/<id>` - Update exam with overlap checking
- `DELETE /api/exams/<id>` - Delete exam

#### Attendance
- `GET /api/attendance` - Get attendance (filterable by session_id or exam_id)
- `POST /api/attendance` - Submit attendance (single or batch)

#### Audit Logs
- `GET /api/audits/sessions` - Session change history (filterable by filiere_id)
- `GET /api/audits/exams` - Exam change history (filterable by filiere_id)
- `GET /api/audits/modules` - Module change history (filterable by filiere_id)

### Frontend Services

The `src/services/api.js` file provides a centralized API service layer with:

```javascript
// Auth
login(email, role, password)

// Students
getStudents(), addStudent(data), updateStudent(id, data), deleteStudent(id)

// Professors
getProfessors(), addProfessor(data), updateProfessor(id, data), deleteProfessor(id)

// Modules
getModules(), addModule(data), updateModule(id, data)

// Sessions & Exams
getSessions(), addSession(data), updateSession(id, data), deleteSession(id)
getExams(), addExam(data), updateExam(id, data), deleteExam(id)

// Attendance & Audits
getAttendance(params), submitAttendance(data)
getSessionAudits(fid), getExamAudits(fid), getModuleAudits(fid)

// General Data
getDepartments(), addDepartment(data)
getFilieres(), addFiliere(data)
getRooms(), addRoom(data), updateRoom(id, data)

// Chatbot
chatbot(query, role, userId)
```

### Key Business Logic Functions

1. **Time Overlap Detection** (`check_time_overlap` in routes.py)
   - Prevents double-booking of rooms for sessions/exams
   - Checks all existing sessions and exams in the same room on the same date

2. **Exam Type Validation**
   - Enforces maximum 1 Normal and 1 Rattrapage exam per module
   - Prevents duplicate exam types

3. **Module Load Balancing**
   - Maximum 7 modules per filiere
   - Maximum 3 modules per professor

4. **Chatbot Intent Detection**
   - Natural language processing for room queries
   - Filters by equipment (wifi, projector)
   - Filters by type (Amphi, TD, TP, Classroom)
   - Context-aware responses based on user role

5. **Audit Trail**
   - Automatic logging of all changes to sessions, exams, and modules
   - Tracks field changed, old value, new value, and timestamp

---

## 📦 Installation & Setup

### 1. Backend Setup (Flask)

The backend manages the database and provides the API.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-sqlalchemy flask-cors
```

**Run the server:**
```bash
python app.py
```
The server will start on `http://localhost:5002`.

### 2. Ngrok Setup (Action Server Hosting)

To allow the mobile app (on a physical device or simulator) to communicate with your local Flask server, you must expose it via **Ngrok**. 

1. **Download & Install Ngrok**: [ngrok.com](https://ngrok.com/)
2. **Start Ngrok**:
   ```bash
   ngrok http 5002
   ```
3. **Update Frontend API URL**:
   - Copy the `Forwarding` URL provided by ngrok (e.g., `https://xxxx-xxxx.ngrok-free.app`)
   - Open `src/services/api.js`
   - Update the `BASE_URL` constant:
     ```javascript
     const BASE_URL = 'https://xxxx-xxxx.ngrok-free.app/api';
     ```

### 3. Frontend Setup (Expo)

```bash
# Install Node dependencies
npm install

# Start the Expo development server
npx expo start
```
Scan the QR code with the **Expo Go** app (Android) or use the iOS/Android simulator.

---

## 🧪 Testing Credentials

The database is seeded with the following default accounts (Password: `Yahya2004@`):

| Role | Email | Access Level |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | Full system access |
| **Professor** | `prof@test.com` | Session, exam, attendance management |
| **Student** | `student@test.com` | View schedules, exams, attendance |

---

## 📊 API Documentation

### Request Format
All API requests use JSON format with the following headers:
```
Content-Type: application/json
ngrok-skip-browser-warning: true
```

### Response Format
- **Success**: `{ data: {...} }` or `{ message: "Success" }`
- **Error**: `{ message: "Error description" }` with appropriate HTTP status code

### Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (DELETE)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🎨 Frontend Architecture

### Navigation Structure

The app uses a role-based navigation system:

```
RootNavigator
├── AuthStack (if not authenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── Role-Based Tabs (if authenticated)
    ├── StudentTabs
    │   ├── StudentDashboardScreen
    │   ├── StudentScheduleScreen
    │   ├── StudentExamScheduleScreen
    │   ├── StudentNotificationsScreen
    │   └── StudentProfileScreen
    │
    ├── ProfessorTabs
    │   ├── ProfessorDashboardScreen
    │   ├── SessionManagementScreen
    │   ├── AvailableClassroomsScreen
    │   ├── AttendanceManagementScreen
    │   └── ProfessorProfileScreen
    │
    └── AdminTabs
        ├── AdminDashboardScreen
        ├── UserManagementScreen
        ├── RoomManagementScreen
        ├── ExamManagementScreen
        └── AdminProfileScreen
```

### Context API
- **AuthContext**: Manages authentication state and user data across the app
- Provides: `isAuthenticated`, `user`, `login`, `logout` functions

### Local Database
- Uses `expo-sqlite` for local data caching
- Initialized in `src/database/initDatabase.js`
- Syncs with backend API

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/romeAI.git
   cd romeAI
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Setup Frontend:**
   ```bash
   cd ..
   npm install
   npx expo start
   ```

4. **Setup Ngrok:**
   ```bash
   ngrok http 5002
   ```

5. **Update API URL** in `src/services/api.js`

6. **Login** with test credentials:
   - Admin: `admin@test.com` / `Yahya2004@`
   - Professor: `prof@test.com` / `Yahya2004@`
   - Student: `student@test.com` / `Yahya2004@`

---

## 📝 License

This project is private and developed for academic purposes.

---

## 🤝 Contributing

This project was developed as part of a Master's degree project. Contributions are currently not accepted.

---

## 📞 Contact

For any questions or issues, please contact:
- **Yahya Bouchak** - yahya.bouchak@student.univ-khouribga.ac.ma

---

*Last Updated: June 25, 2026*
