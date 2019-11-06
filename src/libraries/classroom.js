import { loadDB, version } from "./loadDB";
import idb from "../utils/indexedDB";
import { db, firebase } from "../utils/firebase";

const classroom = {
  add: async function addClass(newClass) {
    let versionState = {};
    await version.check(["u", "co"]).then(v => (versionState = v));
  },

  edit: async function editClass(newClass, original) {},

  delete: async function deleteClass(original) {},

  addStudent: async function addStudent(newStudent, classroom) {
    let versionState = {};
    await version.check("u", "co").then(v => (versionState = v));
    let users = [];
    let idbUsers = await idb.users.get("users").then(u => u);
    if (idbUsers === undefined || versionState.u === "load") {
      await loadDB.users(u => {
        users = u;
      });
    } else {
      users = idbUsers.users;
    }
    let classes = [];
    let idbClasses = idb.classes.get("classes").then(c => c);
    if (idbClasses === undefined || versionState.co === "load") {
      await loadDB.classes(c => (classes = c));
    } else {
      classes = idbClasses.classes;
    }
    let usernames = users.filter(u => u.username);
    let newCourse = {};
    newStudent.courses.forEach(c => {
      if (c.name === classroom.name) newCourse = c;
    });
    if (
      usernames.includes(newStudent.username) &&
      !classroom.students.includes(newStudent.username) &&
      !newCourse.classes.includes(classroom.time)
    ) {
      classroom.students.push(newStudent.username);
      newStudent.courses = newStudent.courses.map(c => {
        if (c.course === classroom.course)
          return { ...c, classes: [...c.classes, classroom.time] };
        else return c;
      });
      await db
        .collection("users")
        .doc(newStudent.username)
        .set(newStudent);
    } else {
    }
  }
};

export { classroom };
