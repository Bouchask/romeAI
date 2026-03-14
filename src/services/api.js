import axios from 'axios';

// The Ngrok URL is defined as a constant for easy updates
const BASE_URL = 'https://281c-196-112-77-64.ngrok-free.app/api';

// Create the axios instance as a constant
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // Bypasses the Ngrok "Browser Warning" to ensure JSON is received
    'ngrok-skip-browser-warning': 'true'
  },
});

export const ApiService = {
  // Auth
  login: (email, role, password) => api.post('/login', { email, role, password }).then(res => res.data),
  
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
  
  // Modules
  getModules: () => api.get('/modules').then(res => res.data),
  addModule: (data) => api.post('/modules', data).then(res => res.data),
  updateModule: (id, data) => api.put(`/modules/${id}`, data).then(res => res.data),
  
  // Sessions & Exams
  getSessions: () => api.get('/sessions').then(res => res.data),
  addSession: (data) => api.post('/sessions', data).then(res => res.data),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data).then(res => res.data),
  deleteSession: (id) => api.delete(`/sessions/${id}`).then(res => res.data),
  getExams: () => api.get('/exams').then(res => res.data),
  addExam: (data) => api.post('/exams', data).then(res => res.data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data).then(res => res.data),
  deleteExam: (id) => api.delete(`/exams/${id}`).then(res => res.data),
  
  // Attendance & Audits
  getAttendance: (params) => {
    const q = params.sessionId ? `session_id=${params.sessionId}` : `exam_id=${params.examId}`;
    return api.get(`/attendance?${q}`).then(res => res.data);
  },
  submitAttendance: (data) => api.post('/attendance', data).then(res => res.data),
  getSessionAudits: (fid) => api.get(`/audits/sessions?filiere_id=${fid}`).then(res => res.data),
  getExamAudits: (fid) => api.get(`/audits/exams?filiere_id=${fid}`).then(res => res.data),
  getModuleAudits: (fid) => api.get(`/audits/modules?filiere_id=${fid}`).then(res => res.data),
  
  // General Data
  getDepartments: () => api.get('/departments').then(res => res.data),
  addDepartment: (data) => api.post('/departments', data).then(res => res.data),
  getFilieres: () => api.get('/filieres').then(res => res.data),
  addFiliere: (data) => api.post('/filieres', data).then(res => res.data),
  getRooms: () => api.get('/rooms').then(res => res.data),
  addRoom: (data) => api.post('/rooms', data).then(res => res.data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data).then(res => res.data),
};

// Global interceptor for consistent error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || "Server connection error";
    console.error("API Error:", msg);
    return Promise.reject(msg);
  }
);
