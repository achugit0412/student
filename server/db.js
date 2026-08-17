const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'educloud.db');

// Delete existing database file to re-seed cleanly with 1 Student, 1 Teacher, 1 Admin
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Cleaned up old database file.');
  } catch (err) {
    console.log('Resetting database tables...');
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to EduCloud SQLite Database.');
  }
});

db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    year_semester TEXT,
    roll_number TEXT,
    avatar TEXT
  )`);

  // Courses Table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL,
    faculty_name TEXT,
    department TEXT
  )`);

  // Attendance Table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    attended_classes INTEGER NOT NULL,
    total_classes INTEGER NOT NULL,
    last_updated TEXT
  )`);

  // Exams Table
  db.run(`CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    exam_time TEXT NOT NULL,
    venue_hall TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    is_updated INTEGER DEFAULT 0,
    update_note TEXT
  )`);

  // CGPA Records Table
  db.run(`CREATE TABLE IF NOT EXISTS cgpa_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    semester TEXT NOT NULL,
    sgpa REAL NOT NULL,
    credits_completed INTEGER NOT NULL
  )`);

  // Placements Table
  db.run(`CREATE TABLE IF NOT EXISTS placements (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    package_lpa REAL NOT NULL,
    min_cgpa REAL NOT NULL,
    eligible_branches TEXT NOT NULL,
    deadline TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    description TEXT
  )`);

  // Hackathons Table
  db.run(`CREATE TABLE IF NOT EXISTS hackathons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    prize_pool TEXT NOT NULL,
    max_team_size INTEGER NOT NULL,
    event_date TEXT NOT NULL,
    deadline TEXT NOT NULL,
    tags TEXT NOT NULL
  )`);

  // Announcements Table
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_at TEXT NOT NULL,
    author TEXT NOT NULL
  )`);

  // Placement Applications Table
  db.run(`CREATE TABLE IF NOT EXISTS placement_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    placement_id TEXT NOT NULL,
    applied_at TEXT NOT NULL,
    status TEXT DEFAULT 'Submitted'
  )`);

  // Hackathon Registrations Table
  db.run(`CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    hackathon_id TEXT NOT NULL,
    team_name TEXT NOT NULL,
    registered_at TEXT NOT NULL
  )`);

  console.log('Seeding minimal database: 1 Student, 1 Teacher, 1 Admin...');
  seedDatabase();
});

