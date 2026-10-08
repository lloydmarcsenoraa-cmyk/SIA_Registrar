
const API = "http://localhost:3000/api";
const $ = id => document.getElementById(id);

let students = [];
let enrollments = [];
let courses = [];
let programs = [];
let academicRecords = [];

function notify(message, error = false) {
  const el = $("notice");
  el.textContent = message;
  el.className = error ? "notice error" : "notice";
  el.hidden = false;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed");
  }
  return result;
}

async function loadData() {
  try {
    const results = await Promise.all([
      request(`${API}/students`),
      request(`${API}/enrollments`),
      request(`${API}/courses`),
      request(`${API}/programs`),
      request(`${API}/academic-records`)
    ]);

    students = results[0].data;
    enrollments = results[1].data;
    courses = results[2].data;
    programs = results[3].data;
    academicRecords = results[4].data;

    populatePrograms();
    renderDashboard();
    renderStudents();
    renderEnrollments();
    renderCourses();
    renderAcademicRecords();

    $("notice").hidden = true;
  } catch (error) {
    notify("Unable to load data: " + error.message, true);
  }
}

function populatePrograms() {
  for (const [id, allOption] of [
    ["program", false],
    ["courseProgram", false],
    ["courseProgramFilter", true]
  ]) {
    const select = $(id);
    const previous = select.value;
    select.replaceChildren();

    if (allOption) select.add(new Option("All Programs", ""));

    for (const p of programs) {
      select.add(new Option(p.code, p.code));
    }

    if ([...select.options].some(o => o.value === previous)) {
      select.value = previous;
    }
  }
}

function renderDashboard() {
  $("totalStudents").textContent = students.length;
  $("enrolledStudents").textContent =
    students.filter(s => s.status === "Enrolled").length;
  $("pendingEnrollments").textContent =
    enrollments.filter(e => e.status === "Pending").length;
  $("totalCourses").textContent = courses.length;
}

function cell(row, value) {
  const td = document.createElement("td");
  td.textContent = value ?? "—";
  row.appendChild(td);
  return td;
}

function actionButton(label, callback, isDelete = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isDelete ? "action-btn delete" : "action-btn";
  button.textContent = label;
  button.addEventListener("click", callback);
  return button;
}

function statusBadge(status) {
  const badge = document.createElement("span");
  badge.className = "badge " +
    (["Approved", "Enrolled", "Passed"].includes(status)
      ? "enrolled"
      : "pending");
  badge.textContent = status;
  return badge;
}

function emptyRow(tbody, columns, message) {
  const tr = document.createElement("tr");
  const td = cell(tr, message);
  td.colSpan = columns;
  tbody.appendChild(tr);
}

