
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

// =======================================
// HELPERS
// =======================================

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const validId = (value) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const validYear = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{4}$/.test(value) &&
  Number(value.slice(5)) === Number(value.slice(0, 4)) + 1;

const validSemester = (value) =>
  ["1st Semester", "2nd Semester", "Summer"].includes(value);

const nonempty = (value) =>
  typeof value === "string" && value.trim().length > 0;

const pick = (source, keys) =>
  Object.fromEntries(
    Object.entries(source || {}).filter(([key]) => keys.includes(key))
  );

const studentFields = [
  "studentNumber", "firstName", "lastName",
  "program", "yearLevel", "status"
];

const courseFields = [
  "code", "title", "program", "units", "yearLevel"
];

const recordFields = [
  "studentId", "courseId", "academicYear",
  "semester", "grade"
];

const validStudent = (s) =>
  nonempty(s.studentNumber) &&
  nonempty(s.firstName) &&
  nonempty(s.lastName) &&
  nonempty(s.program) &&
  Number.isInteger(s.yearLevel) &&
  s.yearLevel >= 1 &&
  s.yearLevel <= 6 &&
  ["Pending", "Enrolled"].includes(s.status);

const validCourse = (c) =>
  nonempty(c.code) &&
  nonempty(c.title) &&
  nonempty(c.program) &&
  Number.isInteger(c.units) &&
  c.units >= 1 &&
  c.units <= 12 &&
  Number.isInteger(c.yearLevel) &&
  c.yearLevel >= 1 &&
  c.yearLevel <= 6;

const validRecord = (r) =>
  validId(r.studentId) &&
  validId(r.courseId) &&
  validYear(r.academicYear) &&
  validSemester(r.semester) &&
  typeof r.grade === "number" &&
  Number.isFinite(r.grade) &&
  r.grade >= 1 &&
  r.grade <= 5;

async function queryOne(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
}

async function queryAll(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function exists(table, column, value) {
  const allowed = {
    programs: ["code"],
    students: ["id", "studentNumber"],
    courses: ["id", "code"]
  };

  if (!allowed[table]?.includes(column)) {
    throw new Error("Invalid lookup");
  }

  return Boolean(
    await queryOne(
      `SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`,
      [value]
    )
  );
}

function databaseError(error, res, next) {
  if (error.code === "ER_DUP_ENTRY") {
    return fail(res, 409, "A record with these values already exists");
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return fail(res, 400, "Referenced student, course, or program does not exist");
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return fail(res, 409, "Cannot delete a record used by another record");
  }

  next(error);
}

const enrollmentSelect = `
  SELECT e.id, e.studentId, e.academicYear,
         e.semester, e.status,
         s.studentNumber,
         CONCAT(s.firstName, ' ', s.lastName) AS studentName,
         s.program
  FROM enrollments e
  JOIN students s ON s.id = e.studentId
`;

const recordSelect = `
  SELECT r.id, r.studentId, r.courseId,
         r.academicYear, r.semester, r.grade,
         s.studentNumber,
         CONCAT(s.firstName, ' ', s.lastName) AS studentName,
         c.code AS courseCode,
         c.title AS courseTitle,
         s.program,
         CASE
           WHEN r.grade <= 3 THEN 'Passed'
           ELSE 'Failed'
         END AS remarks
  FROM academic_records r
  JOIN students s ON s.id = r.studentId
  JOIN courses c ON c.id = r.courseId
`;

// =======================================
// API STATUS
// =======================================

app.get("/api", (req, res) => {
  res.json({
    system: "SIA Registrar Management System",
    module: "Registrar",
    status: "API Running",
    version: "2.0.0",
    database: "MySQL"
  });
});

// =======================================
// PROGRAMS
// =======================================

app.get("/api/programs", asyncRoute(async (req, res) => {
  const data = await queryAll(
    "SELECT id, code, name FROM programs ORDER BY id"
  );

  res.json({ success: true, count: data.length, data });
}));

// =======================================
// STUDENTS CRUD
// =======================================

app.get("/api/students", asyncRoute(async (req, res) => {
  const data = await queryAll(
    `SELECT id, studentNumber, firstName, lastName,
            program, yearLevel, status
     FROM students ORDER BY id`
  );

  res.json({ success: true, count: data.length, data });
}));

app.get("/api/students/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Student not found");
  }

  const data = await queryOne(
    `SELECT id, studentNumber, firstName, lastName,
            program, yearLevel, status
     FROM students WHERE id = ?`,
    [req.params.id]
  );

  if (!data) return fail(res, 404, "Student not found");

  res.json({ success: true, data });
}));

