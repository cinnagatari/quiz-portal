import React, { useState, useEffect, useContext } from "react";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/github";
import "brace/theme/tomorrow_night_eighties";
import UserContext from "../../../../utils/userContext";
import Fields from "./components/fields";
import EditQuestion from "./components/editQuestion";
import EditShortAnswer from "./components/editShortAnswer";
import EditMC from "./components/editMC";

import { LANGUAGES } from "../../../../utils/config";

export default function QuestionEditor({
    update,
    mode,
    names,
    categories,
    editQuestion
}) {
    let user = useContext(UserContext);
    let [question, setQuestion] = useState({});
    let [name, setName] = useState("");
    let [oName, setOName] = useState("");
    let [type, setType] = useState("");
    let [category, setCategory] = useState(-1);
    let [languages, setLanguages] = useState(
        new Array(LANGUAGES.length).fill(false)
    );
    let [lang, setLang] = useState(-1);
    let [solution, setSolution] = useState({});
    let [tests, setTests] = useState({});
    let [testAnswers, setTestAnswers] = useState({});
    let [hiddenTests, setHiddenTests] = useState({});
    let [hiddenTestAnswers, setHiddenTestAnswers] = useState({});
    let [placeholder, setPlaceholder] = useState({});
    let [answers, setAnswers] = useState({});
    let [difficulty, setDifficulty] = useState(-1);
    let [submitFailed, setSubmitFailed] = useState(false);
    let [processing, setProcessing] = useState(false);
    let [reload, setReload] = useState(false);

    useEffect(() => {
        if (editQuestion !== undefined) {
            setQuestion({ ...editQuestion.question });
            setName(editQuestion.name);
            setOName(editQuestion.name);
            setType(editQuestion.type);
            setCategory(editQuestion.category);
            let temp = [...languages];
            editQuestion.languages.forEach(l => {
                temp[LANGUAGES.indexOf(l)] = true;
            });
            setLanguages(temp);
            setLang(LANGUAGES.indexOf(editQuestion.languages[0]));
            setSolution({ ...editQuestion.solution });
            setTests({ ...editQuestion.tests });
            setTestAnswers({ ...editQuestion.testAnswers });
            setHiddenTests({ ...editQuestion.hiddenTests });
            setHiddenTestAnswers({ ...editQuestion.hiddenTestAnswers });
            setPlaceholder({ ...editQuestion.placeholder });
            setAnswers({ ...editQuestion.answers });
            setDifficulty(editQuestion.difficulty);
        }
    }, []);


    function checkQuestion() {
        let flag = false;
        Object.keys(question).forEach(q => {
            if (question[q].length === 0) flag = true;
        });
        return flag;
    }
 
    function checkSolution() {
        let flag = false;
        Object.keys(solution).forEach(s => {
            if (solution[s].length === 0) flag = true;
        });
        Object.keys(testAnswers).forEach(lang => {
            testAnswers[lang].forEach(ans => {
                if (ans === "") flag = true;
            });
        });
        Object.keys(hiddenTestAnswers).forEach(lang => {
            hiddenTestAnswers[lang].forEach(ans => {
                if (ans === "") flag = true;
            });
        });
        return flag;
    }

    function checkAnswers() {
        let flag = false;
        Object.keys(answers).forEach(ans => {
            if (ans.indexOf("-length") === -1) {
                answers[ans].forEach(a => {
                    if (a.length === 0) flag = true;
                });
            }
        });
        return flag;
    }

    function setAllAnswers() {
        if (type === "mc") {
            let temp = { ...answers };
            Object.keys(temp).forEach(key => {
                if (key.indexOf("-length") !== -1) {
                    temp[key] = answers[LANGUAGES[lang] + "-length"];
                } else {
                    temp[key] = answers[LANGUAGES[lang]];
                }
            });
            setAnswers(temp);
        }
        if (type === "sa") {
            let temp = { ...solution };
            Object.keys(temp).forEach(key => {
                temp[key] = solution[LANGUAGES[lang]];
            });
            setSolution(temp);
        }
    }

    function toggleLanguage(index) {
        let temp = [...languages];
        let tempQ = { ...question };
        let tempS = { ...solution };
        let tempT = { ...tests };
        let tempTA = { ...testAnswers };
        let tempHT = { ...hiddenTests };
        let tempHTA = { ...hiddenTestAnswers };
        let tempP = { ...placeholder };
        let tempA = { ...answers };
        if (temp[index] && lang === index) {
            for (let i = 0; i < temp.length; i++) {
                if (i !== index && temp[i]) {
                    setLang(i);
                    break;
                }
                if (i === temp.length - 1) setLang(-1);
            }
        } else if (lang === -1) {
            setLang(index);
        }

        if (!temp[index]) {
            tempQ[LANGUAGES[index]] = "";
            tempS[LANGUAGES[index]] = "";
            tempT[LANGUAGES[index]] = [""];
            tempTA[LANGUAGES[index]] = [""];
            tempHT[LANGUAGES[index]] = [""];
            tempHTA[LANGUAGES[index]] = [""];
            tempP[LANGUAGES[index]] = "";
            tempA[LANGUAGES[index]] = ["", "", "", ""];
            tempA[LANGUAGES[index] + "-length"] = 4;
        } else {
            delete tempQ[LANGUAGES[index]];
            delete tempS[LANGUAGES[index]];
            delete tempT[LANGUAGES[index]];
            delete tempTA[LANGUAGES[index]];
            delete tempHT[LANGUAGES[index]];
            delete tempHTA[LANGUAGES[index]];
            delete tempP[LANGUAGES[index]];
            delete tempA[LANGUAGES[index]];
            delete tempA[LANGUAGES[index] + "-length"];
        }
        temp[index] = !temp[index];
        setLanguages(temp);
        setQuestion(tempQ);
        setSolution(tempS);
        setTests(tempT);
        setTestAnswers(tempTA);
        setHiddenTests(tempHT);
        setHiddenTestAnswers(tempHTA);
        setPlaceholder(tempP);
        setAnswers(tempA);
    }

    function submit() {
        if (
            name.length === 0 ||
            (!oName === name && !names.includes(name)) ||
            category === -1 ||
            difficulty === -1 ||
            lang === -1 ||
            checkQuestion() ||
            (checkAnswers() && checkSolution())
        )
            setSubmitFailed(true);
        else if (
            name.length > 0 &&
            category !== -1 &&
            difficulty !== -1 &&
            lang !== -1 &&
            !checkQuestion() &&
            (!checkAnswers() || !checkSolution())
        ) {
            let temp = [];
            languages.forEach((l, i) => {
                if (l) temp.push(LANGUAGES[i]);
            });

            let newQuestion = {
                name,
                category,
                difficulty,
                type,
                question,
                languages: temp,
                solution,
                placeholder,
                tests,
                testAnswers,
                hiddenTests,
                hiddenTestAnswers,
                answers
            };
            update(newQuestion, oName);
        }
    }

    return (
        <div className="q-editor">
            <Fields
                submitFailed={submitFailed}
                names={names}
                name={name}
                setName={setName}
                category={category}
                categories={categories}
                setCategory={setCategory}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                lang={lang}
                languages={languages}
                toggleLanguage={toggleLanguage}
                user={user}
            />
            <div className="e-container">
                {lang !== -1 && (
                    <EditQuestion
                        question={question}
                        setQuestion={setQuestion}
                        name={name}
                        submitFailed={submitFailed}
                        checkQuestion={checkQuestion}
                        languages={languages}
                        lang={lang}
                        setLang={setLang}
                        tests={tests}
                        setTests={setTests}
                        testAnswers={testAnswers}
                        setTestAnswers={setTestAnswers}
                        hiddenTests={hiddenTests}
                        setHiddenTests={setHiddenTests}
                        hiddenTestAnswers={hiddenTestAnswers}
                        setHiddenTestAnswers={setHiddenTestAnswers}
                        mode={mode}
                        submit={() => submit()}
                        type={type}
                        reload={reload}
                        setReload={setReload}
                        user={user}
                    />
                )}
                {lang !== -1 && (
                    <div
                        className={"center right-container bg-2-" + user.theme}
                    >
                        {submitFailed && checkSolution() && checkAnswers() ? (
                            <p>please check answers</p>
                        ) : (
                            undefined
                        )}
                        {Object.keys(solution).length !== 0 && lang !== -1 && (
                            <div className="center answer">
                                <div className="type">
                                    <div>
                                        <button
                                            className={
                                                "btn-small bg-3-" +
                                                user.theme +
                                                (type === "mc"
                                                    ? " btn-selected-" +
                                                      user.theme
                                                    : "")
                                            }
                                            onClick={() => setType("mc")}
                                        >
                                            Multiple Choice
                                        </button>
                                        <button
                                            className={
                                                "btn-small bg-3-" +
                                                user.theme +
                                                (type === "sa"
                                                    ? " btn-selected-" +
                                                      user.theme
                                                    : "")
                                            }
                                            onClick={() => setType("sa")}
                                        >
                                            Free Reponse
                                        </button>
                                    </div>
                                    <button
                                        className={
                                            "btn-small bg-3-" + user.theme
                                        }
                                        onClick={() => setAllAnswers()}
                                    >
                                        apply answer to all languages
                                    </button>
                                </div>
                                {type === "sa" && (
                                    <EditShortAnswer
                                        lang={lang}
                                        name={name}
                                        solution={solution}
                                        setSolution={setSolution}
                                        placeholder={placeholder}
                                        setPlaceholder={setPlaceholder}
                                        tests={tests}
                                        testAnswers={testAnswers}
                                        setTestAnswers={setTestAnswers}
                                        hiddenTests={hiddenTests}
                                        hiddenTestAnswers={hiddenTestAnswers}
                                        setHiddenTestAnswers={setHiddenTestAnswers}
                                        processing={processing}
                                        setProcessing={setProcessing}
                                        reload={reload}
                                        setReload={setReload}
                                        user={user}
                                    />
                                )}
                                {type === "mc" && (
                                    <EditMC
                                        name={name}
                                        answers={answers}
                                        setAnswers={setAnswers}
                                        lang={lang}
                                        reload={reload}
                                        setReload={setReload}
                                        type={type}
                                        user={user}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
