import React, { useState, useContext, useEffect } from "react";
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
      error: ""
    },
    {
      status: "",
      output: "",
      error: ""
    }
  ],
  hiddenResults: [
    {
      status: "",
      output: "",
      error: ""
    },
    {
      status: "",
      output: "",
      error: ""
    },
    {
      status: "",
      output: "",
      error: ""
    }
  ],
  runtime: "none",
  memory: "none",
  result: [0, 0]
};

export default function Submit({ question, setResults, language }) {
  let [q, setQ] = useState(QUESTION);
  let [code, setCode] = useState("");
  let [mode, setMode] = useState(undefined);
  let [currentT, setCurrentT] = useState(-1);
  let [processing, setProcessing] = useState(false);
  let [result, setResult] = useState([0, 0]);
  let user = useContext(UserContext);


  

  async function run() {
    setMode("run");
    await reset();
    q.tests.forEach((t, i) => {
      submitCode(t, i, false);
    });
  }

  async function submit() {
    setMode("submit");
    await reset();
    q.hiddenTests.forEach((t, i) => {
      submitCode(t, i, true);
    });
  }

  function update(type, value, index, hidden) {
    console.log(20);
    let temp = { ...q };
    if (hidden) {
      temp.hiddenResults[index][type] = value;
      if (value === "Accepted") {
        temp.result[1]++;
        result[1]++;
      }
    } else {
      temp.results[index][type] = value;
      if (value === "Accepted") {
        temp.result[0]++;
        result[0]++;
      }
    }
    setQ(temp);
    let check = false;
    if (hidden) {
      temp.hiddenResults.forEach(r => {
        if (
          r.status === "In Queue" ||
          r.status === "Processing" ||
          r.status === ""
        ) {
          check = true;
        }
      });
    } else {
      temp.results.forEach(r => {
        if (
          r.status === "In Queue" ||
          r.status === "Processing" ||
          r.status === ""
        ) {
          check = true;
        }
      });
    }
    setProcessing(check);
  }

  async function reset() {
    let temp = { ...q };
    console.log(1);
    temp.results = new Array(temp.tests.length).fill(0).map(r => {
      return {
        status: "",
        output: "",
        error: ""
      };
    });
    temp.hiddenResults = new Array(temp.hiddenTests.length).fill(0).map(r => {
      return {
        status: "",
        output: "",
        error: ""
      };
    });
    temp.result = [0, 0];
    console.log(temp);
    setQ(temp);
    console.log(q);
    setCurrentT(-1);
  }

  function submitCode(test, index, hidden) {
    console.log(10);
    setProcessing(true);
    axios
      .post("https://api.judge0.com/submissions/", {
        source_code: code,
        language_id: LANGUAGES_IDS[LANGUAGES.indexOf(language)],
        stdin: test,
        expected_output: hidden ? q.hiddenAnswers[index] : q.answers[index]
      })
      .then(res => {
        trackSubmission(res.data.token, index, hidden);
      })
      .catch(err => console.log(err));
  }

  function trackSubmission(token, index, hidden) {
    setTimeout(() => {
      axios.get(`https://api.judge0.com/submissions/${token}`).then(res => {
        update("status", res.data.status.description, index, hidden);

        if (res.data.status.id <= 2) trackSubmission(token, index, hidden);
        if (res.data.status.id === 4)
          update("error", res.data.status.description, index, hidden);
        if (res.data.status.id === 5)
          update("error", res.data.status.description, index, hidden);
        if (res.data.status.id === 6)
          update("error", res.data.compile_output, index, hidden);
        if (res.data.status.id >= 7 && res.data.status.id <= 12)
          update("error", res.data.stderr, index, hidden);
        if (res.data.stdout !== null)
          update("output", res.data.stdout, index, hidden);
      });
    }, 500);
  }

  console.log(q);
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
        theme={user.theme === "light" ? "github" : "tomorrow_night_eighties"}
        showPrintMargin={false}
        setOptions={{
          autoScrollEditorIntoView: false
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
      {!processing && (
        <div className="submit-buttons">
          <button
            className={"btn-medium bg-2-" + user.theme}
            onClick={() => run()}
          >
            run
          </button>
          <button
            className={"btn-medium bg-2-" + user.theme}
            onClick={() => submit()}
          >
            test
          </button>
          <button
            className={"btn-medium bg-2-" + user.theme}
            onClick={() => reset()}
          >
            reset
          </button>
        </div>
      )}
      {mode === "run" && (
        <div className="statuses">
          {q.results.map((r, i) => {
            if (!STATUSES.includes(r.status) && r.status !== "")
              return (
                <button
                  key={q.tests[i] + "result"}
                  className={"btn-result btn-" + user.theme}
                >
                  <FontAwesomeIcon icon="spinner" spin size="lg" />
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
                  onClick={() => setCurrentT(i)}
                >
                  <FontAwesomeIcon
                    icon={ICONS[STATUSES.indexOf(r.status)]}
                    size="lg"
                  />
                </button>
              );
          })}
          {q.result[0] === q.tests.length && <p>All Correct!</p>}
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
                  <FontAwesomeIcon icon="spinner" spin size="lg" />
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
          {q.result[1] === q.hiddenTests.length && <p>All Correct!</p>}
        </div>
      )}
      {currentT !== -1 && (
        <Result
          result={q.results[currentT]}
          test={q.tests[currentT]}
          answer={q.answers[currentT]}
          language={language}
          user={user}
        />
      )}
    </div>
  );
}

function Result({ result, test, answer, language, user }) {
  return (
    <div className={"center submit-result bg-3-" + user.theme}>
      <p className={"result-title txt-2 bg-2-" + user.theme}>Input</p>
      <AceEditor
        key={test + "input"}
        mode={LANGUAGES[LANGUAGES.indexOf(language)]}
        value={test}
        style={{
          width: "100%",
          borderRadius: "5px"
        }}
        fontSize="14px"
        theme={user.theme === "light" ? "github" : "tomorrow_night_eighties"}
        showPrintMargin={false}
        maxLines={Infinity}
        setOptions={{
          readOnly: true,
          showGutter: false,
          highlightActiveLine: false
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
      <p className={"result-title txt-2 bg-2-" + user.theme}>Expected Output</p>
      <AceEditor
        key={answer + "expected output"}
        mode={LANGUAGES[LANGUAGES.indexOf(language)]}
        value={answer}
        style={{
          width: "100%",
          borderRadius: "5px"
        }}
        fontSize="14px"
        theme={user.theme === "light" ? "github" : "tomorrow_night_eighties"}
        showPrintMargin={false}
        maxLines={Infinity}
        setOptions={{
          readOnly: true,
          showGutter: false,
          highlightActiveLine: false
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
      <p className={"result-title txt-2 bg-2-" + user.theme}>Output</p>
      <AceEditor
        key={test + "result output"}
        mode={LANGUAGES[LANGUAGES.indexOf(language)]}
        value={
          result.output !== ""
            ? result.output
            : "" + result.error !== ""
            ? result.error.length < 200
              ? result.error
              : result.error.substring(0, 200) + "--shortened--"
            : ""
        }
        style={{
          width: "100%",
          borderRadius: "5px"
        }}
        fontSize="14px"
        theme={user.theme === "light" ? "github" : "tomorrow_night_eighties"}
        showPrintMargin={false}
        maxLines={Infinity}
        setOptions={{
          readOnly: true,
          showGutter: false,
          highlightActiveLine: false
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
    </div>
  );
}
