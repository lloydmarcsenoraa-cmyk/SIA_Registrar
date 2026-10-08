const express = require("express");
const service = require("../services/registrarService");

const router = express.Router();

function problem(res, status, title, detail) {
  return res.status(status)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title,
      status,
      detail
    });
}

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/programs", (req, res) => {
  const data = service.getAll("programs");
  res.json({ success: true, count: data.length, data });
});

router.get("/students", (req, res) => {
  const data = service.getAll("students");
  res.json({ success: true, count: data.length, data });
});

router.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  const data = service.getById("students", id);

  if (!data) {
    return problem(res, 404, "Not Found", "Student not found");
  }

  res.json({ success: true, data });
});

const extraResources = [
  ["enrollments", "enrollments", "Enrollment"],
  ["courses", "courses", "Course"],
  ["academic-records", "academicRecords", "Academic record"]
];

for (const [url, type, label] of extraResources) {
  router.get(`/${url}`, (req, res) => {
    const data = service.getAll(type);
    res.json({ success: true, count: data.length, data });
  });

  router.get(`/${url}/:id`, (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return problem(res, 400, "Bad Request", "Invalid ID");
    }

    const data = service.getById(type, id);

    if (!data) {
      return problem(res, 404, "Not Found", `${label} not found`);
    }

    res.json({ success: true, data });
  });
}

router.post("/students", (req, res) => {
  const {
    studentNumber,
    firstName,
    lastName,
    program,
    yearLevel,
    status = "Pending"
  } = req.body || {};

  const validText = value =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !validText(studentNumber) ||
    !validText(firstName) ||
    !validText(lastName) ||
    !validText(program) ||
    !Number.isInteger(yearLevel) ||
    yearLevel < 1 ||
    yearLevel > 6 ||
    !["Pending", "Enrolled"].includes(status)
  ) {
    return problem(res, 400, "Bad Request", "Invalid student information");
  }

  const programExists = service.getAll("programs")
    .some(item => item.code === program);

  if (!programExists) {
    return problem(res, 400, "Bad Request", "Invalid program");
  }

  const duplicate = service.getAll("students")
    .some(item => item.studentNumber === studentNumber);

  if (duplicate) {
    return problem(res, 409, "Conflict", "Student number already exists");
  }

  const student = service.create("students", {
    studentNumber,
    firstName,
    lastName,
    program,
    yearLevel,
    status
  });

  res.status(201).json({ success: true, data: student });
});

router.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  const current = service.getById("students", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Student not found");
  }

  const allowed = [
    "studentNumber", "firstName", "lastName",
    "program", "yearLevel", "status"
  ];

  const changes = Object.fromEntries(
    Object.entries(req.body || {})
      .filter(([key]) => allowed.includes(key))
  );

  const student = { ...current, ...changes };

  const validText = value =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !validText(student.studentNumber) ||
    !validText(student.firstName) ||
    !validText(student.lastName) ||
    !validText(student.program) ||
    !Number.isInteger(student.yearLevel) ||
    student.yearLevel < 1 ||
    student.yearLevel > 6 ||
    !["Pending", "Enrolled"].includes(student.status)
  ) {
    return problem(res, 400, "Bad Request", "Invalid student information");
  }

  if (!service.getAll("programs").some(p => p.code === student.program)) {
    return problem(res, 400, "Bad Request", "Invalid program");
  }

  if (service.getAll("students").some(
    s => s.studentNumber === student.studentNumber && s.id !== id
  )) {
    return problem(res, 409, "Conflict", "Student number already exists");
  }

  const updated = service.update("students", id, changes);
  res.json({ success: true, data: updated });
});

router.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  const current = service.getById("students", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Student not found");
  }

  const hasEnrollment = service.getAll("enrollments")
    .some(e => e.studentId === id);

  const hasRecords = service.getAll("academicRecords")
    .some(r => r.studentId === id);

  if (hasEnrollment || hasRecords) {
    return problem(
      res, 409, "Conflict",
      "Cannot delete a student with enrollment or academic records"
    );
  }

  const deleted = service.remove("students", id);
  res.json({ success: true, data: deleted });
});

