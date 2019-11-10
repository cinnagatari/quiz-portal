import React, { useState } from "react";
import axios from "axios";
import brace from "brace";
import AceEditor from "react-ace";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/dracula";
import "brace/theme/github";

const LANGUAGES = ["java", "python", "javascript"];
const LANGUAGES_IDS = [27, 37, 30];

export default function Submit({ defaultValue, testCases, language, type }) {
    let [code, setCode] = useState(defaultValue);
    let [test, setTest] = useState("");
    let [stdout, setStdout] = useState("");
    let [statusText, setStatusText] = useState("");
    let [compileOutput, setCompileOutput] = useState("");

    function submitCode(code) {
        setStdout("");
        axios
            .post("https://api.judge0.com/submissions/", {
                source_code: type === "test" ? code + test : code + test,
                language_id: LANGUAGES_IDS[LANGUAGES.indexOf(language)]
            })
            .then(res => {
                setStatusText("Submitting");
                trackSubmission(res.data.token);
            })
            .catch(err => console.log(err));
    }

    function trackSubmission(token) {
        setTimeout(() => {
            axios
                .get(`https://api.judge0.com/submissions/${token}`)
                .then(res => {
                    setStatusText(res.data.status.description);
                    if (res.data.status.id <= 2) trackSubmission(token);

                    if (res.data.stdout !== null) setStdout(res.data.stdout);
                    if (res.data.compile_output !== null)
                        setCompileOutput(res.data.compile_output);
                });
        }, 500);
    }

    console.log(code);

    return (
        <div>
            <AceEditor
                key={LANGUAGES[language] + "answer"}
                mode={LANGUAGES[language]}
                value={code}
                onChange={ev => setCode(ev)}
                style={{
                    height: "300px",
                    width: "500px",
                    borderRadius: "10px"
                }}
                fontSize="14px"
                theme="github"
                showPrintMargin={false}
                setOptions={{
                    autoScrollEditorIntoView: false
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
            <AceEditor
                key={LANGUAGES[language] + "test"}
                mode={LANGUAGES[language]}
                value={test}
                onChange={ev => setTest(ev)}
                style={{
                    height: "300px",
                    width: "500px",
                    borderRadius: "10px"
                }}
                fontSize="14px"
                theme="github"
                showPrintMargin={false}
                setOptions={{
                    autoScrollEditorIntoView: false
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
            <button onClick={() => submitCode(code)}>submit</button>
            <p>{statusText}</p>
            <AceEditor
                key={LANGUAGES[language] + "result"}
                mode={LANGUAGES[language]}
                value={
                    compileOutput !== null && statusText.includes("Error")
                        ? compileOutput
                        : stdout
                }
                style={{
                    height: "300px",
                    width: "500px",
                    borderRadius: "10px"
                }}
                fontSize="14px"
                theme="github"
                showPrintMargin={false}
                setOptions={{
                    autoScrollEditorIntoView: false
                }}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
        </div>
    );
}