app.post("/api/students", asyncRoute(async (req, res) => {
  const student = {
    ...pick(req.body, studentFields),
    status: req.body?.status ?? "Pending"
  };

  if (!validStudent(student)) {
    return fail(res, 400, "Invalid student information");
  }

  if (!(await exists("programs", "code", student.program))) {
    return fail(res, 400, "Invalid program");
  }

  if (await exists("students", "studentNumber", student.studentNumber)) {
    return fail(res, 409, "Student number already exists");
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO students
       (studentNumber, firstName, lastName, program, yearLevel, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student.studentNumber,
        student.firstName,
        student.lastName,
        student.program,
        student.yearLevel,
        student.status
      ]
    );

    const data = await queryOne(
      `SELECT id, studentNumber, firstName, lastName,
              program, yearLevel, status
       FROM students WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.put("/api/students/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Student not found");
  }

  const current = await queryOne(
    `SELECT id, studentNumber, firstName, lastName,
            program, yearLevel, status
     FROM students WHERE id = ?`,
    [req.params.id]
  );

  if (!current) return fail(res, 404, "Student not found");

  const student = {
    ...current,
    ...pick(req.body, studentFields)
  };

  if (!validStudent(student)) {
    return fail(res, 400, "Invalid student information");
  }

  if (!(await exists("programs", "code", student.program))) {
    return fail(res, 400, "Invalid program");
  }

  const duplicate = await queryOne(
    "SELECT id FROM students WHERE studentNumber = ? AND id <> ?",
    [student.studentNumber, current.id]
  );

  if (duplicate) {
    return fail(res, 409, "Student number already exists");
  }

  try {
    await db.execute(
      `UPDATE students SET
       studentNumber = ?, firstName = ?, lastName = ?,
       program = ?, yearLevel = ?, status = ?
       WHERE id = ?`,
      [
        student.studentNumber,
        student.firstName,
        student.lastName,
        student.program,
        student.yearLevel,
        student.status,
        current.id
      ]
    );

    res.json({ success: true, data: student });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.delete("/api/students/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Student not found");
  }

  const student = await queryOne(
    `SELECT id, studentNumber, firstName, lastName,
            program, yearLevel, status
     FROM students WHERE id = ?`,
    [req.params.id]
  );

  if (!student) return fail(res, 404, "Student not found");

  const related = await queryOne(
    `SELECT
       (SELECT COUNT(*) FROM enrollments WHERE studentId = ?) AS enrollments,
       (SELECT COUNT(*) FROM academic_records WHERE studentId = ?) AS records`,
    [student.id, student.id]
  );

  if (related.enrollments > 0 || related.records > 0) {
    return fail(
      res, 409,
      "Cannot delete a student with enrollment or academic records"
    );
  }

  try {
    await db.execute(
      "DELETE FROM students WHERE id = ?",
      [student.id]
    );

    res.json({ success: true, data: student });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

// =======================================
// ENROLLMENTS
// =======================================

app.get("/api/enrollments", asyncRoute(async (req, res) => {
  const data = await queryAll(
    enrollmentSelect + " ORDER BY e.id"
  );

  res.json({ success: true, count: data.length, data });
}));

app.get("/api/enrollments/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Enrollment not found");
  }

  const data = await queryOne(
    enrollmentSelect + " WHERE e.id = ?",
    [req.params.id]
  );

  if (!data) return fail(res, 404, "Enrollment not found");

  res.json({ success: true, data });
}));

app.post("/api/enrollments", asyncRoute(async (req, res) => {
  const { studentId, academicYear, semester } = req.body || {};

  if (
    !Number.isInteger(studentId) ||
    !validId(studentId) ||
    !validYear(academicYear) ||
    !validSemester(semester)
  ) {
    return fail(res, 400, "Invalid enrollment information");
  }

  if (!(await exists("students", "id", studentId))) {
    return fail(res, 400, "Student not found");
  }

  const duplicate = await queryOne(
    `SELECT id FROM enrollments
     WHERE studentId = ? AND academicYear = ? AND semester = ?`,
    [studentId, academicYear, semester]
  );

  if (duplicate) {
    return fail(res, 409, "Enrollment already exists");
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO enrollments
       (studentId, academicYear, semester, status)
       VALUES (?, ?, ?, 'Pending')`,
      [studentId, academicYear, semester]
    );

    const data = await queryOne(
      enrollmentSelect + " WHERE e.id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.patch("/api/enrollments/:id/status", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Enrollment not found");
  }

  const current = await queryOne(
    "SELECT id FROM enrollments WHERE id = ?",
    [req.params.id]
  );

  if (!current) return fail(res, 404, "Enrollment not found");

  const { status } = req.body || {};

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return fail(res, 400, "Invalid status");
  }

  await db.execute(
    "UPDATE enrollments SET status = ? WHERE id = ?",
    [status, current.id]
  );

  const data = await queryOne(
    enrollmentSelect + " WHERE e.id = ?",
    [current.id]
  );

  res.json({ success: true, data });
}));

