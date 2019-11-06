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
      await loadDB.users(u => u);
    } else {
      users = idbUsers.users;
    }
    let classes = [];
    let idbClasses = await idb.classes.get("classes").then(c => c);
    if (idbClasses === undefined || versionState.co === "load") {
      await loadDB.classes().then(c => {
        return (classes = c);
      });
    } else {
      classes = idbClasses.classes;
    }

    let usernames = users.map(u => u.username);
    let newCourse = {};
    newStudent.courses.forEach(c => {
      if (c.course === classroom.course) newCourse = c;
    });
    if (
      usernames.includes(newStudent.username) &&
      !classroom.students.includes(newStudent.username) &&
      (newCourse.classes === undefined ||
        !newCourse.classes.includes(classroom.name))
    ) {
      classroom.students.push(newStudent.username);
      console.log(newCourse);
      if (newCourse.course === undefined) {
        newCourse = { course: classroom.course, classes: [classroom.name] };
        newStudent.courses = [...newStudent.courses, newCourse];
      } else {
        newStudent.courses = newStudent.courses.map(c => {
          if (c.course === classroom.course) {
            return { ...c, classes: [...c.classes, classroom.name] };
          } else return c;
        });
      }
      await db
        .collection("users")
        .doc(newStudent.username)
        .set(newStudent);
      await db
        .collection("classes")
        .doc(classroom.course + "-" + classroom.name)
        .set(classroom);
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          users: firebase.firestore.FieldValue.increment(1),
          courses: firebase.firestore.FieldValue.increment(1)
        });
      users.map(u => {
        if (u.username === newStudent.username) return newStudent;
        else return u;
      });
      classes.map(c => {
        if (c.course === classroom.course && c.name === classroom.name)
          return classroom;
        else return c;
      });
      idb.users.update("users", { users: users });
      idb.classes.update("classes", { classes: classes });
      let uV = await idb.versions.get("users").then(u => u);
      if (uV !== undefined) {
        idb.versions.update("users", { version: uV.version + 1 });
      }
      let cV = await idb.versions.get("courses").then(u => u);
      if (cV !== undefined) {
        idb.versions.update("courses", { version: cV.version + 1 });
      }
      return { c: { ...classes }, u: { ...users } };
    } else {
      if (versionState.u === "load")
        idb.users.update("users", { users: users });
      if (versionState.co === "load")
        idb.classes.update("classes", { classes: classes });
      return {
        c: { ...classes },
        u: { ...users },
        error:
          "Error: The student you are trying to add or the classroom you are adding to no longer exists."
      };
    }
  },
  deleteStudent: async function deleteStudent(original, classroom) {
    console.log(2);
    let versionState = {};
    await version.check("u", "co").then(v => (versionState = v));
    let users = [];
    let idbUsers = await idb.users.get("users").then(u => u);
    if (idbUsers === undefined || versionState.u === "load") {
      await loadDB.users(u => u);
    } else {
      users = idbUsers.users;
    }
    let classes = [];
    let idbClasses = await idb.classes.get("classes").then(c => c);
    if (idbClasses === undefined || versionState.co === "load") {
      await loadDB.classes().then(c => {
        return (classes = c);
      });
    } else {
      classes = idbClasses.classes;
    }
    let usernames = users.map(u => u.username);
    let deleteCourse = {};
    original.courses.forEach(c => {
      if (c.course === classroom.course) deleteCourse = c;
    });
    console.log(3);
    if (
      usernames.includes(original.username) &&
      classroom.students.includes(original.username) &&
      deleteCourse.classes.includes(classroom.name)
    ) {
      classroom.students.filter(s => s !== original.username);
      original.courses = original.courses.filter(c => {
        if (c.course === classroom.course) {
          return { ...c, classes: c.classes.filter(c => c !== classroom.name) };
        } else return c;
      });
      await db
        .collection("users")
        .doc(original.username)
        .set({ ...original });
      await db
        .collection("classes")
        .doc(classroom.course + "-" + classroom.name)
        .set({ ...classroom });
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          users: firebase.firestore.FieldValue.increment(1),
          courses: firebase.firestore.FieldValue.increment(1)
        });
      users.map(u => {
        if (u.username === original.username) return original;
        else return u;
      });
      classes.map(c => {
        if (c.course === classroom.course && c.name === classroom.name)
          return classroom;
        else return c;
      });
      idb.users.update("users", { users: users });
      idb.classes.update("classes", { classes: classes });
      let uV = await idb.versions.get("users").then(u => u);
      if (uV !== undefined) {
        idb.versions.update("users", { version: uV.version + 1 });
      }
      let cV = await idb.versions.get("courses").then(u => u);
      if (cV !== undefined) {
        idb.versions.update("courses", { version: cV.version + 1 });
      }
      return { c: classes, u: users };
    } else {
      if (versionState.u === "load")
        idb.users.update("users", { users: users });
      if (versionState.co === "load")
        idb.classes.update("classes", { classes: classes });
      return {
        c: classes,
        u: users,
        error:
          "Error: The student you are trying to remove or the classroom you are adding to no longer exists."
      };
    }
  }
};

export { classroom };
