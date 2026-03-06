export const FILIERES = [
  { id: 'f1', name: 'Computer Science' },
  { id: 'f2', name: 'Mechanical Engineering' },
  { id: 'f3', name: 'Business Administration' },
];

export const MODULES = [
  { id: 'm1', name: 'Database Systems', filiereId: 'f1', professorId: 'p1' },
  { id: 'm2', name: 'Web Development', filiereId: 'f1', professorId: 'p1' },
  { id: 'm3', name: 'Thermodynamics', filiereId: 'f2', professorId: 'p2' },
  { id: 'm4', name: 'Macroeconomics', filiereId: 'f3', professorId: 'p3' },
];

export const PROFESSORS = [
  { id: 'p1', name: 'Dr. Ahmed', email: 'ahmed@university.edu', modules: ['m1', 'm2'] },
  { id: 'p2', name: 'Dr. Jane Smith', email: 'jane@university.edu', modules: ['m3'] },
  { id: 'p3', name: 'Dr. Robert Brown', email: 'robert@university.edu', modules: ['m4'] },
];

export const STUDENTS = [
  { id: 's1', name: 'Alex Johnson', filiereId: 'f1' },
  { id: 's2', name: 'Maria Garcia', filiereId: 'f2' },
];
