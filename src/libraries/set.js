import { loadDB, version } from "./loadDB";
import { db, firebase } from "../utils/firebase";
import idb from "../utils/indexedDB";

const set = {
    add: async function addSet(newSet) {
        let versionState = {};
        await version.check(["q", "c", "s"]).then(v => (versionState = v));
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
        let sets = [];
        let idbSets = await idb.sets.get("sets").then(s => s);
        if (versionState.s === "load" || idbSets === undefined) {
            await loadDB.sets().then(v => (sets = v));
        } else {
            sets = idbSets.sets;
        }
        let flag = false;
        let names = questions.map(q => q.name);
        newSet.questions.forEach(q => {
            if (names.includes(q)) flag = true;
        });
        if (!sets.map(s => s.name).includes(newSet.name) || !flag) {
            let filter = [];
            let languages = [];
            let difficulty = 0;
            newSet.questions.forEach(q => {
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
                name: newSet.name,
                questions: newSet.questions,
                filter: filter,
                languages: languages,
                difficulty: Math.floor(difficulty / newSet.questions.length)
            });
            await db
                .collection("sets")
                .doc(newSet.name)
                .set(newSet);
            await db
                .collection("version")
                .doc("versionCheck")
                .update({ sets: firebase.firestore.FieldValue.increment(1) });
            let sV = await idb.versions.get("sets").then(s => s);
            if (sV !== undefined) {
                idb.versions.update("sets", {
                    version: sV.version + 1
                });
            }
            sets = sets.sort((a, b) =>
                a.name < b.name ? -1 : a.name > b.name ? 1 : 0
            );
            idb.sets.update("sets", { sets: sets });
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            return { q: questions, s: sets };
        } else {
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            idb.sets.update("sets", { sets: sets });
            return {
                q: questions,
                s: sets,
                error:
                    "Error: The set you are trying to add has already been added or one of the questions may no longer exist."
            };
        }
    },

    edit: async function editSet(newSet, original) {
        let versionState = {};
        await version.check(["q", "c", "s"]).then(v => (versionState = v));
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
        let sets = [];
        let idbSets = await idb.sets.get("sets").then(s => s);
        if (versionState.s === "load" || idbSets === undefined) {
            await loadDB.sets().then(v => (sets = v));
        } else {
            sets = idbSets.sets;
        }
        let flag = false;
        let names = questions.map(q => q.name);
        newSet.questions.forEach(q => {
            if (names.includes(q)) flag = true;
        });
        if (
            !sets.map(s => s.name).includes(newSet.name) ||
            newSet.name === original ||
            !flag
        ) {
            let filter = [];
            let languages = [];
            let difficulty = 0;
            newSet.questions.forEach(q => {
                if (!filter.includes(questions[names.indexOf(q)].category))
                    filter.push(questions[names.indexOf(q)].category);
                if (!filter.includes(questions[names.indexOf(q)].type))
                    filter.push(questions[names.indexOf(q)].type);
                questions[names.indexOf(q)].languages.forEach(l => {
                    if (!languages.includes(l)) languages.push(l);
                });
                difficulty += questions[names.indexOf(q)].difficulty;
            });
            sets = sets.filter(set => set.name !== original);
            sets.push({
                name: newSet.name,
                questions: newSet.questions,
                filter: filter,
                languages: languages,
                difficulty: Math.floor(difficulty / newSet.questions.length)
            });
            if (original !== newSet.name)
                await db
                    .collection("sets")
                    .doc(original)
                    .delete();
            await db
                .collection("sets")
                .doc(newSet.name)
                .set(newSet);
            await db
                .collection("version")
                .doc("versionCheck")
                .update({ sets: firebase.firestore.FieldValue.increment(1) });
            let sV = await idb.versions.get("sets").then(s => s);
            if (sV !== undefined) {
                idb.versions.update("sets", {
                    version: sV.version + 1
                });
            }
            sets = sets.sort((a, b) =>
                a.name < b.name ? -1 : a.name > b.name ? 1 : 0
            );
            idb.sets.update("sets", { sets: sets });
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            return { q: questions, s: sets };
        } else {
            idb.sets.update("sets", { sets: sets });
            if (versionState.q === "load")
                idb.questions.update("questions", { questions: questions });
            if (versionState.c === "load")
                idb.categories.update("categories", { categories: categories });
            return {
                q: questions,
                s: sets,
                error:
                    "Error: The name is already in use or a question no longer exists."
            };
        }
    },

    delete: async function deleteSet(original) {
        let versionState = {};
        await version.check(["q", "c", "s"]).then(v => (versionState = v));
        let sets = [];
        let idbSets = await idb.sets.get("sets").then(s => s);
        if (versionState.s === "load" || idbSets === undefined) {
            await loadDB.sets().then(v => (sets = v));
        } else {
            sets = idbSets.sets;
        }
        if (sets.map(s => s.name).includes(original)) {
            sets = sets.filter(set => set.name !== original);
            await db
                .collection("sets")
                .doc(original)
                .delete();
            await db
                .collection("version")
                .doc("versionCheck")
                .update({ sets: firebase.firestore.FieldValue.increment(1) });
            let sV = await idb.versions.get("sets").then(s => s);
            if (sV !== undefined) {
                idb.versions.update("sets", {
                    version: sV.version + 1
                });
            }
            sets = sets.sort((a, b) =>
                a.name < b.name ? -1 : a.name > b.name ? 1 : 0
            );
            idb.sets.update("sets", { sets: sets });
            return { s: sets };
        } else {
            idb.sets.update("sets", { sets: sets });
            return { s: sets };
        }
    }
};

export { set };
