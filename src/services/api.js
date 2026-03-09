import axios from 'axios';
import { Platform } from 'react-native';

// UPDATE THIS if testing on a physical device with Expo Go
// Find your IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
const DEV_MACHINE_IP = '192.168.1.100'; 

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  if (Platform.OS === 'android') {
    // 10.0.2.2 is the localhost address of your host machine in the Android emulator
    return 'http://10.0.2.2:5000/api';
  }
  // For iOS simulator (localhost) or physical devices (IP)
  return `http://${DEV_MACHINE_IP}:5000/api`;
};

const BASE_URL = getBaseUrl(); 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiService = {
  // Auth
  login: (email, role) => api.post('/login', { email, role }).then(res => res.data),

  // Students
  getStudents: () => api.get('/students').then(res => res.data),
  addStudent: (data) => api.post('/students', data).then(res => res.data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data).then(res => res.data),
  deleteStudent: (id) => api.delete(`/students/${id}`).then(res => res.data),

  // Professors
  getProfessors: () => api.get('/professors').then(res => res.data),
  addProfessor: (data) => api.post('/professors', data).then(res => res.data),
  updateProfessor: (id, data) => api.put(`/professors/${id}`, data).then(res => res.data),
  deleteProfessor: (id) => api.delete(`/professors/${id}`).then(res => res.data),

  // Admins
  getAdmins: () => api.get('/admins').then(res => res.data),
  addAdmin: (data) => api.post('/admins', data).then(res => res.data),

  // Sessions
  getSessions: () => api.get('/sessions').then(res => res.data),
  addSession: (data) => api.post('/sessions', data).then(res => res.data),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data).then(res => res.data),
  deleteSession: (id) => api.delete(`/sessions/${id}`).then(res => res.data),

  // Attendance
  getAttendance: (params) => {
    const sId = params.sessionId;
    const eId = params.examId;
    let query = '';
    if (sId && sId !== 'undefined') query = `session_id=${sId}`;
    else if (eId && eId !== 'undefined') query = `exam_id=${eId}`;
    
    if (!query) return Promise.resolve([]);
    return api.get(`/attendance?${query}`).then(res => res.data);
  },
  submitAttendance: (data) => api.post('/attendance', data).then(res => res.data),

  // Audits (Notifications)
  getSessionAudits: (filiereId) => api.get(`/audits/sessions?filiere_id=${filiereId}`).then(res => res.data),
  getExamAudits: (filiereId) => api.get(`/audits/exams?filiere_id=${filiereId}`).then(res => res.data),

  // Modules
  getModules: () => api.get('/modules').then(res => res.data),
  addModule: (data) => api.post('/modules', data).then(res => res.data),
  
  // Filieres
  getFilieres: () => api.get('/filieres').then(res => res.data),
  addFiliere: (data) => api.post('/filieres', data).then(res => res.data),
  
  // Departments
  getDepartments: () => api.get('/departments').then(res => res.data),
  addDepartment: (data) => api.post('/departments', data).then(res => res.data),

  // Semesters (Legacy support if needed)
  getSemesters: () => api.get('/semesters').then(res => res.data),
  
  // Rooms
  getRooms: () => api.get('/rooms').then(res => res.data),
  addRoom: (data) => api.post('/rooms', data).then(res => res.data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data).then(res => res.data),
  
  // Exams
  getExams: () => api.get('/exams').then(res => res.data),
  addExam: (data) => api.post('/exams', data).then(res => res.data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data).then(res => res.data),
  deleteExam: (id) => api.delete(`/exams/${id}`).then(res => res.data),
};

// Global Error Interceptor for user-friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";
    if (!error.response) {
      message = "Network error. Please check your connection.";
    } else {
      switch (error.response.status) {
        case 404: message = "Resource not found."; break;
        case 500: message = "Server error. Please try again later."; break;
        default: message = error.response.data.message || message;
      }
    }
    console.error('API Error:', message);
    return Promise.reject(message);
  }
);
