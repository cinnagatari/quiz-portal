import { db } from "../utils/firebase";
import idb from "../utils/indexedDB";

const version = {
  check: async function versionCheck(versions) {
    let versionState = {
      q: "local",
      c: "local",
      s: "local",
      co: "local",
      u: "local"
    };

    let vSS = await db
      .collection("version")
      .doc("versionCheck")
      .get();
    if (versions.includes("q")) {
      let qV = await idb.versions.get("questions").then(q => q);
      if (qV === undefined || vSS.data().questions !== qV.version) {
        idb.versions.put({
          type: "questions",
          version: vSS.data().questions
        });
        versionState.q = "load";
      }
    }
    if (versions.includes("c")) {
      let cV = await idb.versions.get("categories").then(c => c);
      if (cV === undefined || vSS.data().categories !== cV.version) {
        idb.versions.put({
          type: "categories",
          version: vSS.data().categories
        });
        versionState.c = "load";
      }
    }
    if (versions.includes("s")) {
      let sV = await idb.versions.get("sets").then(s => s);
      if (sV === undefined || vSS.data().sets !== sV.version) {
        console.log(1);
        idb.versions.put({ type: "sets", version: vSS.data().sets });
        versionState.s = "load";
      }
    }
    if (versions.includes("co")) {
      let cV = await idb.versions.get("courses").then(c => c);
      if (cV === undefined || vSS.data().courses !== cV.version) {
        idb.versions.put({
          type: "courses",
          version: vSS.data().courses
        });
        versionState.co = "load";
      }
    }
    if (versions.includes("u")) {
      let uV = await idb.versions.get("users").then(u => u);

      if (uV === undefined || vSS.data().users !== uV.version) {
        idb.versions.put({ type: "users", version: vSS.data().users });
        versionState.co = "load";
      }
    }
    return versionState;
  }
};

const loadDB = {
  questions: async function loadQuestions() {
    let questions = [];
    let qSS = await db.collection("questions").get();
    qSS.docs.forEach(q => {
      questions.push({
        question: q.data().question,
        answers: q.data().answers,
        category: q.data().category,
        difficulty: q.data().difficulty,
        name: q.data().name,
        languages: q.data().languages,
        type: q.data().type,
        solution: q.data().solution,
        placeholder: q.data().placeholder,
        tests: q.data().tests,
        hiddenTests: q.data().hiddenTests,
        testAnswers: q.data().testAnswers,
        hiddenTestAnswers: q.data().hiddenTestAnswers
      });
    });
    idb.questions.put({ all: "questions", questions: questions });
    return questions;
  },

  categories: async function loadCategories() {
    let cSS = await db
      .collection("fields")
      .doc("category")
      .get();
    idb.categories.put({
      all: "categories",
      categories: cSS.data().categories.sort()
    });
    return cSS.data().categories.sort();
  },

  sets: async function loadSets() {
    let sets = [];
    let questions = [];
    let qs = await idb.questions.get("questions").then(q => q);
    if (qs !== undefined) {
      questions = qs.questions;
    } else {
      await loadDB.questions().then(newQuestions => (questions = newQuestions));
    }
    let names = questions.map(q => q.name);
    let sSS = await db.collection("sets").get();
    sSS.forEach(s => {
      let filter = [];
      let setQuestions = s.data().questions.filter(q => names.includes(q));
      let languages = [];
      let difficulty = 0;
      setQuestions.forEach(q => {
        if (!filter.includes(questions[names.indexOf(q)].category))
          filter.push(questions[names.indexOf(q)].category);
        if (!filter.includes(questions[names.indexOf(q)].type))
          filter.push(questions[names.indexOf(q)].type);
        questions[names.indexOf(q)].languages.forEach(l => {
          if (!languages.includes(l)) languages.push(l);
        });
        difficulty += questions[names.indexOf(q)].difficulty;
      });
      sets.push({
        name: s.data().name,
        questions: setQuestions,
        filter: filter,
        languages: languages,
        difficulty: Math.floor(difficulty / setQuestions.length)
      });
      if (s.data().questions.length > setQuestions.length)
        db.collection("sets")
          .doc(s.data().name)
          .set({
            name: s.data().name,
            questions: setQuestions
          });
    });
    idb.sets.put({ all: "sets", sets });
    return sets;
  },

  courses: async function loadCourses() {
    let courses = [];
    let cSS = await db.collection("courses").get();
    cSS.forEach(c => {
      courses.push({
        name: c.data().name,
        classes: c.data().classes
      });
    });
    courses = courses.sort((a, b) => a.data().name < b.data().name);
    idb.courses.put({ all: "courses", courses });
    return courses;
  },

  classes: async function loadClasses() {
    let classes = [];
    let cSS = await db.collection("classes").get();
    cSS.forEach(c => {
      classes.push({
        course: c.data().course,
        students: c.data().students,
        name: c.data().name,
        assignments: c.data().assignments
      });
    });
    idb.classes.put({ all: "classes", classes });
    return classes;
  },

  users: async function loadUsers() {
    let users = [];
    let uSS = await db.collection("users").get();
    uSS.forEach(u => {
      console.log(u);
      users.push({
        admin: u.data().admin,
        name: u.data().name,
        username: u.data().username,
        courses: u.data().courses,
        grade: u.data().grade
      });
    });

    idb.users.put({ all: "users", users });
    return users;
  }
};

export { loadDB, version };
