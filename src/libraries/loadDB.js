import { db } from "../utils/firebase";

const version = {

    check: async function versionCheck() {
        let versionState = {q: "local", c: "local"}
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
        return versionState;
    }

}


const loadDB = {
    questions: async function loadQuestions() {
        let questions = [];
        let names = [];
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
            names.push(q.data().name);
        });
        localStorage.setItem("all-questions", JSON.stringify(questions));
        localStorage.setItem("all-names", JSON.stringify(names));
        return { q: questions, n: names };
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
        let newData = [];
        let sSS = await db.collection("questionSets").get();
        sSS.forEach(s => {
            newData.push(s.data().set);
        })
        return newData;
    }
}


export { loadDB, version }