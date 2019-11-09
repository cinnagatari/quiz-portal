import React, { useEffect, useState, useContext } from "react";
import QuestionEditor from "./questionEditor";
import Popup from "../../../main/components/popup";
import UserContext from "../../../utils/userContext";
import { loadDB, version } from "../../../libraries/loadDB";
import { question } from "../../../libraries/question";
import idb from "../../../utils/indexedDB";
import { CategoryEditor } from "./categoryEditor";

const DEFAULT = [
    {
        question: { java: "a", python: "b", javascript: "c" },
        solution: { java: "a", python: "a", javascript: "a" },
        placeholder: { java: "a", python: "a", javascript: "a" },
        answers: {
            java: ["a", "a", "a", "a"],
            "java-length": 4,
            python: ["", "", ""],
            "python-length": 3,
            javascript: ["", ""],
            "javascript-length": 2
        },
        category: "array-1",
        difficulty: 1,
        id: 999,
        name: "testQuestion1",
        languages: ["java", "python", "javascript"],
        type: "sa"
    }
];

export default function Questions() {
    let user = useContext(UserContext);
    let [sections, setSections] = useState([]);
    let [currentS, setCurrentS] = useState(-1);
    let [categories, setCategories] = useState([]);
    let [currentC, setCurrentC] = useState(-1);
    let [questions, setQuestions] = useState(DEFAULT);
    let [currentQ, setCurrentQ] = useState(-1);
    let [names, setNames] = useState([]);
    let [adding, setAdding] = useState(false);
    let [addID, setAddID] = useState(0);
    let [reloadQ, setReloadQ] = useState(undefined);
    let [editCat, setEditCat] = useState(false);
    let [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        versionCheck();
    }, []);

    useEffect(() => {
        let section = [];
        categories.forEach(c => {
            if (
                !section.includes(c.substring(0, c.indexOf(" - "))) &&
                c !== "no category"
            )
                section.push(c.substring(0, c.indexOf(" - ")));
        });
        setSections(section);
    }, [categories]);

    async function addQ(newQuestion) {
        await question.add(newQuestion).then(newQuestions => {
            if (newQuestions.error !== undefined) {
                setErrorMessage(newQuestions.error);
                setReloadQ(newQuestion);
            } else {
                setAdding(false);
                setAddID(addID + 1);
            }
            setQuestions(newQuestions.q);
            setCategories(newQuestions.c);
        });
    }

    async function editQ(newQuestion, original) {
        await question.edit(newQuestion, original).then(newQuestions => {
            console.log(newQuestions);
            if (newQuestions.error !== undefined)
                setErrorMessage(newQuestions.error);
            setQuestions(newQuestions.q);
            setCategories(newQuestions.c);
        });
    }

    async function deleteQ(original) {
        await question.delete(original).then(newQuestions => {
            if (newQuestions.error !== undefined)
                setErrorMessage(newQuestions.error);
            setCurrentQ(-1);
            setQuestions(newQuestions.q);
        });
    }

    async function versionCheck() {
        let versionState = "";
        await version.check(["q", "c"]).then(v => (versionState = v));
        if (versionState.q === "load") loadQuestions();
        else localQuestions();
        if (versionState.c === "load") loadCategories();
        else localCategories();
    }

    async function loadQuestions() {
        await loadDB.questions().then(questions => {
            setQuestions(questions);
            setNames(questions.map(q => q.name));
        });
    }

    async function loadCategories() {
        await loadDB.categories().then(categories => setCategories(categories));
    }

    async function localCategories() {
        let categories = await idb.categories.get("categories").then(c => c);
        if (categories === undefined) {
            loadCategories();
        } else {
            setCategories(categories.categories);
        }
    }

    async function localQuestions() {
        let questions = await idb.questions.get("questions").then(q => q);
        if (questions === undefined) {
            loadQuestions();
            loadCategories();
        } else {
            setNames(questions.questions.filter(q => q.name));
            setQuestions(questions.questions);
        }
    }

    return (
        <div className="questions">
            <div className={"q-sections bg-2-" + user.theme}>
                <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                >
                    <p className={"center q-section-title bg-1-" + user.theme}>
                        Sections
                    </p>
                </div>
                <div className="section-btns">
                    {sections.map((s, i) => (
                        <button
                            className={
                                "btn-medium btn-" +
                                user.theme +
                                (i === currentS
                                    ? " btn-selected-" + user.theme
                                    : "")
                            }
                            key={s + i}
                            onClick={() => {
                                setCurrentS(currentS !== i ? i : -1);
                                setCurrentC(-1);
                                setCurrentQ(-1);
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            <div className={"q-categories bg-2-" + user.theme}>
                <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                >
                    <p className={"center q-category-title bg-1-" + user.theme}>
                        Categories
                    </p>
                    <button
                        className={"edit-category btn-" + user.theme}
                        onClick={() => setEditCat(true)}
                    >
                        Edit Categories
                    </button>
                </div>
                <div className={"category-btns"}>
                    {categories.map(
                        (c, i) =>
                            c.substring(0, c.indexOf(" - ")) ===
                                sections[currentS] && (
                                <button
                                    className={
                                        "btn-small btn-" +
                                        user.theme +
                                        (i === currentC
                                            ? " btn-selected-" + user.theme
                                            : "")
                                    }
                                    onClick={() => {
                                        setCurrentC(currentC === i ? -1 : i);
                                        setCurrentQ(-1);
                                    }}
                                    key={c + i}
                                >
                                    {c}
                                </button>
                            )
                    )}
                </div>
            </div>
            <div className={"q-questions bg-2-" + user.theme}>
                <div
                    className="center"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <p className={"center q-question-title bg-1-" + user.theme}>
                        Questions
                    </p>
                    <button
                        className={"center add-question btn-" + user.theme}
                        onClick={() => {
                            setAdding(true);
                            setCurrentQ(-1);
                        }}
                    >
                        Add Question
                    </button>
                    {currentQ !== -1 && (
                        <button
                            className={
                                "center delete-question btn-" + user.theme
                            }
                            onClick={() => deleteQ(questions[currentQ])}
                        >
                            Delete Question
                        </button>
                    )}
                </div>
                <div>
                    {questions.map((q, i) => {
                        return q.category === categories[currentC] ? (
                            <button
                                className={
                                    "btn-small btn-" +
                                    user.theme +
                                    (i === currentQ
                                        ? " btn-selected-" + user.theme
                                        : "")
                                }
                                key={q.name + i}
                                onClick={() => {
                                    setCurrentQ(currentQ !== i ? i : -1);
                                    setAdding(false);
                                }}
                            >
                                {q.name}
                            </button>
                        ) : (
                            undefined
                        );
                    })}
                </div>
            </div>
            {currentQ !== -1 && (
                <QuestionEditor
                    key={questions[currentQ].name + "edit"}
                    update={editQ}
                    mode={"update"}
                    names={names}
                    categories={categories}
                    editQuestion={questions[currentQ]}
                />
            )}
            {adding && (
                <QuestionEditor
                    key={addID}
                    update={addQ}
                    names={names}
                    mode={"add"}
                    categories={categories}
                    editQuestion={reloadQ}
                />
            )}
            {editCat && (
                <Popup
                    close={() => setEditCat(false)}
                    contents={
                        <CategoryEditor
                            sections={sections}
                            categories={categories}
                            setCategories={setCategories}
                            setQuestions={setQuestions}
                        />
                    }
                />
            )}
        </div>
    );
}
