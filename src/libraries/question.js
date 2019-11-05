import { loadDB, version } from "./loadDB";
import { db, firebase } from "../utils/firebase";
import idb from "../utils/indexedDB";

const question = {
    add: async function add(newQuestion) {
        let versionState = {};
        await version.check(["q", "c"]).then(v => (versionState = v));
        let categories = [];
        let idbCategories = await idb.categories.get("categories").then(c => c);
        if (versionState.c === "load" || idbCategories === undefined) {
            await loadDB.categories().then(v => (categories = v));
        } else {
            categories = idbCategories.categories;
        }
        let questions = [];
        let idbQuestions = await idb.questions.get("questions").then(q => q);
        if (versionState.q === "load" || idbQuestions === undefined) {
            await loadDB.questions().then(v => (questions = v));
        } else {
            questions = idbQuestions.questions;
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
                .update({
                    questions: firebase.firestore.FieldValue.increment(1)
                });
            let qV = await idb.versions.get("questions").then(q => q);
            if (qV !== undefined) {
                idb.versions.update("questions", {
                    version: qV.version + 1
                });
            }
            questions = [...questions, newQuestion];
            idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            return {
                q: questions,
                n: [...names, newQuestion.name],
                c: categories
            };
        } else {
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
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
        await version.check(["q", "c"]).then(v => (versionState = v));
        let categories = [];
        let idbCategories = await idb.categories.get("categories").then(c => c);
        if (versionState.c === "load" || idbCategories === undefined) {
            await loadDB.categories().then(v => (categories = v));
        } else {
            categories = idbCategories.categories;
        }
        let questions = [];
        let idbQuestions = await idb.questions.get("questions").then(q => q);
        if (versionState.q === "load" || idbQuestions === undefined) {
            await loadDB.questions().then(v => (questions = v));
        } else {
            questions = idbQuestions.questions;
        }
        let names = questions.map(q => q.name);
        if (
            names.includes(original) &&
            categories.includes(newQuestion.category)
        ) {
            questions = questions.map(q => {
                if (q.name === original) return newQuestion;
                else return q;
            });
            await db
                .collection("version")
                .doc("versionCheck")
                .update({
                    questions: firebase.firestore.FieldValue.increment(1)
                });
            let qV = await idb.versions.get("questions").then(q => q);
            if (qV !== undefined) {
                idb.versions.update("questions", {
                    version: qV.version + 1
                });
            }
            if (newQuestion.name !== original)
                db.collection("questions")
                    .doc(original)
                    .delete();
            db.collection("questions")
                .doc(newQuestion.name)
                .set(newQuestion);
            idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            return {
                q: questions,
                n: questions.map(q => q.name),
                c: categories
            };
        } else {
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
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
        await version.check(["q"]).then(v => (versionState = v));
        let questions = [];
        let idbQuestions = await idb.questions.get("questions").then(q => q);
        if (versionState.q === "load" || idbQuestions === undefined) {
            await loadDB.questions().then(v => (questions = v));
        } else {
            questions = idbQuestions.questions;
        }
        let names = questions.map(q => q.name);
        if (names.includes(original.name)) {
            questions = questions.filter(q => original.name !== q.name);
            await db
                .collection("version")
                .doc("versionCheck")
                .update({
                    questions: firebase.firestore.FieldValue.increment(1),
                    sets: firebase.firestore.FieldValue.increment(1)
                });
            let qV = await idb.versions.get("questions").then(q => q);
            if (qV !== undefined) {
                idb.versions.update("questions", {
                    version: qV.version + 1
                });
            }
            db.collection("questions")
                .doc(original.name)
                .delete();

            idb.questions.update("questions", { questions: questions });
            return { q: questions, n: names };
        } else {
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            return {
                q: questions,
                n: names,
                error:
                    "Error: The question you are trying to delete no longer exists."
            };
        }
    }
};

export { question };
