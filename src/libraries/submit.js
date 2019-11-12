import React, { useState, useContext } from "react";
import axios from "axios";
import brace from "brace";
import AceEditor from "react-ace";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/github";
import "brace/theme/tomorrow_night_eighties";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserContext from "../utils/userContext";

const LANGUAGES = ["java", "python", "javascript"];
const LANGUAGES_IDS = [27, 37, 30];
const STATUSES = [
    "Accepted",
    "Wrong Answer",
    "Compilation Error",
    "Time Limit Exceeded",
    "Runtime Error (NZEC)"
];
const ICONS = [
    "check",
    "times",
    "exclamation-triangle",
    "hourglass-end",
    "running"
];

const QUESTION = {
    question: "Test Question",
    tests: ["1", "2"],
    hiddenTests: ["4", "5", "6"],
    answers: ["2", "4"],
    hiddenAnswers: ["8", "10", "12"],
    results: [
        {
            status: "",
            output: "",
            error: "",
            result: ""
        },
        {
            status: "",
            output: "",
            error: "",
            result: ""
        }
    ],
    hiddenResults: [
        {
            status: "",
            output: "",
            error: "",
            result: ""
        },
        {
            status: "",
            output: "",
            error: "",
            result: ""
        },
        {
            status: "",
            output: "",
            error: "",
            result: ""
        }
    ],
    runtime: "none",
    memory: "none"
};

export default function Submit({ question, setResults, language }) {
    let [q, setQ] = useState(QUESTION);
    let [code, setCode] = useState("");
    let [mode, setMode] = useState(undefined);
    let [currentT, setCurrentT] = useState(undefined);
    let user = useContext(UserContext);

    function run() {
        setMode("run");
        reset();
        q.tests.forEach((t, i) => {
            submitCode(t, i, false);
        });
    }

    function submit() {
        setMode("submit");
        reset();
        q.hiddenTests.forEach((t, i) => {
            submitCode(t, i, true);
        });
    }

    function update(type, value, index, hidden, result) {
        let temp = { ...q };
        if (hidden) {
            temp.hiddenResults[index][type] = value;
            if (result) temp.hiddenResults[index].result = result;
        } else {
            temp.results[index][type] = value;
            if (result) temp.results[index].result = result;
        }
        setQ(temp);
    }

    function reset() {
        let temp = { ...q };
        temp.results = new Array(temp.tests.length).fill(0).map(r => {
            return {
                status: "",
                output: "",
                error: "",
                result: ""
            };
        });
        temp.hiddenResults = new Array(temp.hiddenTests.length)
            .fill(0)
            .map(r => {
                return {
                    status: "",
                    output: "",
                    error: "",
                    result: ""
                };
            });
        setQ(temp);
    }

    function submitCode(test, index, hidden) {
        axios
            .post("https://api.judge0.com/submissions/", {
                source_code: code,
                language_id: LANGUAGES_IDS[LANGUAGES.indexOf(language)],
                stdin: hidden ? q.hiddenTests[index] : q.tests[index],
                expected_output: hidden
                    ? q.hiddenAnswers[index]
                    : q.answers[index]
            })
            .then(res => {
                update("status", "Submitting", index, hidden);
                trackSubmission(res.data.token, index, hidden);
            })
            .catch(err => console.log(err));
    }

    function trackSubmission(token, index, hidden) {
        setTimeout(() => {
            axios
                .get(`https://api.judge0.com/submissions/${token}`)
                .then(res => {
                    update(
                        "status",
                        res.data.status.description,
                        index,
                        hidden
                    );

                    if (res.data.status.id <= 2)
                        trackSubmission(token, index, hidden);
                    if (res.data.status.id === 4)
                        update(
                            "error",
                            res.data.status.description,
                            index,
                            hidden,
                            false
                        );
                    if (res.data.status.id === 5)
                        update(
                            "error",
                            res.data.status.description,
                            index,
                            hidden,
                            false
                        );
                    if (res.data.status.id === 6)
                        update("error", res.data.compile_output, index, hidden);
                    if (res.data.status.id >= 7 && res.data.status.id <= 12)
                        update("error", res.data.stderr, index, hidden, false);
                    if (res.data.stdout !== null)
                        update("output", res.data.stdout, index, hidden);
                    console.log(res.data);
                });
        }, 500);
    }

    return (
        <div className="center submit-code">
            <AceEditor
                key={LANGUAGES[LANGUAGES.indexOf(language)] + "answer"}
                mode={LANGUAGES[LANGUAGES.indexOf(language)]}
                value={code}
                onChange={ev => setCode(ev)}
                style={{
                    marginTop: "10px",
                    height: "80vh",
                    width: "80%",
                    borderRadius: "10px"
                }}
                fontSize="14px"
                theme={
                    user.theme === "light"
                        ? "github"
                        : "tomorrow_night_eighties"
                }
                showPrintMargin={false}
                setOptions={{
                    autoScrollEditorIntoView: false,
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
            <div className="submit-buttons">
                <button
                    className={"btn-small btn-" + user.theme}
                    onClick={() => run()}
                >
                    run
                </button>
                <button
                    className={"btn-small btn-" + user.theme}
                    onClick={() => submit()}
                >
                    test
                </button>
                <button
                    className={"btn-small btn-" + user.theme}
                    onClick={() => reset()}
                >
                    reset
                </button>
            </div>
            {mode === "run" && (
                <div className="statuses">
                    {q.results.map((r, i) => {
                        if (!STATUSES.includes(r.status) && r.status !== "")
                            return (
                                <button
                                    key={q.tests[i] + "result"}
                                    className={"btn-result btn-" + user.theme}
                                >
                                    <FontAwesomeIcon
                                        icon="spinner"
                                        spin
                                        size="lg"
                                    />
                                </button>
                            );
                        else if (STATUSES.includes(r.status))
                            return (
                                <button
                                    key={q.tests[i] + "result"}
                                    className={"btn-result btn-" + user.theme}
                                    style={{
                                        backgroundColor:
                                            r.status === "Accepted"
                                                ? "lightgreen"
                                                : r.status === "Wrong Answer"
                                                ? "lightpink"
                                                : "yellow"
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={ICONS[STATUSES.indexOf(r.status)]}
                                        size="lg"
                                    />
                                </button>
                            );
                    })}
                </div>
            )}
            {mode === "submit" && (
                <div className="statuses">
                    {q.hiddenResults.map((r, i) => {
                        if (!STATUSES.includes(r.status) && r.status !== "")
                            return (
                                <button
                                    key={q.hiddenTests[i] + "result"}
                                    className={"btn-result btn-" + user.theme}
                                >
                                    <FontAwesomeIcon
                                        icon="spinner"
                                        spin
                                        size="lg"
                                    />
                                </button>
                            );
                        else if (STATUSES.includes(r.status))
                            return (
                                <button
                                    key={q.hiddenTests[i] + "result"}
                                    className={"btn-result btn-" + user.theme}
                                    style={{
                                        backgroundColor:
                                            r.status === "Accepted"
                                                ? "lightgreen"
                                                : r.status === "Wrong Answer"
                                                ? "lightpink"
                                                : "yellow"
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={ICONS[STATUSES.indexOf(r.status)]}
                                        size="lg"
                                    />
                                </button>
                            );
                    })}
                </div>
            )}
        </div>
    );
}
