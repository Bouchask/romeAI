# Campus Room Manager – Screens & Navigation

## Full screen list

### Authentication (Stack – no tabs)
| Screen | Route | Description |
|--------|--------|-------------|
| Login | `Login` | Email, password, role selector (Student / Professor / Admin) |
| Register | `Register` | Name, email, password, role; field/filière for students |
| Forgot Password | `ForgotPassword` | Email input, send reset link (demo) |

### Student (Bottom tabs)
| Screen | Tab | Description |
|--------|-----|-------------|
| Student Dashboard | Dashboard | Today’s classes, course modules, room, professor, time/day |
| Student Schedule | Schedule | Weekly planning, filter by day; module, professor, classroom |
| Exam Schedule | Exams | List of exams with classroom, date, time |
| Notifications | Notifications | Room change and schedule update notifications |
| Student Profile | Profile | Name, email, field/filière, logout |

### Professor (Bottom tabs)
| Screen | Tab | Description |
|--------|-----|-------------|
| Professor Dashboard | Dashboard | Quick view of today’s sessions |
| Create Session | New | Select module, type (Cours/TD/TP/Exam), date/time; available classrooms list |
| Available Classrooms | Classrooms | List of rooms with capacity and status |
| Session Management | My Sessions | View created sessions, edit or cancel |
| Professor Profile | Profile | Personal info, modules taught, logout |

### Admin (Bottom tabs)
| Screen | Tab | Description |
|--------|-----|-------------|
| Admin Dashboard | Dashboard | Stats: rooms, professors, sessions; quick actions |
| Room Management | Rooms | Add classroom, edit, disable (maintenance) |
| Exam Management | Exams | Create exam session, assign classroom and filière |
| User Management | Users | Tabs: Students, Professors; list and manage |
| Admin Profile | Profile | Admin info, logout |

---

## Navigation structure

```
App (AuthProvider)
└── NavigationContainer
    └── RootNavigator
        ├── if not authenticated → AuthStack
        │   ├── Login
        │   ├── Register
        │   └── ForgotPassword
        │
        └── if authenticated → role-based tabs
            ├── Student   → StudentTabs (Dashboard, Schedule, Exams, Notifications, Profile)
            ├── Professor → ProfessorTabs (Dashboard, CreateSession, Rooms, Sessions, Profile)
            └── Admin     → AdminTabs (Dashboard, Rooms, Exams, Users, Profile)
```

- **Auth**: Stack (no header on auth screens for full-screen forms).
- **Post-login**: Bottom tab navigator per role; each tab is a screen (no nested stack in this version).

---

## UI layout (per screen type)

- **Auth**: Centered form; logo/title at top; role chips; email/password inputs; primary CTA; link to Register/Forgot/Login.
- **Dashboards**: Header (title + subtitle); section titles; cards for today’s items or stats; list or grid of modules/quick actions.
- **Lists (schedule, exams, rooms, sessions, users)**: Section header; horizontal filters/tabs where needed (e.g. day, Students/Professors); cards per item with icon, title, metadata.
- **Profile**: Avatar, name, card with rows (email, field/modules), logout button.

---

## Component structure

```
src/
├── components/
│   ├── Card.js          # Reusable card (optional onPress)
│   └── ScreenHeader.js  # Title + optional subtitle
├── constants/
│   └── roles.js         # ROLES.STUDENT | PROFESSOR | ADMIN
├── context/
│   └── AuthContext.js   # user, login(), register(), logout(), isAuthenticated
├── navigation/
│   ├── AuthStack.js     # Login, Register, ForgotPassword
│   ├── StudentTabs.js
│   ├── ProfessorTabs.js
│   └── AdminTabs.js
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ForgotPasswordScreen.js
│   ├── student/
│   │   ├── StudentDashboardScreen.js
│   │   ├── StudentScheduleScreen.js
│   │   ├── StudentExamScheduleScreen.js
│   │   ├── StudentNotificationsScreen.js
│   │   └── StudentProfileScreen.js
│   ├── professor/
│   │   ├── ProfessorDashboardScreen.js
│   │   ├── CreateSessionScreen.js
│   │   ├── AvailableClassroomsScreen.js
│   │   ├── SessionManagementScreen.js
│   │   └── ProfessorProfileScreen.js
│   └── admin/
│       ├── AdminDashboardScreen.js
│       ├── RoomManagementScreen.js
│       ├── ExamManagementScreen.js
│       ├── UserManagementScreen.js
│       └── AdminProfileScreen.js
└── theme/
    ├── colors.js
    ├── spacing.js
    └── index.js
```

---

## React Native code structure (folders and files)

```
romeAI/
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── SCREENS_AND_NAVIGATION.md
├── README.md
├── assets/           # Add icon.png, splash.png, adaptive-icon.png for Expo
└── src/
    ├── components/
    │   ├── Card.js
    │   └── ScreenHeader.js
    ├── constants/
    │   └── roles.js
    ├── context/
    │   └── AuthContext.js
    ├── navigation/
    │   ├── AuthStack.js
    │   ├── StudentTabs.js
    │   ├── ProfessorTabs.js
    │   └── AdminTabs.js
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   └── ForgotPasswordScreen.js
    │   ├── student/
    │   │   ├── StudentDashboardScreen.js
    │   │   ├── StudentScheduleScreen.js
    │   │   ├── StudentExamScheduleScreen.js
    │   │   ├── StudentNotificationsScreen.js
    │   │   └── StudentProfileScreen.js
    │   ├── professor/
    │   │   ├── ProfessorDashboardScreen.js
    │   │   ├── CreateSessionScreen.js
    │   │   ├── AvailableClassroomsScreen.js
    │   │   ├── SessionManagementScreen.js
    │   │   └── ProfessorProfileScreen.js
    │   └── admin/
    │       ├── AdminDashboardScreen.js
    │       ├── RoomManagementScreen.js
    │       ├── ExamManagementScreen.js
    │       ├── UserManagementScreen.js
    │       └── AdminProfileScreen.js
    └── theme/
        ├── colors.js
        ├── spacing.js
        └── index.js
```

---

## Theme

- **Primary**: Blue (`#2563EB`)
- **Secondary**: White (`#FFFFFF`)
- **Accent**: Light gray (`#F1F5F9`)
- **Background**: `#F8FAFC`
- **Cards**: White, rounded, subtle shadow
- **Icons**: Ionicons (from `@expo/vector-icons`)