// =======================================
// COURSES CRUD
// =======================================

app.get("/api/courses", asyncRoute(async (req, res) => {
  const data = await queryAll(
    `SELECT id, code, title, program, units, yearLevel
     FROM courses ORDER BY id`
  );

  res.json({ success: true, count: data.length, data });
}));

app.get("/api/courses/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Course not found");
  }

  const data = await queryOne(
    `SELECT id, code, title, program, units, yearLevel
     FROM courses WHERE id = ?`,
    [req.params.id]
  );

  if (!data) return fail(res, 404, "Course not found");

  res.json({ success: true, data });
}));

app.post("/api/courses", asyncRoute(async (req, res) => {
  const course = pick(req.body, courseFields);

  if (!validCourse(course)) {
    return fail(res, 400, "Invalid course information");
  }

  if (!(await exists("programs", "code", course.program))) {
    return fail(res, 400, "Invalid program");
  }

  if (await exists("courses", "code", course.code)) {
    return fail(res, 409, "Course code already exists");
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO courses
       (code, title, program, units, yearLevel)
       VALUES (?, ?, ?, ?, ?)`,
      [
        course.code,
        course.title,
        course.program,
        course.units,
        course.yearLevel
      ]
    );

    const data = await queryOne(
      `SELECT id, code, title, program, units, yearLevel
       FROM courses WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.put("/api/courses/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Course not found");
  }

  const current = await queryOne(
    `SELECT id, code, title, program, units, yearLevel
     FROM courses WHERE id = ?`,
    [req.params.id]
  );

  if (!current) return fail(res, 404, "Course not found");

  const course = {
    ...current,
    ...pick(req.body, courseFields)
  };

  if (!validCourse(course)) {
    return fail(res, 400, "Invalid course information");
  }

  if (!(await exists("programs", "code", course.program))) {
    return fail(res, 400, "Invalid program");
  }

  const duplicate = await queryOne(
    "SELECT id FROM courses WHERE code = ? AND id <> ?",
    [course.code, current.id]
  );

  if (duplicate) {
    return fail(res, 409, "Course code already exists");
  }

  try {
    await db.execute(
      `UPDATE courses SET
       code = ?, title = ?, program = ?,
       units = ?, yearLevel = ?
       WHERE id = ?`,
      [
        course.code,
        course.title,
        course.program,
        course.units,
        course.yearLevel,
        current.id
      ]
    );

    res.json({ success: true, data: course });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.delete("/api/courses/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Course not found");
  }

  const course = await queryOne(
    `SELECT id, code, title, program, units, yearLevel
     FROM courses WHERE id = ?`,
    [req.params.id]
  );

  if (!course) return fail(res, 404, "Course not found");

  const related = await queryOne(
    "SELECT COUNT(*) AS total FROM academic_records WHERE courseId = ?",
    [course.id]
  );

  if (related.total > 0) {
    return fail(res, 409, "Cannot delete a course with academic records");
  }

  try {
    await db.execute(
      "DELETE FROM courses WHERE id = ?",
      [course.id]
    );

    res.json({ success: true, data: course });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

// =======================================
// ACADEMIC RECORDS CRUD
// =======================================

app.get("/api/academic-records", asyncRoute(async (req, res) => {
  const data = await queryAll(
    recordSelect + " ORDER BY r.id"
  );

  res.json({ success: true, count: data.length, data });
}));

app.get("/api/academic-records/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Academic record not found");
  }

  const data = await queryOne(
    recordSelect + " WHERE r.id = ?",
    [req.params.id]
  );

  if (!data) return fail(res, 404, "Academic record not found");

  res.json({ success: true, data });
}));

