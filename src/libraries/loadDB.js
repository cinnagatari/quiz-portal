import { db, firebase } from "../utils/firebase";

const version = {
  check: async function versionCheck() {
    let versionState = { q: "local", c: "local", s: "local" };
    let vSS = await db
      .collection("version")
      .doc("versionCheck")
      .get();
    if (
      vSS.data().questions !==
      parseInt(localStorage.getItem("question-version"), 10)
    ) {
      localStorage.setItem(
        "question-version",
        JSON.stringify(vSS.data().questions)
      );
      versionState.q = "load";
    }
    if (
      vSS.data().categories !==
      parseInt(localStorage.getItem("category-version"), 10)
    ) {
      localStorage.setItem(
        "category-version",
        JSON.stringify(vSS.data().categories)
      );
      versionState.c = "load";
    }
    if (vSS.data().sets !== parseInt(localStorage.getItem("set-version"), 10)) {
      localStorage.setItem("set-version", JSON.stringify(vSS.data().sets));
      versionState.s = "load";
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
        placeholder: q.data().placeholder
      });
    });
    localStorage.setItem("questions", JSON.stringify(questions));
    return questions;
  },

  categories: async function loadCategories() {
    let cSS = await db
      .collection("fields")
      .doc("category")
      .get();
    localStorage.setItem(
      "categories",
      JSON.stringify(cSS.data().categories.sort())
    );
    return cSS.data().categories.sort();
  },

  sets: async function loadSets() {
    let sets = [];
    let questions = [];
    if (localStorage.getItem("questions") !== null) {
      questions = JSON.parse(localStorage.getItem("questions"));
    } else {
      await loadDB.questions().then(newQuestions => (questions = newQuestions));
    }
    let names = questions.map(q => q.name);
    let sSS = await db.collection("sets").get();
    sSS.forEach(s => {
      let filter = [];
      let languages = [];
      let difficulty = 0;
      s.data().questions.forEach(q => {
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
        questions: s.data().questions,
        filter: filter,
        languages: languages,
        difficulty: difficulty
      });
    });

    localStorage.setItem("sets", JSON.stringify(sets));
    return sets;
  }
};

const category = {
  add: async function addC(category) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    if (!categories.includes(category)) {
      await db
        .collection("fields")
        .doc("category")
        .update({
          categories: firebase.firestore.FieldValue.arrayUnion(category)
        });
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          categories: firebase.firestore.FieldValue.increment(1)
        });
      localStorage.setItem(
        "category-version",
        parseInt(localStorage.getItem("category-version"), 10) + 1
      );
      localStorage.setItem(
        "categories",
        JSON.stringify([...categories, category].sort())
      );
      return { c: [...categories, category].sort() };
    } else {
      return {
        c: categories,
        error:
          "Error: The category you are trying to add has already been added."
      };
    }
  },

  edit: async function editC(newCategory, original) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    let questions = [];
    if (
      versionState.q === "load" ||
      JSON.parse(localStorage.getItem("questions")) === null
    ) {
      await loadDB.questions().then(v => (questions = v));
    } else {
      questions = JSON.parse(localStorage.getItem("questions"));
    }
    if (!categories.includes(newCategory)) {
      let updatedQuestions = [];
      questions = questions.map(q => {
        if (q.category === original) {
          updatedQuestions.push({ ...q, category: newCategory });
          return { ...q, category: newCategory };
        } else {
          return { ...q };
        }
      });
      let batch = db.batch();
      updatedQuestions.forEach(q => {
        batch.update(db.collection("questions").doc(q.name), q);
      });
      batch.commit();
      categories = categories.map(c => {
        if (c === original) return newCategory;
        else return c;
      });
      await db
        .collection("fields")
        .doc("category")
        .set({ categories: categories });
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          questions: firebase.firestore.FieldValue.increment(1),
          categories: firebase.firestore.FieldValue.increment(1)
        });
      localStorage.setItem("all-questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem(
        "category-version",
        parseInt(localStorage.getItem("category-version"), 10) + 1
      );
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      return { q: questions, c: categories };
    } else {
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("questions", JSON.stringify(questions));
      return {
        q: questions,
        c: categories,
        error:
          "Error: The category you are trying to edit no longer exists or was changed to something else."
      };
    }
  },

  delete: async function deleteC(original, newCategory) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    let questions = [];
    if (
      versionState.q === "load" ||
      JSON.parse(localStorage.getItem("questions")) === null
    ) {
      await loadDB.questions().then(v => (questions = v));
    } else {
      questions = JSON.parse(localStorage.getItem("questions"));
    }
    if (categories.includes(original)) {
      await db
        .collection("fields")
        .doc("category")
        .update({
          categories: firebase.firestore.FieldValue.arrayRemove(original)
        });
      categories = categories.filter(c => c !== original);
      if (!categories.includes(newCategory)) {
        await db
          .collection("fields")
          .doc("category")
          .update({
            categories: firebase.firestore.FieldValue.arrayUnion(newCategory)
          });
        categories = [...categories, newCategory];
      }
      let updatedQuestions = [];
      questions = questions.map(q => {
        if (q.category === category) {
          updatedQuestions.push({ ...q, category: newCategory });
          return { ...q, category: newCategory };
        } else {
          return { ...q };
        }
      });
      let batch = db.batch();
      updatedQuestions.forEach(q => {
        batch.update(db.collection("questions").doc(q.name), q);
      });
      batch.commit();
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          questions: firebase.firestore.FieldValue.increment(1),
          categories: firebase.firestore.FieldValue.increment(1)
        });
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem(
        "category-version",
        parseInt(localStorage.getItem("category-version"), 10) + 1
      );
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      return { q: questions, c: categories };
    } else {
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("questions", JSON.stringify(questions));
      return {
        q: questions,
        c: categories,
        error:
          "Error: The category you are trying to delete no longer exists or was changed to something else."
      };
    }
  }
};

