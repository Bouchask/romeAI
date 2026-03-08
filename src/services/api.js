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

  // Modules
  getModules: () => api.get('/modules').then(res => res.data),
  
  // Filieres
  getFilieres: () => api.get('/filieres').then(res => res.data),
  
  // Rooms
  getRooms: () => api.get('/rooms').then(res => res.data),
  addRoom: (data) => api.post('/rooms', data).then(res => res.data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data).then(res => res.data),
  
  // Exams
  getExams: () => api.get('/exams').then(res => res.data),
  addExam: (data) => api.post('/exams', data).then(res => res.data),
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
