# RomeAI - Campus Room Manager

**RomeAI** is a comprehensive university classroom and session management system. It features a React Native (Expo) mobile application and a Flask REST API backend. The system is designed to streamline room bookings, session scheduling, and attendance tracking for students, professors, and administrators.

## Developed By
- **Yahya Bouchak**
- **Student in Master SIIA**
- **Faculty of Sciences (FP), Khouribga**

---

## 🚀 Features

### 👨‍🎓 Student Role
- **Personal Dashboard**: View today's classes and active modules.
- **Schedules**: Access weekly session schedules and upcoming exam dates.
- **Notifications**: Stay updated with real-time academic alerts.
- **Profile**: Manage personal academic information.

### 👨‍🏫 Professor Role
- **Session Management**: Create, modify, or cancel teaching sessions.
- **Room Availability**: Real-time view of available classrooms and amphitheatres.
- **Attendance**: Track student attendance for both sessions and exams.
- **Booking Requests**: Request specific rooms for extra sessions.

### 🔑 Admin Role
- **Central Dashboard**: Overview of campus statistics (total rooms, sessions, active users).
- **User Management**: Create and manage Student and Professor accounts.
- **Room Management**: Add, update, or remove classrooms with capacity and equipment details.
- **Exam Management**: Schedule and publish exam timetables.
- **Audit Logs**: Track changes to modules, sessions, and exams.

---

## 🛠 Tech Stack

- **Frontend**: React Native (Expo), React Navigation, Axios, Context API.
- **Backend**: Python (Flask), Flask-SQLAlchemy, Flask-CORS.
- **Database**: SQLite.
- **Networking**: Ngrok (for local backend exposure).

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
The server will start on `http://localhost:5000`.

### 2. Ngrok Setup (Action Server Hosting)
To allow the mobile app (on a physical device or simulator) to communicate with your local Flask server, you must expose it via **Ngrok**.

1.  **Download & Install Ngrok**: [ngrok.com](https://ngrok.com/)
2.  **Start Ngrok**:
    ```bash
    ngrok http 5000
    ```
3.  **Update Frontend API URL**:
    - Copy the `Forwarding` URL provided by ngrok (e.g., `https://xxxx-xxxx.ngrok-free.app`).
    - Open `src/services/api.js`.
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

| Role | Email |
| :--- | :--- |
| **Admin** | `admin@test.com` |
| **Professor** | `prof@test.com` |
| **Student** | `student@test.com` |

---

## 📂 Project Structure
- `backend/`: Flask application, models, and database logic.
- `src/components/`: Reusable UI components (Cards, Buttons, etc.).
- `src/screens/`: Role-specific screens (Admin, Professor, Student).
- `src/navigation/`: Navigation stacks and tab configurations.
- `src/services/api.js`: Axios configuration for backend communication.
- `src/theme/`: Global styles, colors, and spacing.
