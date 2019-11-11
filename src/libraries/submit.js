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
const TESTS = [];
const ANSWERS = [];
const RUNTIME = 500;
const MEMORY = 500;

export default function Submit({ defaultValue, testCases, language, type }) {
  let [code, setCode] = useState(defaultValue);
  let [test, setTest] = useState("");
  let [test2, setTest2] = useState("");
  let [stdout, setStdout] = useState("");
  let [stdout2, setStdout2] = useState("");
  let [error, setError] = useState("");
  let [error2, setError2] = useState("");
  let [statusText, setStatusText] = useState("");
  let [statusText2, setStatusText2] = useState("");

  function submitCode(code, test, num) {
    setStdout("");
    setStdout2("");
    setError("");
    setError2("");
    setStatusText("");
    setStatusText2("");
    axios
      .post("https://api.judge0.com/submissions/", {
        source_code: code,
        language_id: LANGUAGES_IDS[LANGUAGES.indexOf(language)],
        stdin: test,
        expected_output: test,
        cpu_time_limit: 1.00,
        stack_limit: 100
      })
      .then(res => {
        if (num === 1) setStatusText("Submitting");
        else setStatusText2("Submitting");
        trackSubmission(res.data.token, num);
      })
      .catch(err => console.log(err));
  }

  function trackSubmission(token, num) {
    setTimeout(() => {
      axios.get(`https://api.judge0.com/submissions/${token}`).then(res => {
        if (num === 1) setStatusText(res.data.status.description);
        else setStatusText2(res.data.status.description);
        if (num === 1) {
          if (res.data.status.id <= 2) trackSubmission(token, num);
          if (res.data.status.id === 4) setError(res.data.status.description);
          if (res.data.status.id === 5) setError(res.data.status.description);
          if (res.data.status.id === 6) setError(res.data.compile_output);
          if (res.data.status.id >= 7 && res.data.status.id <= 12)
            setError(res.data.stderr);
          if (res.data.stdout !== null) setStdout(res.data.stdout);
        } else {
          if (res.data.status.id <= 2) trackSubmission(token, num);
          if (res.data.status.id === 4) setError2(res.data.status.description);
          if (res.data.status.id === 5) setError2(res.data.status.description);
          if (res.data.status.id === 6) setError2(res.data.compile_output);
          if (res.data.status.id >= 7 && res.data.status.id <= 12)
            setError2(res.data.stderr);
          if (res.data.stdout !== null) setStdout2(res.data.stdout);
        }
        console.log(res.data);
      });
    }, 500);
  }

  return (
    <div>
      <AceEditor
        key={LANGUAGES[LANGUAGES.indexOf(language)] + "answer"}
        mode={LANGUAGES[LANGUAGES.indexOf(language)]}
        value={code}
        onChange={ev => setCode(ev)}
        style={{
          height: "300px",
          width: "1000px",
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
        key={LANGUAGES.indexOf(language) + "test"}
        mode={LANGUAGES.indexOf(language)}
        value={test}
        onChange={ev => setTest(ev)}
        style={{
          height: "300px",
          width: "1000px",
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
        key={LANGUAGES.indexOf(language) + "test2"}
        mode={LANGUAGES.indexOf(language)}
        value={test2}
        onChange={ev => setTest2(ev)}
        style={{
          height: "300px",
          width: "1000px",
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
      <button
        onClick={() => {
          submitCode(code, test, 1);
          submitCode(code, test2, 2);
        }}
      >
        submit
      </button>
      <p>{statusText}</p>
      <AceEditor
        key={LANGUAGES.indexOf(language) + "result"}
        mode={LANGUAGES.indexOf(language)}
        value={(stdout !== null ? stdout : "") + (error !== null ? error : "")}
        style={{
          height: "300px",
          width: "1000px",
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
      <p>{statusText2}</p>
      <AceEditor
        key={LANGUAGES.indexOf(language) + "result2"}
        mode={LANGUAGES.indexOf(language)}
        value={
          (stdout2 !== null ? stdout2 : "") + (error2 !== null ? error2 : "")
        }
        style={{
          height: "300px",
          width: "1000px",
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