router.post("/courses", (req, res) => {
  const { code, title, program, units, yearLevel } = req.body || {};

  const validText = value =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !validText(code) ||
    !validText(title) ||
    !validText(program) ||
    !Number.isInteger(units) ||
    units < 1 || units > 12 ||
    !Number.isInteger(yearLevel) ||
    yearLevel < 1 || yearLevel > 6
  ) {
    return problem(res, 400, "Bad Request", "Invalid course information");
  }

  if (!service.getAll("programs").some(p => p.code === program)) {
    return problem(res, 400, "Bad Request", "Invalid program");
  }

  if (service.getAll("courses").some(c => c.code === code)) {
    return problem(res, 409, "Conflict", "Course code already exists");
  }

  const course = service.create("courses", {
    code, title, program, units, yearLevel
  });

  res.status(201).json({ success: true, data: course });
});

router.put("/courses/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid course ID");
  }

  const current = service.getById("courses", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Course not found");
  }

  const allowed = ["code", "title", "program", "units", "yearLevel"];
  const changes = Object.fromEntries(
    Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
  );

  const course = { ...current, ...changes };
  const validText = value =>
    typeof value === "string" && value.trim().length > 0;

  if (
    !validText(course.code) ||
    !validText(course.title) ||
    !validText(course.program) ||
    !Number.isInteger(course.units) ||
    course.units < 1 || course.units > 12 ||
    !Number.isInteger(course.yearLevel) ||
    course.yearLevel < 1 || course.yearLevel > 6
  ) {
    return problem(res, 400, "Bad Request", "Invalid course information");
  }

  if (!service.getAll("programs").some(p => p.code === course.program)) {
    return problem(res, 400, "Bad Request", "Invalid program");
  }

  if (service.getAll("courses").some(
    c => c.code === course.code && c.id !== id
  )) {
    return problem(res, 409, "Conflict", "Course code already exists");
  }

  const updated = service.update("courses", id, changes);
  res.json({ success: true, data: updated });
});

router.delete("/courses/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid course ID");
  }

  const current = service.getById("courses", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Course not found");
  }

  const hasRecords = service.getAll("academicRecords")
    .some(record => record.courseId === id);

  if (hasRecords) {
    return problem(
      res, 409, "Conflict",
      "Cannot delete a course with academic records"
    );
  }

  const deleted = service.remove("courses", id);
  res.json({ success: true, data: deleted });
});

router.patch("/enrollments/:id/status", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid enrollment ID");
  }

  const enrollment = service.getById("enrollments", id);

  if (!enrollment) {
    return problem(res, 404, "Not Found", "Enrollment not found");
  }

  const { status } = req.body || {};

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return problem(
      res, 400, "Bad Request",
      "Status must be Pending, Approved, or Rejected"
    );
  }

  const updated = service.update("enrollments", id, { status });

  res.json({ success: true, data: updated });
});

router.post("/enrollments", (req, res) => {
  const { studentId, academicYear, semester } = req.body || {};

  if (!Number.isSafeInteger(studentId) || studentId <= 0) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  if (!service.getById("students", studentId)) {
    return problem(res, 400, "Bad Request", "Student does not exist");
  }

  if (typeof academicYear !== "string" ||
      !/^\d{4}-\d{4}$/.test(academicYear) ||
      Number(academicYear.slice(5)) !== Number(academicYear.slice(0, 4)) + 1) {
    return problem(res, 400, "Bad Request", "Invalid academic year");
  }

  if (!["1st Semester", "2nd Semester", "Summer"].includes(semester)) {
    return problem(res, 400, "Bad Request", "Invalid semester");
  }

  const duplicate = service.getAll("enrollments").some(e =>
    e.studentId === studentId &&
    e.academicYear === academicYear &&
    e.semester === semester
  );

  if (duplicate) {
    return problem(res, 409, "Conflict", "Enrollment already exists");
  }

  const enrollment = service.create("enrollments", {
    studentId,
    academicYear,
    semester,
    status: "Pending"
  });

  res.status(201).json({ success: true, data: enrollment });
});