function seedDatabase() {
  // Exactly 1 Student, 1 Teacher (Faculty), 1 Admin
  const users = [
    ['std-001', 'Alex Morgan', 'alex.morgan@educloud.ac.in', 'student', 'Computer Science & Engg', 'Year 3 - Semester 6', '21CS1042', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'],
    ['fac-101', 'Prof. Sarah Jenkins', 'sarah.jenkins@educloud.ac.in', 'faculty', 'Computer Science & Engg', 'Department Chair & Professor', 'FAC-CS-101', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'],
    ['adm-001', 'Dr. Robert Vance', 'admin@educloud.ac.in', 'admin', 'Institutional Administration', 'Dean of Academic Affairs', 'ADM-001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200']
  ];

  const insertUser = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  users.forEach(u => insertUser.run(u));
  insertUser.finalize();

  // Courses
  const courses = [
    ['CS301', 'CS301', 'Distributed Cloud Computing', 4, 'Prof. Sarah Jenkins', 'CSE'],
    ['CS302', 'CS302', 'Design & Analysis of Algorithms', 4, 'Prof. Sarah Jenkins', 'CSE'],
    ['CS303', 'CS303', 'Database Management Systems', 3, 'Prof. Sarah Jenkins', 'CSE']
  ];
  const insertCourse = db.prepare('INSERT INTO courses VALUES (?, ?, ?, ?, ?, ?)');
  courses.forEach(c => insertCourse.run(c));
  insertCourse.finalize();

  // Attendance for Alex Morgan (std-001) - 1 Course is <75% to trigger alert
  const attendance = [
    ['std-001', 'CS301', 'Distributed Cloud Computing', 34, 40, '2026-08-14'], // 85% Safe
    ['std-001', 'CS302', 'Design & Analysis of Algorithms', 26, 40, '2026-08-14'], // 65% CRITICAL ALERT (<75%)
    ['std-001', 'CS303', 'Database Management Systems', 36, 40, '2026-08-14']  // 90% Safe
  ];
  const insertAttendance = db.prepare('INSERT INTO attendance (student_id, course_id, course_name, attended_classes, total_classes, last_updated) VALUES (?, ?, ?, ?, ?, ?)');
  attendance.forEach(a => insertAttendance.run(a));
  insertAttendance.finalize();

  // Exams
  const exams = [
    ['ex-101', 'CS301', 'Distributed Cloud Computing', '2026-08-22', '09:30 AM - 12:30 PM', 'Cloud Lab - Tech Block 3rd Floor', 'Seat A-14', 0, ''],
    ['ex-102', 'CS302', 'Design & Analysis of Algorithms', '2026-08-24', '02:00 PM - 05:00 PM', 'Hall 402 -> Moved to Lab 4', 'Seat B-28', 1, 'Venue updated by Prof. Sarah Jenkins']
  ];
  const insertExams = db.prepare('INSERT INTO exams VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  exams.forEach(e => insertExams.run(e));
  insertExams.finalize();

  // CGPA Records
  const cgpaRecords = [
    ['std-001', 'Semester 1', 8.80, 22],
    ['std-001', 'Semester 2', 8.95, 22],
    ['std-001', 'Semester 3', 9.10, 24],
    ['std-001', 'Semester 4', 8.75, 23],
    ['std-001', 'Semester 5', 9.20, 24]
  ];
  const insertCGPA = db.prepare('INSERT INTO cgpa_records (student_id, semester, sgpa, credits_completed) VALUES (?, ?, ?, ?)');
  cgpaRecords.forEach(c => insertCGPA.run(c));
  insertCGPA.finalize();

  // Placements
  const placements = [
    ['pl-101', 'Google', 'Cloud Software Engineer (SDE-1)', 28.5, 8.5, 'CSE, IT', '2026-08-30', 'Bengaluru / Hybrid', 'Open', 'Hiring for Cloud Infrastructure and Frontend Core Engineering teams.'],
    ['pl-102', 'Microsoft', 'Azure Cloud Solution Architect Intern', 22.0, 8.0, 'CSE, IT', '2026-09-05', 'Hyderabad', 'Open', 'Azure cloud platform team summer internship with PPO opportunity.']
  ];
  const insertPlacement = db.prepare('INSERT INTO placements VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  placements.forEach(p => insertPlacement.run(p));
  insertPlacement.finalize();

  // Hackathons
  const hackathons = [
    ['hk-101', 'EduHack 2026 Cloud & AI Summit', 'EduCloud & AWS', '$15,000 + AWS Cloud Credits', 4, '2026-09-15', '2026-09-01', 'Cloud, AI/ML, EdTech']
  ];
  const insertHackathon = db.prepare('INSERT INTO hackathons VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  hackathons.forEach(h => insertHackathon.run(h));
  insertHackathon.finalize();

  // Announcements
  const announcements = [
    [1, '⚠️ ATTENDANCE WARNING: Minimum 75% Requirement', 'All students must maintain 75% aggregate attendance per subject for End-Semester exams starting Aug 22, 2026.', 'urgent', 'high', '2026-08-14 09:00', 'Dean of Academic Affairs'],
    [2, '📢 Exam Venue Update for CS302 (Algorithms)', 'CS302 exam on Aug 24th has been moved to Computer Lab 4 due to AC maintenance.', 'examination', 'high', '2026-08-13 16:30', 'Prof. Sarah Jenkins']
  ];
  const insertAnnounce = db.prepare('INSERT INTO announcements VALUES (?, ?, ?, ?, ?, ?, ?)');
  announcements.forEach(a => insertAnnounce.run(a));
  insertAnnounce.finalize();

  console.log('Database initialized with 1 Student, 1 Teacher, 1 Admin.');
}

module.exports = db;
