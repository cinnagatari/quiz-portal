import React, { useEffect, useState, useContext, useRef } from "react";
import { version, loadDB } from "../../../libraries/loadDB";
import { course } from "../../../libraries/course";
import { classroom } from "../../../libraries/classroom";
import UserContext from "../../../utils/userContext";
import idb from "../../../utils/indexedDB";

export default function Courses() {
  let [courses, setCourses] = useState([]);
  let [classes, setClasses] = useState([]);
  let [users, setUsers] = useState([]);
  let [currentC, setCurrentC] = useState(-1);
  let [currentClass, setCurrentClass] = useState("");
  let [studentName, setStudentName] = useState("");
  let [errorMessage, setErrorMessage] = useState("");
  let user = useContext(UserContext);

  useEffect(() => {
    versionCheck();
  }, []);

  async function versionCheck() {
    let versionState = {};
    await version
      .check(["co", "u"])
      .then(versions => (versionState = versions));
    let courses = await idb.courses.get("courses").then(c => c);
    let classes = await idb.classes.get("classes").then(c => c);
    if (
      versionState.co === "load" ||
      courses === undefined ||
      classes === undefined
    ) {
      loadDB.courses().then(courses => setCourses(courses));
      loadDB.classes().then(classes => setClasses(classes));
    } else {
      setCourses(courses.courses);
      setClasses(classes.classes);
    }
    let users = await idb.users.get("users").then(u => u);
    if (versionState.u === "load" || users === undefined) {
      loadDB.users().then(users => setUsers(users));
    } else {
      setUsers(users.users);
    }
  }

  async function addStudent(student) {
      console.log(student);
    if (!currentClass.students.includes(student.username)) {
      classroom.addStudent(student, currentClass);
      setErrorMessage("");
    } else {
      setErrorMessage("Student is already in this class.");
    }
  }

  return (
    <div className="courses-container">
      <div className={"courses bg-2-" + user.theme}>
        <p className={"center c-title bg-1-" + user.theme}>Courses</p>
        <div className="course">
          {courses.map((c, i) => (
            <button
              className={"btn-medium btn-" + user.theme}
              key={"course-" + c}
              onClick={() => setCurrentC(i)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className={"classes bg-2-" + user.theme}>
        <p className={"center c-title bg-1-" + user.theme}>Classes</p>
        {currentC !== -1 && (
          <div className="class">
            {classes.map(c => {
              if (c.course === courses[currentC].name) {
                return (
                  <button
                    className={"btn-medium btn-" + user.theme}
                    key={courses[currentC].name + "-class-" + c.time}
                    onClick={() => setCurrentClass(c)}
                  >
                    {c.time}
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>
      {currentClass !== "" && (
        <div className="class">
          <p className={"class-title bg-1-" + user.theme}>
            {currentClass.time}
          </p>
          <div className="class-students">
            {users.map(u => {
              if (currentClass.students.includes(u.username)) {
                return (
                  <button
                    key={"current-user-" + u.username}
                    className={"btn-small btn-" + user.theme}
                  >
                    {u.name}
                  </button>
                );
              }
            })}
          </div>
          <StudentSelector
            students={users}
            addStudent={addStudent}
            errorMessage={errorMessage}
            user={user}
          />
        </div>
      )}
    </div>
  );
}

function StudentSelector({ students, addStudent, errorMessage, user }) {
  let [currentStudent, setCurrentStudent] = useState(0);
  let [studentName, setStudentName] = useState("");
  let [filtered, setFiltered] = useState(students);

  useEffect(() => {
    setCurrentStudent(0);

    setFiltered(
      students.filter(
        s => s.name.toLowerCase().indexOf(studentName.toLowerCase()) !== -1
      )
    );
  }, [studentName]);

  useEffect(() => {
    const onKeyDown = ev => {
      setCurrentStudent(current => {
        if (ev.key === "ArrowUp") {
          if (currentStudent === 0) setCurrentStudent(students.length - 1);
          else setCurrentStudent(currentStudent - 1);
        }
        if (ev.key === "ArrowDown") {
          if (currentStudent === students.length - 1) setCurrentStudent(0);
          else setCurrentStudent(currentStudent + 1);
        }
        if (ev.key === "Enter") {
          console.log(students[currentStudent]);
          addStudent(students[currentStudent]);
        }
        return currentStudent;
      });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [currentStudent, students]);

  return (
    <div>
      <div className="add-students">
        <p className={"a-title bg-1-" + user.theme}>Add Student</p>
        <div className="add-student">
          {errorMessage !== "" && (
            <p style={{ marginLeft: 5 }}>{errorMessage}</p>
          )}
          <div className="input-container">
            <input
              value={studentName}
              onChange={ev => setStudentName(ev.target.value)}
              placeholder="student"
              className="add-input inp-1"
            />
            <button
              className={"btn-small btn-" + user.theme}
              onClick={() => addStudent()}
            >
              Add Student
            </button>
          </div>
        </div>
      </div>
      <div className="student-selector">
        {filtered.map((s, i) => (
          <button
            key={"filtered-student-" + s.username}
            className={
              "s-option btn-small btn-" +
              user.theme +
              (i === currentStudent ? " btn-selected-" + user.theme : "")
            }
            onClick={() => setCurrentStudent(i)}
          >
            {s.name} {" - grade: " + s.grade}
          </button>
        ))}
      </div>
    </div>
  );
}