const question = {
  add: async function add(newQuestion) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    let questions = [];
    if (
      versionState.q === "load" ||
      JSON.parse(localStorage.getItem("questions")) === null
    ) {
      await loadDB.questions().then(v => (questions = v));
    } else {
      questions = JSON.parse(localStorage.getItem("questions"));
    }
    let names = questions.map(q => q.name);
    if (
      !names.includes(newQuestion.name) &&
      categories.includes(newQuestion.category)
    ) {
      db.collection("questions")
        .doc(newQuestion.name)
        .set(newQuestion);
      await db
        .collection("version")
        .doc("versionCheck")
        .update({ questions: firebase.firestore.FieldValue.increment(1) });
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      localStorage.setItem(
        "questions",
        JSON.stringify([...questions, newQuestion])
      );
      localStorage.setItem("categories", JSON.stringify(categories));
      return {
        q: [...questions, newQuestion],
        n: [...names, newQuestion.name],
        c: categories
      };
    } else {
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      return {
        q: questions,
        n: [...names, newQuestion.name],
        c: categories,
        error:
          "Error: The question name is already being used or the category no longer exists."
      };
    }
  },

  edit: async function editQ(newQuestion, original) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    let questions = [];
    if (
      versionState.q === "load" ||
      JSON.parse(localStorage.getItem("questions")) === null
    ) {
      await loadDB.questions().then(v => (questions = v));
    } else {
      questions = JSON.parse(localStorage.getItem("questions"));
    }
    let names = questions.map(q => q.name);
    if (
      names.includes(original.name) &&
      categories.includes(newQuestion.category)
    ) {
      questions = questions.map(q => {
        if (q.name === original.name) return newQuestion;
        else return q;
      });
      await db
        .collection("version")
        .doc("versionCheck")
        .update({ questions: firebase.firestore.FieldValue.increment(1) });
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      if (newQuestion.name !== original.name)
        db.collection("questions")
          .doc(original.name)
          .delete();
      db.collection("questions")
        .doc(newQuestion.name)
        .set(newQuestion);
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      return { q: questions, n: questions.map(q => q.name), c: categories };
    } else {
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      return {
        q: questions,
        n: questions.map(q => q.name),
        c: categories,
        error:
          "Error: The new question name already exists or the new category no longer exists."
      };
    }
  },

  delete: async function deleteQ(original) {
    let versionState = {};
    await version.check().then(v => (versionState = v));
    let categories = [];
    if (
      versionState.c === "load" ||
      JSON.parse(localStorage.getItem("categories")) === null
    ) {
      await loadDB.categories().then(v => (categories = v));
    } else {
      categories = JSON.parse(localStorage.getItem("categories"));
    }
    let questions = [];
    if (
      versionState.q === "load" ||
      JSON.parse(localStorage.getItem("questions")) === null
    ) {
      await loadDB.questions().then(v => (questions = v));
    } else {
      questions = JSON.parse(localStorage.getItem("questions"));
    }
    let names = questions.map(q => q.name);
    if (names.includes(original.name)) {
      questions = questions.filter(q => original.name !== q.name);
      await db
        .collection("version")
        .doc("versionCheck")
        .update({ questions: firebase.firestore.FieldValue.increment(1) });
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      db.collection("questions")
        .doc(original.name)
        .delete();
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      return { q: questions, n: names, c: categories };
    } else {
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("categories", JSON.stringify(categories));
      return {
        q: questions,
        n: names,
        c: categories,
        error: "Error: The question you are trying to delete no longer exists."
      };
    }
  }
};

const sets = {
  filter: function filterQ() {
    let filtered = [];

    return [];
  }
};

export { loadDB, version, category, question, sets };
