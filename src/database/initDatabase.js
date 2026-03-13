import { Platform } from 'react-native';
import db from './database';

export const initDatabase = () => {
  if (Platform.OS === 'web') {
    console.log('Skipping local SQLite init for web platform');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    try {
      db.execSync(`
        -- 1. Filieres
        CREATE TABLE IF NOT EXISTS filieres (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );

        -- 2. Professors
        CREATE TABLE IF NOT EXISTS professors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE
        );

        -- 3. Modules
        CREATE TABLE IF NOT EXISTS modules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          filiereId INTEGER,
          professorId INTEGER,
          FOREIGN KEY (filiereId) REFERENCES filieres (id),
          FOREIGN KEY (professorId) REFERENCES professors (id)
        );

        -- 4. Students
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          filiereId INTEGER,
          FOREIGN KEY (filiereId) REFERENCES filieres (id)
        );

        -- 5. Rooms
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          capacity INTEGER,
          type TEXT,
          status TEXT DEFAULT 'available'
        );

        -- 6. Sessions
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          moduleId INTEGER,
          roomId INTEGER,
          type TEXT,
          startTime TEXT,
          endTime TEXT,
          status TEXT DEFAULT 'scheduled',
          FOREIGN KEY (moduleId) REFERENCES modules (id),
          FOREIGN KEY (roomId) REFERENCES rooms (id)
        );

        -- 7. Attendance
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessionId INTEGER,
          studentId INTEGER,
          status TEXT,
          markedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sessionId) REFERENCES sessions (id),
          FOREIGN KEY (studentId) REFERENCES students (id)
        );
      `);
      console.log('Database initialized successfully');
      resolve();
    } catch (error) {
      console.log('Database init error:', error);
      reject(error);
    }
  });
};