async function saveResource(url, method, data) {
  return request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

// STUDENTS

function renderStudents() {
  const search = $("searchInput").value.toLowerCase().trim();
  const status = $("statusFilter").value;
  const tbody = $("studentTable");
  tbody.replaceChildren();

  const filtered = students.filter(s =>
    [s.studentNumber, s.firstName, s.lastName, s.program]
      .join(" ").toLowerCase().includes(search) &&
    (!status || s.status === status)
  );

  for (const s of filtered) {
    const row = document.createElement("tr");
    cell(row, s.studentNumber);
    cell(row, `${s.firstName} ${s.lastName}`);
    cell(row, s.program);
    cell(row, s.yearLevel);

    const td = document.createElement("td");
    td.appendChild(statusBadge(s.status));
    row.appendChild(td);

    const actions = document.createElement("td");
    actions.append(
      actionButton("Edit", () => editStudent(s.id)),
      actionButton("Delete", () => deleteStudent(s.id), true)
    );
    row.appendChild(actions);
    tbody.appendChild(row);
  }

  if (!filtered.length) emptyRow(tbody, 6, "No students found.");

  $("recordCount").textContent =
    `Showing ${filtered.length} of ${students.length} students`;
}

function openAddStudent() {
  $("studentForm").reset();
  $("studentId").value = "";
  $("dialogTitle").textContent = "Add Student";
  $("studentDialog").showModal();
}

function editStudent(id) {
  const s = students.find(item => item.id === id);
  if (!s) return;

  $("studentId").value = s.id;
  $("studentNumber").value = s.studentNumber;
  $("firstName").value = s.firstName;
  $("lastName").value = s.lastName;
  $("program").value = s.program;
  $("yearLevel").value = s.yearLevel;
  $("studentStatus").value = s.status;
  $("dialogTitle").textContent = "Edit Student";
  $("studentDialog").showModal();
}

async function saveStudent(event) {
  event.preventDefault();
  const id = $("studentId").value;

  const data = {
    studentNumber: $("studentNumber").value.trim(),
    firstName: $("firstName").value.trim(),
    lastName: $("lastName").value.trim(),
    program: $("program").value,
    yearLevel: Number($("yearLevel").value),
    status: $("studentStatus").value
  };

  const button = $("saveStudentBtn");
  button.disabled = true;

  try {
    await saveResource(
      id ? `${API}/students/${id}` : `${API}/students`,
      id ? "PUT" : "POST",
      data
    );
    $("studentDialog").close();
    await loadData();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
}

async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  try {
    await request(`${API}/students/${id}`, { method: "DELETE" });
    await loadData();
  } catch (error) {
    alert(error.message);
  }
}

// ENROLLMENTS

function renderEnrollments() {
  const search = $("enrollmentSearch").value.toLowerCase().trim();
  const status = $("enrollmentFilter").value;
  const tbody = $("enrollmentTable");
  tbody.replaceChildren();

  const filtered = enrollments.filter(e =>
    [e.studentNumber, e.studentName, e.program, e.academicYear]
      .join(" ").toLowerCase().includes(search) &&
    (!status || e.status === status)
  );

  for (const e of filtered) {
    const row = document.createElement("tr");
    cell(row, e.studentNumber);
    cell(row, e.studentName);
    cell(row, e.program);
    cell(row, e.academicYear);
    cell(row, e.semester);

    const td = document.createElement("td");
    td.appendChild(statusBadge(e.status));
    row.appendChild(td);

    const actions = document.createElement("td");

    if (e.status === "Pending") {
      actions.append(
        actionButton("Approve", () => updateEnrollment(e.id, "Approved")),
        actionButton("Reject", () => updateEnrollment(e.id, "Rejected"), true)
      );
    } else {
      actions.textContent = "Reviewed";
    }

    row.appendChild(actions);
    tbody.appendChild(row);
  }

  if (!filtered.length) emptyRow(tbody, 7, "No enrollments found.");

  $("enrollmentCount").textContent =
    `Showing ${filtered.length} of ${enrollments.length} enrollments`;
}

function openEnrollment() {
  const select = $("enrollmentStudent");
  select.replaceChildren();

  for (const s of students) {
    select.add(new Option(
      `${s.studentNumber} - ${s.firstName} ${s.lastName}`,
      s.id
    ));
  }

  if (!students.length) {
    alert("Add a student first.");
    return;
  }

  $("enrollmentForm").reset();
  $("enrollmentDialog").showModal();
}

async function saveEnrollment(event) {
  event.preventDefault();

  const button = $("saveEnrollmentBtn");
  button.disabled = true;

  try {
    await saveResource(`${API}/enrollments`, "POST", {
      studentId: Number($("enrollmentStudent").value),
      academicYear: $("academicYear").value.trim(),
      semester: $("semester").value
    });

    $("enrollmentDialog").close();
    await loadData();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
}

async function updateEnrollment(id, status) {
  if (!confirm(`${status} this enrollment?`)) return;

  try {
    await saveResource(
      `${API}/enrollments/${id}/status`,
      "PATCH",
      { status }
    );
    await loadData();
  } catch (error) {
    alert(error.message);
  }
}

// COURSES

function renderCourses() {
  const search = $("courseSearch").value.toLowerCase().trim();
  const program = $("courseProgramFilter").value;
  const tbody = $("courseTable");
  tbody.replaceChildren();

  const filtered = courses.filter(c =>
    [c.code, c.title, c.program].join(" ")
      .toLowerCase().includes(search) &&
    (!program || c.program === program)
  );

  for (const c of filtered) {
    const row = document.createElement("tr");
    cell(row, c.code);
    cell(row, c.title);
    cell(row, c.program);
    cell(row, c.units);
    cell(row, c.yearLevel);

    const actions = document.createElement("td");
    actions.append(
      actionButton("Edit", () => editCourse(c.id)),
      actionButton("Delete", () => deleteCourse(c.id), true)
    );
    row.appendChild(actions);
    tbody.appendChild(row);
  }

  if (!filtered.length) emptyRow(tbody, 6, "No courses found.");

  $("courseCount").textContent =
    `Showing ${filtered.length} of ${courses.length} courses`;
}

function openAddCourse() {
  $("courseForm").reset();
  $("courseId").value = "";
  $("courseDialogTitle").textContent = "Add Course";
  $("courseDialog").showModal();
}

function editCourse(id) {
  const c = courses.find(item => item.id === id);
  if (!c) return;

  $("courseId").value = c.id;
  $("courseCode").value = c.code;
  $("courseTitle").value = c.title;
  $("courseProgram").value = c.program;
  $("courseUnits").value = c.units;
  $("courseYearLevel").value = c.yearLevel;
  $("courseDialogTitle").textContent = "Edit Course";
  $("courseDialog").showModal();
}

async function saveCourse(event) {
  event.preventDefault();
  const id = $("courseId").value;

  const button = $("saveCourseBtn");
  button.disabled = true;

  try {
    await saveResource(
      id ? `${API}/courses/${id}` : `${API}/courses`,
      id ? "PUT" : "POST",
      {
        code: $("courseCode").value.trim(),
        title: $("courseTitle").value.trim(),
        program: $("courseProgram").value,
        units: Number($("courseUnits").value),
        yearLevel: Number($("courseYearLevel").value)
      }
    );

    $("courseDialog").close();
    await loadData();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
}

async function deleteCourse(id) {
  if (!confirm("Delete this course?")) return;

  try {
    await request(`${API}/courses/${id}`, { method: "DELETE" });
    await loadData();
  } catch (error) {
    alert(error.message);
  }
}

// ACADEMIC RECORDS

function renderAcademicRecords() {
  const search = $("recordSearch").value.toLowerCase().trim();
  const remark = $("recordRemarkFilter").value;
  const tbody = $("academicTable");
  tbody.replaceChildren();

  const filtered = academicRecords.filter(r =>
    [
      r.studentNumber,
      r.studentName,
      r.courseCode,
      r.courseTitle,
      r.academicYear
    ].join(" ").toLowerCase().includes(search) &&
    (!remark || r.remarks === remark)
  );

  for (const r of filtered) {
    const row = document.createElement("tr");

    cell(row, `${r.studentName} (${r.studentNumber})`);
    cell(row, `${r.courseCode} - ${r.courseTitle}`);
    cell(row, r.academicYear);
    cell(row, r.semester);
    cell(row, Number(r.grade).toFixed(2));

    const remarkCell = document.createElement("td");
    remarkCell.appendChild(statusBadge(r.remarks));
    row.appendChild(remarkCell);

    const actions = document.createElement("td");
    actions.append(
      actionButton("Edit", () => editRecord(r.id)),
      actionButton("Delete", () => deleteRecord(r.id), true)
    );

    row.appendChild(actions);
    tbody.appendChild(row);
  }

  if (!filtered.length) {
    emptyRow(tbody, 7, "No academic records found.");
  }

  $("academicCount").textContent =
    `Showing ${filtered.length} of ${academicRecords.length} academic records`;
}

function populateRecordOptions() {
  const studentSelect = $("recordStudent");
  const courseSelect = $("recordCourse");

  studentSelect.replaceChildren();
  courseSelect.replaceChildren();

  for (const s of students) {
    studentSelect.add(new Option(
      `${s.studentNumber} - ${s.firstName} ${s.lastName}`,
      s.id
    ));
  }

  for (const c of courses) {
    courseSelect.add(new Option(
      `${c.code} - ${c.title}`,
      c.id
    ));
  }
}

function openAddRecord() {
  if (!students.length || !courses.length) {
    alert("You need at least one student and one course.");
    return;
  }

  $("recordForm").reset();
  $("recordId").value = "";
  $("recordDialogTitle").textContent = "Add Grade";
  populateRecordOptions();
  $("recordDialog").showModal();
}

function editRecord(id) {
  const r = academicRecords.find(item => item.id === id);
  if (!r) return;

  populateRecordOptions();

  $("recordId").value = r.id;
  $("recordStudent").value = r.studentId;
  $("recordCourse").value = r.courseId;
  $("recordAcademicYear").value = r.academicYear;
  $("recordSemester").value = r.semester;
  $("recordGrade").value = r.grade;
  $("recordDialogTitle").textContent = "Edit Grade";
  $("recordDialog").showModal();
}

async function saveRecord(event) {
  event.preventDefault();
  const id = $("recordId").value;

  const data = {
    studentId: Number($("recordStudent").value),
    courseId: Number($("recordCourse").value),
    academicYear: $("recordAcademicYear").value.trim(),
    semester: $("recordSemester").value,
    grade: Number($("recordGrade").value)
  };

  const button = $("saveRecordBtn");
  button.disabled = true;

  try {
    await saveResource(
      id ? `${API}/academic-records/${id}` : `${API}/academic-records`,
      id ? "PUT" : "POST",
      data
    );

    $("recordDialog").close();
    await loadData();
  } catch (error) {
    alert("Unable to save grade: " + error.message);
  } finally {
    button.disabled = false;
  }
}

async function deleteRecord(id) {
  if (!confirm("Delete this academic record?")) return;

  try {
    await request(`${API}/academic-records/${id}`, {
      method: "DELETE"
    });
    await loadData();
  } catch (error) {
    alert("Unable to delete grade: " + error.message);
  }
}

// NAVIGATION

const pages = {
  dashboard: ["Registrar Dashboard", "Registrar overview and statistics."],
  students: ["Student Records", "Manage registered students."],
  enrollments: ["Enrollment Management", "Review enrollment applications."],
  courses: ["Course Management", "Manage academic courses and programs."],
  academic: ["Academic Records", "Manage student grades and performance."]
};

function showPage(page) {
  const current = pages[page] ? page : "dashboard";

  for (const id of Object.keys(pages)) {
    $(id).hidden = id !== current;
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === current);
  });

  $("pageTitle").textContent = pages[current][0];
  $("pageDescription").textContent = pages[current][1];
  window.scrollTo(0, 0);
}

function navigate(page) {
  window.location.hash = page;
  showPage(page);
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    navigate(link.dataset.page);
  });
});

