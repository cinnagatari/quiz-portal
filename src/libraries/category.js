import { loadDB, version } from "./loadDB";
import { db, firebase } from "../utils/firebase";
import idb from "../utils/indexedDB";

const category = {
    add: async function addC(category) {
        let versionState = {};
        await version.check(["c"]).then(v => (versionState = v));
        let categories = [];
        let idbCategories = await idb.categories.get("categories").then(c => c);
        if (versionState.c === "load" || idbCategories === undefined) {
            await loadDB.categories().then(v => (categories = v));
        } else {
            categories = idbCategories.categories;
        }
        if (!categories.includes(category)) {
            await db
                .collection("fields")
                .doc("category")
                .update({
                    categories: firebase.firestore.FieldValue.arrayUnion(
                        category
                    )
                });
            await db
                .collection("version")
                .doc("versionCheck")
                .update({
                    categories: firebase.firestore.FieldValue.increment(1)
                });
            let cV = await idb.versions.get("categories").then(v => v);
            if (cV !== undefined) {
                idb.versions.update("categories", {
                    version: cV.version + 1
                });
            }
            categories = [...categories, category].sort();
            idb.categories.update("categories", {
                categories: categories
            });
            return { c: categories };
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
        await version.check(["c", "q"]).then(v => (versionState = v));
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
            idb.questions.update("questions", { questions: questions });
            idb.categories.update("categories", { categories: categories });
            let cV = await idb.versions.get("categories").then(v => v);
            if (cV !== undefined) {
                idb.versions.update("categories", {
                    version: cV.version + 1
                });
            }
            let qV = await idb.versions.get("questions").then(q => q);
            if (qV !== undefined) {
                idb.versions.update("questions", {
                    version: qV.version + 1
                });
            }
            return { q: questions, c: categories };
        } else {
            idb.questions.update("questions", { questions: questions });
            idb.categories.update("categories", { categories: categories });
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
        await version.check(["c", "q"]).then(v => (versionState = v));
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
        if (categories.includes(original)) {
            await db
                .collection("fields")
                .doc("category")
                .update({
                    categories: firebase.firestore.FieldValue.arrayRemove(
                        original
                    )
                });
            categories = categories.filter(c => c !== original);
            if (!categories.includes(newCategory)) {
                await db
                    .collection("fields")
                    .doc("category")
                    .update({
                        categories: firebase.firestore.FieldValue.arrayUnion(
                            newCategory
                        )
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
            idb.questions.update("questions", { questions: questions });
            idb.categories.update("categories", { categories: categories });
            let cV = await idb.versions.get("categories").then(v => v);
            if (cV !== undefined) {
                idb.versions.update("categories", {
                    version: cV.version + 1
                });
            }
            let qV = await idb.versions.get("questions").then(q => q);
            if (qV !== undefined) {
                idb.versions.update("questions", {
                    version: qV.version + 1
                });
            }
            return { q: questions, c: categories };
        } else {
            idb.questions.update("questions", { questions: questions });
            idb.categories.update("categories", { categories: categories });
            return {
                q: questions,
                c: categories,
                error:
                    "Error: The category you are trying to delete no longer exists or was changed to something else."
            };
        }
    }
};

export { category };
