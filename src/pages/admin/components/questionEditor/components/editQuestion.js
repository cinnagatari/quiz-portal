import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJava, faPython, faJs } from "@fortawesome/free-brands-svg-icons";
import AceEditor from "react-ace";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/github";
import "brace/theme/tomorrow_night_eighties";

import { LANGUAGES } from "../../../../../utils/config";
const ICONS = [faJava, faPython, faJs];

export default function EditQuestion({
    question,
    setQuestion,
    name,
    submitFailed,
    checkQuestion,
    languages,
    lang,
    setLang,
    tests,
    setTests,
    testAnswers,
    setTestAnswers,
    hiddenTests,
    setHiddenTests,
    hiddenTestAnswers,
    setHiddenTestAnswers,
    type,
    mode,
    submit,
    reload,
    setReload,
    user
}) {
    function onChangeQuestion(newValue) {
        let temp = question;
        temp[LANGUAGES[lang]] = newValue;
        setQuestion(temp);
        setReload(!reload);
    }

    function setAllQuestions() {
        let temp = { ...question };
        Object.keys(temp).forEach(key => {
            temp[key] = question[LANGUAGES[lang]];
        });
        setQuestion(temp);
    }

    function onChangeTests(newValue, index) {
        let temp = tests;
        temp[LANGUAGES[lang]][index] = newValue;
        setTests(temp);
        setReload(!reload);
    }

    function addTestCase(hidden) {
        let temp = hidden ? { ...hiddenTests } : { ...tests };
        let tempA = hidden ? { ...hiddenTestAnswers } : { ...testAnswers };
        temp[LANGUAGES[lang]].push("");
        tempA[LANGUAGES[lang]].push("");
        hidden ? setHiddenTests(temp) : setTests(temp);
        hidden ? setHiddenTestAnswers(tempA) : setTestAnswers(tempA);
    }

    function onChangeHiddenTests(newValue, index) {
        let temp = hiddenTests;
        temp[LANGUAGES[lang]][index] = newValue;
        setHiddenTests(temp);
        setReload(!reload);
    }

    function removeTestCase(hidden) {
        let temp = hidden ? { ...hiddenTests } : { ...tests };
        let tempA = hidden ? { ...hiddenTestAnswers } : { ...testAnswers };
        temp[LANGUAGES[lang]].pop();
        hidden ? setHiddenTests(temp) : setTests(temp);
        hidden ? setHiddenTestAnswers(tempA) : setTestAnswers(tempA);
    }

    function setAllTests() {
        let temp = { ...tests };
        let tempH = { ...hiddenTests };
        let tempA = { ...testAnswers };
        let tempHA = { ...hiddenTestAnswers };
        Object.keys(temp).forEach(key => {
            temp[key] = [...tests[LANGUAGES[lang]]];
            tempH[key] = [...hiddenTests[LANGUAGES[lang]]];
            tempA[key] = [...testAnswers[LANGUAGES[lang]]];
            tempHA[key] = [...hiddenTestAnswers[LANGUAGES[lang]]];
        });
        setTests(temp);
        setHiddenTests(tempH);
        setTestAnswers(tempA);
        setHiddenTestAnswers(tempHA);
    }

    return (
        <div className={"left-container bg-2-" + user.theme}>
            {Object.keys(question).length !== 0 && (
                <div className="center mde">
                    {submitFailed && checkQuestion() ? (
                        <p>check questions</p>
                    ) : (
                        undefined
                    )}
                    <div className="type">
                        <div>
                            {languages.map((l, i) =>
                                l ? (
                                    <button
                                        className={
                                            "btn-icon " +
                                            (lang === i
                                                ? "btn-selected-" + user.theme
                                                : "")
                                        }
                                        key={"languages-" + i}
                                        onClick={() => setLang(i)}
                                    >
                                        <FontAwesomeIcon
                                            className="icon"
                                            icon={ICONS[i]}
                                        />
                                    </button>
                                ) : (
                                    undefined
                                )
                            )}
                        </div>
                        <button
                            className={"btn-small bg-3-" + user.theme}
                            onClick={() => setAllQuestions()}
                        >
                            apply question to all languages
                        </button>
                    </div>
                    {lang !== -1 && (
                        <div className={"mde-container bg-3-" + user.theme}>
                            <SimpleMDE
                                key={LANGUAGES[lang] + question}
                                onChange={onChangeQuestion}
                                value={question[LANGUAGES[lang]]}
                                id={name}
                                options={{
                                    placeholder: "enter question here",
                                    lineWrapping: false,
                                    spellChecker: false,
                                    status: false
                                }}
                            />
                        </div>
                    )}
                    {lang !== -1 && type === "sa" && (
                        <div
                            className="center test-cases"
                            style={{ width: "100%", flexDirection: "column" }}
                        >
                            {tests[LANGUAGES[lang]].map((test, i) => (
                                <AceEditor
                                    key={name + LANGUAGES[lang] + "test case" + i}
                                    mode={LANGUAGES[lang]}
                                    placeholder="test case"
                                    value={tests[LANGUAGES[lang]][i]}
                                    onChange={ev => onChangeTests(ev, i)}
                                    theme={
                                        user.theme === "light"
                                            ? "github"
                                            : "tomorrow_night_eighties"
                                    }
                                    fontSize="14px"
                                    showPrintMargin={false}
                                    maxLines={50}
                                    style={{
                                        height: "300px",
                                        width: "80%",
                                        borderRadius: "10px",
                                        marginBottom: 5
                                    }}
                                    editorProps={{
                                        $blockScrolling: Infinity
                                    }}
                                />
                            ))}
                            <div
                                style={{
                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div>
                                    <button
                                        onClick={() => addTestCase(false)}
                                        style={{
                                            backgroundColor: "lightgreen"
                                        }}
                                        className={
                                            "btn-small bg-3-" + user.theme
                                        }
                                    >
                                        +
                                    </button>
                                    {tests[LANGUAGES[lang]].length > 1 && (
                                        <button
                                            style={{
                                                backgroundColor: "lightpink"
                                            }}
                                            className={
                                                "btn-small bg-3-" + user.theme
                                            }
                                            onClick={() =>
                                                removeTestCase(false)
                                            }
                                        >
                                            -
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={setAllTests}
                                    className={"btn-small bg-3-" + user.theme}
                                >
                                    apply test cases to all languages
                                </button>
                            </div>
                        </div>
                    )}
                    {lang !== -1 && type === "sa" && (
                        <div className="center test-cases">
                            {hiddenTests[LANGUAGES[lang]].map((test, i) => (
                                <AceEditor
                                    key={
                                        name + LANGUAGES[lang] + "hidden test case" + i
                                    }
                                    mode={LANGUAGES[lang]}
                                    placeholder="hidden test case"
                                    value={hiddenTests[LANGUAGES[lang]][i]}
                                    onChange={ev => onChangeHiddenTests(ev, i)}
                                    theme={
                                        user.theme === "light"
                                            ? "github"
                                            : "tomorrow_night_eighties"
                                    }
                                    fontSize="14px"
                                    showPrintMargin={false}
                                    maxLines={50}
                                    style={{
                                        height: "300px",
                                        width: "80%",
                                        borderRadius: "10px",
                                        marginBottom: 5
                                    }}
                                    editorProps={{
                                        $blockScrolling: Infinity
                                    }}
                                />
                            ))}
                            <div
                                style={{
                                    width: "80%",
                                    justifyContent: "flex-start",
                                }}
                            >
                                    <button
                                        onClick={() => addTestCase(false)}
                                        style={{
                                            backgroundColor: "lightgreen"
                                        }}
                                        className={
                                            "btn-small bg-3-" + user.theme
                                        }
                                    >
                                        +
                                    </button>
                                    {hiddenTests[LANGUAGES[lang]].length >
                                        1 && (
                                        <button
                                            style={{
                                                backgroundColor: "lightpink"
                                            }}
                                            className={
                                                "btn-small bg-3-" + user.theme
                                            }
                                            onClick={() => removeTestCase(true)}
                                        >
                                            -
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}
                    {lang !== -1 && type === "sa" && (
                        <div className="center test-cases">
                            {testAnswers[LANGUAGES[lang]].map((test, i) => (
                                <AceEditor
                                    key={
                                        name + 
                                        LANGUAGES[lang] +
                                        "test case answers" +
                                        i
                                    }
                                    mode={LANGUAGES[lang]}
                                    value={testAnswers[LANGUAGES[lang]][i]}
                                    theme={
                                        user.theme === "light"
                                            ? "github"
                                            : "tomorrow_night_eighties"
                                    }
                                    fontSize="14px"
                                    showPrintMargin={false}
                                    maxLines={50}
                                    style={{
                                        height: "300px",
                                        width: "80%",
                                        borderRadius: "10px",
                                        marginBottom: 5
                                    }}
                                    editorProps={{
                                        $blockScrolling: Infinity
                                    }}
                                    setOptions={{
                                        readOnly: true
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    {lang !== -1 && type === "sa" && (
                        <div className="center test-cases">
                            {hiddenTestAnswers[LANGUAGES[lang]].map(
                                (test, i) => (
                                    <AceEditor
                                        key={
                                            name + 
                                            LANGUAGES[lang] +
                                            "hidden test case answers" +
                                            i
                                        }
                                        mode={LANGUAGES[lang]}
                                        value={
                                            hiddenTestAnswers[LANGUAGES[lang]][
                                                i
                                            ]
                                        }
                                        theme={
                                            user.theme === "light"
                                                ? "github"
                                                : "tomorrow_night_eighties"
                                        }
                                        fontSize="14px"
                                        showPrintMargin={false}
                                        maxLines={50}
                                        style={{
                                            height: "300px",
                                            width: "80%",
                                            borderRadius: "10px",
                                            marginBottom: 5
                                        }}
                                        editorProps={{
                                            $blockScrolling: Infinity
                                        }}
                                        setOptions={{
                                            readOnly: true
                                        }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
            {lang !== -1 && (
                <div
                    className="center"
                    style={{ alignSelf: "center", width: "80%" }}
                >
                    <button
                        className={"btn-medium bg-3-" + user.theme}
                        onClick={submit}
                    >
                        {mode} question
                    </button>
                </div>
            )}
        </div>
    );
}