window.addEventListener("hashchange", () => {
  showPage(window.location.hash.substring(1));
});

// EVENT HANDLERS

$("refreshBtn").addEventListener("click", loadData);

for (const [button, page] of [
  ["viewStudentsBtn", "students"],
  ["viewEnrollmentsBtn", "enrollments"],
  ["viewCoursesBtn", "courses"],
  ["viewAcademicBtn", "academic"]
]) {
  $(button).addEventListener("click", () => navigate(page));
}

$("addStudentBtn").addEventListener("click", openAddStudent);
$("studentForm").addEventListener("submit", saveStudent);
$("searchInput").addEventListener("input", renderStudents);
$("statusFilter").addEventListener("change", renderStudents);
$("closeDialog").addEventListener("click", () => $("studentDialog").close());
$("cancelDialog").addEventListener("click", () => $("studentDialog").close());

$("addEnrollmentBtn").addEventListener("click", openEnrollment);
$("enrollmentForm").addEventListener("submit", saveEnrollment);
$("enrollmentSearch").addEventListener("input", renderEnrollments);
$("enrollmentFilter").addEventListener("change", renderEnrollments);
$("closeEnrollmentDialog").addEventListener("click",
  () => $("enrollmentDialog").close());
$("cancelEnrollmentDialog").addEventListener("click",
  () => $("enrollmentDialog").close());

$("addCourseBtn").addEventListener("click", openAddCourse);
$("courseForm").addEventListener("submit", saveCourse);
$("courseSearch").addEventListener("input", renderCourses);
$("courseProgramFilter").addEventListener("change", renderCourses);
$("closeCourseDialog").addEventListener("click",
  () => $("courseDialog").close());
$("cancelCourseDialog").addEventListener("click",
  () => $("courseDialog").close());

$("addRecordBtn").addEventListener("click", openAddRecord);
$("recordForm").addEventListener("submit", saveRecord);
$("recordSearch").addEventListener("input", renderAcademicRecords);
$("recordRemarkFilter").addEventListener("change", renderAcademicRecords);
$("closeRecordDialog").addEventListener("click",
  () => $("recordDialog").close());
$("cancelRecordDialog").addEventListener("click",
  () => $("recordDialog").close());

// INITIALIZE

showPage(window.location.hash.substring(1));
loadData();
