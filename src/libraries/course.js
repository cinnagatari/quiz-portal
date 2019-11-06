import { loadDB, version } from "./loadDB";
import idb from "../utils/indexedDB";
import { db, firebase } from "../utils/firebase";

const course = {
  add: async function addCourse(newCourse) {
    let versionState = {};
    await version.check(["co"]).then(v => (versionState = v));
    let courses = [];
    let idbCourses = await idb.courses.get("courses").then(c => c);
    if (idbCourses === undefined || versionState.co === "load")
      await loadDB.courses().then(c => (courses = c));
    else courses = idbCourses.courses;
    let names = courses.map(c => c.name);
    if (!names.includes(newCourse.name)) {
      courses = [...courses, newCourse];
      await db
        .collection("courses")
        .doc(newCourse.name)
        .set({
          classes: [],
          name: newCourse.name
        });
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          courses: firebase.firestore.FieldValue.increment(1)
        });
      let cV = await idb.versions.get("courses").then(c => c);
      if (cV !== undefined)
        idb.versions.update("courses", { courses: cV.version + 1 });
      idb.courses.update("courses", { courses: courses });
      return { co: courses };
    } else {
      if (versionState.co === "load")
        idb.courses.update("courses", { courses: courses });
      return {
        co: courses,
        error: "Error: The course you are trying to add already exists."
      };
    }
  },

  edit: async function editCourse(newCourse, original) {},

  delete: async function deleteCourse(original) {}
};

export { course };
