import axios from 'axios';

// Replace with your local IP or server URL for physical device testing
const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

export const DatabaseService = {
  // Filières
  getFilieres: async () => {
    const response = await api.get('/filieres');
    return response.data;
  },

  // Modules
  getProfessorModules: async (profId) => {
    const response = await api.get(`/professors/${profId}/modules`);
    return response.data;
  },

  // Sessions
  getTodaySessions: async () => {
    const response = await api.get('/sessions/today');
    return response.data;
  },

  // Attendance
  markAttendance: async (sessionId, studentId, status) => {
    const response = await api.post('/attendance/mark', {
      sessionId,
      studentId,
      status,
    });
    return response.data;
  },
};
