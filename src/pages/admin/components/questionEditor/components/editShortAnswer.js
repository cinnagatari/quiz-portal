import React from "react";
import axios from "axios";

import AceEditor from "react-ace";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/github";
import "brace/theme/tomorrow_night_eighties";
import { LANGUAGES, LANGUAGES_IDS } from "../../../../../utils/config";

export default function EditShortAnswer({
    lang,
    name,
    solution,
    setSolution,
    placeholder,
    setPlaceholder,
    tests,
    testAnswers,
    setTestAnswers,
    hiddenTests,
    hiddenTestAnswers,
    setHiddenTestAnswers,
    processing,
    setProcessing,
    time,
    setTime,
    reload,
    setReload,
    user
}) {
    function onChangeSolution(newValue) {
        let temp = solution;
        temp[LANGUAGES[lang]] = newValue;
        setSolution(temp);
        setReload(!reload);
    }

    function onChangePlaceholder(newValue) {
        let temp = placeholder;
        temp[LANGUAGES[lang]] = newValue;
        setPlaceholder(temp);
        setReload(!reload);
    }

    function setAllPlaceholders() {
        let temp = { ...placeholder };
        Object.keys(temp).forEach(key => {
            temp[key] = placeholder[LANGUAGES[lang]];
        });
        setPlaceholder(temp);
    }

    function testNormal() {
        setProcessing(true);
        tests[LANGUAGES[lang]].forEach((t, i) => {
            submitCode(t, i, false);
        });
    }

    function testHidden() {
        setProcessing(true);
        hiddenTests[LANGUAGES[lang]].forEach((t, i) => {
            submitCode(t, i, true);
        });
    }

    function submissionResults(value, index, hidden) {
        let temp = hidden ? { ...hiddenTestAnswers } : { ...testAnswers };
        temp[LANGUAGES[lang]][index] = value;
        hidden ? setHiddenTestAnswers(temp) : setTestAnswers(temp);
    }

    function submitCode(test, index, hidden) {
        axios
            .post("https://api.judge0.com/submissions/", {
                source_code: solution[LANGUAGES[lang]],
                language_id: LANGUAGES_IDS[LANGUAGES.indexOf(LANGUAGES[lang])],
                stdin: test
            })
            .then(res => {
                trackSubmission(res.data.token, index, hidden);
            })
            .catch(err => console.log(err));
    }

    function trackSubmission(token, index, hidden) {
        setTimeout(() => {
            axios
                .get(`https://api.judge0.com/submissions/${token}`)
                .then(res => {
                    submissionResults(
                        res.data.status.description,
                        index,
                        hidden
                    );
                    if (res.data.status.id <= 2)
                        trackSubmission(token, index, hidden);
                    if (res.data.status.id === 6)
                        submissionResults(
                            res.data.compile_output,
                            index,
                            hidden
                        );
                    if (res.data.status.id >= 7 && res.data.status.id <= 12)
                        submissionResults(res.data.stderr, index, hidden);
                    if (res.data.stdout !== null) {
                        submissionResults(res.data.stdout, index, hidden);
                        if(parseFloat(res.data.time) > parseFloat(time)) setTime(parseFloat(res.data.time));
                    }
                    setProcessing(false);
                });
        }, 500);
    }
    return (
        <div className="center ace-container">
            <AceEditor
                key={name + LANGUAGES[lang] + "free response"}
                mode={LANGUAGES[lang]}
                placeholder="model solution"
                value={solution[LANGUAGES[lang]]}
                onChange={onChangeSolution}
                theme={
                    user.theme === "light"
                        ? "github"
                        : "tomorrow_night_eighties"
                }
                fontSize="14px"
                showPrintMargin={false}
                style={{
                    width: "80%",
                    borderRadius: "10px"
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
            <div
                style={{
                    width: "80%",
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={processing ? undefined : testNormal}
                    >
                        {processing ? "processsing" : "test normal"}
                    </button>
                    <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={processing ? undefined : testHidden}
                    >
                        {processing ? "processsing" : "test hidden"}
                    </button>
                </div>
                <button
                    className={"btn-small bg-3-" + user.theme}
                    onClick={() => setAllPlaceholders()}
                >
                    apply placeholder to all languages
                </button>
            </div>
            <AceEditor
                key={name + LANGUAGES[lang] + "placeholder"}
                placeholder="placeholder"
                value={placeholder[LANGUAGES[lang]]}
                onChange={onChangePlaceholder}
                mode={LANGUAGES[lang]}
                theme={
                    user.theme === "light"
                        ? "github"
                        : "tomorrow_night_eighties"
                }
                fontSize="14px"
                showPrintMargin={false}
                style={{
                    width: "80%",
                    borderRadius: "10px"
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
        </div>
    );
}