router.post("/academic-records", (req, res) => {
  const { studentId, courseId, academicYear, semester, grade } = req.body || {};

  if (!Number.isSafeInteger(studentId) || studentId <= 0 ||
      !service.getById("students", studentId)) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  if (!Number.isSafeInteger(courseId) || courseId <= 0 ||
      !service.getById("courses", courseId)) {
    return problem(res, 400, "Bad Request", "Invalid course ID");
  }

  if (typeof academicYear !== "string" ||
      !/^\d{4}-\d{4}$/.test(academicYear) ||
      Number(academicYear.slice(5)) !== Number(academicYear.slice(0, 4)) + 1) {
    return problem(res, 400, "Bad Request", "Invalid academic year");
  }

  if (!["1st Semester", "2nd Semester", "Summer"].includes(semester)) {
    return problem(res, 400, "Bad Request", "Invalid semester");
  }

  if (typeof grade !== "number" || !Number.isFinite(grade) ||
      grade < 1 || grade > 5) {
    return problem(res, 400, "Bad Request", "Grade must be between 1 and 5");
  }

  const duplicate = service.getAll("academicRecords").some(record =>
    record.studentId === studentId &&
    record.courseId === courseId &&
    record.academicYear === academicYear &&
    record.semester === semester
  );

  if (duplicate) {
    return problem(res, 409, "Conflict", "Academic record already exists");
  }

  const record = service.create("academicRecords", {
    studentId,
    courseId,
    academicYear,
    semester,
    grade
  });

  res.status(201).json({ success: true, data: record });
});

router.put("/academic-records/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid record ID");
  }

  const current = service.getById("academicRecords", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Academic record not found");
  }

  const allowed = [
    "studentId", "courseId", "academicYear", "semester", "grade"
  ];

  const changes = Object.fromEntries(
    Object.entries(req.body || {})
      .filter(([key]) => allowed.includes(key))
  );

  const record = { ...current, ...changes };

  if (!Number.isSafeInteger(record.studentId) ||
      !service.getById("students", record.studentId)) {
    return problem(res, 400, "Bad Request", "Invalid student ID");
  }

  if (!Number.isSafeInteger(record.courseId) ||
      !service.getById("courses", record.courseId)) {
    return problem(res, 400, "Bad Request", "Invalid course ID");
  }

  if (typeof record.academicYear !== "string" ||
      !/^\d{4}-\d{4}$/.test(record.academicYear) ||
      Number(record.academicYear.slice(5)) !==
        Number(record.academicYear.slice(0, 4)) + 1) {
    return problem(res, 400, "Bad Request", "Invalid academic year");
  }

  if (!["1st Semester", "2nd Semester", "Summer"].includes(record.semester)) {
    return problem(res, 400, "Bad Request", "Invalid semester");
  }

  if (typeof record.grade !== "number" ||
      !Number.isFinite(record.grade) ||
      record.grade < 1 || record.grade > 5) {
    return problem(res, 400, "Bad Request", "Invalid grade");
  }

  const duplicate = service.getAll("academicRecords").some(r =>
    r.id !== id &&
    r.studentId === record.studentId &&
    r.courseId === record.courseId &&
    r.academicYear === record.academicYear &&
    r.semester === record.semester
  );

  if (duplicate) {
    return problem(res, 409, "Conflict", "Academic record already exists");
  }

  const updated = service.update("academicRecords", id, changes);
  res.json({ success: true, data: updated });
});

router.delete("/academic-records/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return problem(res, 400, "Bad Request", "Invalid record ID");
  }

  const current = service.getById("academicRecords", id);

  if (!current) {
    return problem(res, 404, "Not Found", "Academic record not found");
  }

  const deleted = service.remove("academicRecords", id);
  res.json({ success: true, data: deleted });
});

module.exports = router;
