const programs = [
  { id: 1, code: "BSIT", name: "Bachelor of Science in Information Technology" },
  { id: 2, code: "BSCS", name: "Bachelor of Science in Computer Science" },
  { id: 3, code: "BSBA", name: "Bachelor of Science in Business Administration" }
];

const students = [
  { id: 1, studentNumber: "2026-001", firstName: "Juan", lastName: "Dela Cruz", program: "BSIT", yearLevel: 1, status: "Pending" },
  { id: 2, studentNumber: "2026-002", firstName: "Maria", lastName: "Santos", program: "BSCS", yearLevel: 2, status: "Enrolled" },
  { id: 3, studentNumber: "2026-003", firstName: "Pedro", lastName: "Reyes", program: "BSIT", yearLevel: 3, status: "Enrolled" }
];

const courses = [
  { id: 1, code: "IT101", title: "Introduction to Computing", program: "BSIT", units: 3, yearLevel: 1 },
  { id: 2, code: "CS201", title: "Data Structures and Algorithms", program: "BSCS", units: 3, yearLevel: 2 },
  { id: 3, code: "IT301", title: "Systems Integration and Architecture", program: "BSIT", units: 3, yearLevel: 3 }
];

const enrollments = [
  { id: 1, studentId: 1, academicYear: "2026-2027", semester: "1st Semester", status: "Pending" },
  { id: 2, studentId: 2, academicYear: "2026-2027", semester: "1st Semester", status: "Approved" }
];

const academicRecords = [
  { id: 1, studentId: 2, courseId: 2, academicYear: "2026-2027", semester: "1st Semester", grade: 1.75 },
  { id: 2, studentId: 3, courseId: 3, academicYear: "2026-2027", semester: "1st Semester", grade: 1.5 }
];

module.exports = {
  programs,
  students,
  courses,
  enrollments,
  academicRecords
};