app.post("/api/academic-records", asyncRoute(async (req, res) => {
  const record = pick(req.body, recordFields);

  if (!validRecord(record)) {
    return fail(res, 400, "Invalid academic record");
  }

  if (
    !(await exists("students", "id", record.studentId)) ||
    !(await exists("courses", "id", record.courseId))
  ) {
    return fail(res, 400, "Student or course not found");
  }

  const duplicate = await queryOne(
    `SELECT id FROM academic_records
     WHERE studentId = ? AND courseId = ?
       AND academicYear = ? AND semester = ?`,
    [
      record.studentId,
      record.courseId,
      record.academicYear,
      record.semester
    ]
  );

  if (duplicate) {
    return fail(
      res, 409,
      "Grade already exists for this student, course, and term"
    );
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO academic_records
       (studentId, courseId, academicYear, semester, grade)
       VALUES (?, ?, ?, ?, ?)`,
      [
        record.studentId,
        record.courseId,
        record.academicYear,
        record.semester,
        record.grade
      ]
    );

    const data = await queryOne(
      recordSelect + " WHERE r.id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.put("/api/academic-records/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Academic record not found");
  }

  const current = await queryOne(
    `SELECT id, studentId, courseId, academicYear,
            semester, grade
     FROM academic_records WHERE id = ?`,
    [req.params.id]
  );

  if (!current) {
    return fail(res, 404, "Academic record not found");
  }

  const record = {
    ...current,
    ...pick(req.body, recordFields)
  };

  if (!validRecord(record)) {
    return fail(res, 400, "Invalid academic record");
  }

  if (
    !(await exists("students", "id", record.studentId)) ||
    !(await exists("courses", "id", record.courseId))
  ) {
    return fail(res, 400, "Student or course not found");
  }

  const duplicate = await queryOne(
    `SELECT id FROM academic_records
     WHERE studentId = ? AND courseId = ?
       AND academicYear = ? AND semester = ?
       AND id <> ?`,
    [
      record.studentId,
      record.courseId,
      record.academicYear,
      record.semester,
      current.id
    ]
  );

  if (duplicate) {
    return fail(res, 409, "Duplicate academic record");
  }

  try {
    await db.execute(
      `UPDATE academic_records SET
       studentId = ?, courseId = ?, academicYear = ?,
       semester = ?, grade = ?
       WHERE id = ?`,
      [
        record.studentId,
        record.courseId,
        record.academicYear,
        record.semester,
        record.grade,
        current.id
      ]
    );

    const data = await queryOne(
      recordSelect + " WHERE r.id = ?",
      [current.id]
    );

    res.json({ success: true, data });
  } catch (error) {
    databaseError(error, res, (err) => { throw err; });
  }
}));

app.delete("/api/academic-records/:id", asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) {
    return fail(res, 404, "Academic record not found");
  }

  const record = await queryOne(
    recordSelect + " WHERE r.id = ?",
    [req.params.id]
  );

  if (!record) {
    return fail(res, 404, "Academic record not found");
  }

  await db.execute(
    "DELETE FROM academic_records WHERE id = ?",
    [record.id]
  );

  res.json({ success: true, data: record });
}));

// =======================================
// ERROR HANDLING
// =======================================

app.use((error, req, res, next) => {
  console.error("API Error:", error);

  if (res.headersSent) return next(error);

  if (error.code === "ER_DUP_ENTRY") {
    return fail(res, 409, "Duplicate record");
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return fail(res, 409, "Record is referenced by other records");
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return fail(res, 400, "Referenced record does not exist");
  }

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// =======================================
// START SERVER
// =======================================

async function startServer() {
  try {
    await db.query("SELECT 1");

    app.listen(PORT, () => {
      console.log("MySQL connected successfully!");
      console.log(`RegistrarSys running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exitCode = 1;
    await db.end();
  }
}

startServer();
