import React, { useState, useEffect, useContext } from "react";
import brace from "brace";
import AceEditor from "react-ace";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/dracula";
import "brace/theme/github";
import UserContext from "../../../utils/userContext";
import Question from "../../quiz/components/question";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJava, faPython, faJs } from "@fortawesome/free-brands-svg-icons";

const LANGUAGES = ["java", "python", "javascript"];
const ICONS = [faJava, faPython, faJs];

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
  let [solutionAnswers, setSolutionAnswers] = useState({});
  let [tests, setTests] = useState({});
  let [hiddenTests, setHiddenTests] = useState({});
  let [placeholder, setPlaceholder] = useState({});
  let [answers, setAnswers] = useState({});
  let [difficulty, setDifficulty] = useState(-1);
  let [submitFailed, setSubmitFailed] = useState(false);
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
      setLang(0);
      setSolution({ ...editQuestion.solution });
      setSolutionAnswers({ ...editQuestion.solutionAnswers });
      setPlaceholder({ ...editQuestion.placeholder });
      setAnswers({ ...editQuestion.answers });
      setDifficulty(editQuestion.difficulty);
    }
  }, []);

  function onChangeQuestion(newValue) {
    let temp = question;
    temp[LANGUAGES[lang]] = newValue;
    setQuestion(temp);
    setReload(!reload);
  }

  function checkQuestion() {
    let flag = false;
    Object.keys(question).forEach(q => {
      if (question[q].length === 0) flag = true;
    });
    return flag;
  }

  function setAllQuestions() {
    let temp = { ...question };
    Object.keys(temp).forEach(key => {
      temp[key] = question[LANGUAGES[lang]];
    });
    setQuestion(temp);
  }

  function onChangeSolution(newValue) {
    let temp = solution;
    temp[LANGUAGES[lang]] = newValue;
    setSolution(temp);
    setReload(!reload);
  }

  function checkSolution() {
    let flag = false;
    Object.keys(solution).forEach(s => {
      if (solution[s].length === 0) flag = true;
    });
    Object.keys(solutionAnswers).forEach(s => {
      if (solutionAnswers[s].length === 0) flag = true;
    });
    return flag;
  }

  function onChangeTests(newValue, index) {
    let temp = tests;
    temp[LANGUAGES[lang]][index] = newValue;
    setTests(temp);
    setReload(!reload);
  }

  function onChangeHiddenTests(newValue, index) {
    let temp = hiddenTests;
    temp[LANGUAGES[lang]][index] = newValue;
    setHiddenTests(temp);
    setReload(!reload);
  }

  function setAllTests() {
    let temp = { ...tests };
    let tempH = { ...hiddenTests };
    Object.keys(temp).forEach(key => {
      temp[key] = tests[LANGUAGES[lang]];
      tempH[key] = hiddenTests[LANGUAGES[lang]];
    });
    setTests(temp);
    setHiddenTests(tempH);
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

  function onChangeAnswers(newValue, index) {
    let temp = answers;
    temp[LANGUAGES[lang]][index] = newValue;
    setAnswers(temp);
    setReload(!reload);
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

  function setLength(len) {
    let temp = { ...answers };
    let tempLen = temp[LANGUAGES[lang]].length;
    if (len > temp[LANGUAGES[lang]].length) {
      for (let i = 0; i < len - tempLen; i++) {
        temp[LANGUAGES[lang]].push("");
      }
    } else {
      temp[LANGUAGES[lang]] = temp[LANGUAGES[lang]].splice(0, len);
    }
    temp[LANGUAGES[lang] + "-length"] = len;
    setAnswers(temp);
  }

  function toggleLanguage(index) {
    let temp = [...languages];
    let tempQ = { ...question };
    let tempS = { ...solution };
    let tempSA = { ...solutionAnswers };
    let tempT = { ...tests };
    let tempHT = { ...hiddenTests };
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
      tempSA[LANGUAGES[index]] = "";
      tempT[LANGUAGES[index]] = [""];
      tempHT[LANGUAGES[index]] = [""];
      tempP[LANGUAGES[index]] = "";
      tempA[LANGUAGES[index]] = ["", "", "", ""];
      tempA[LANGUAGES[index] + "-length"] = 4;
    } else {
      delete tempQ[LANGUAGES[index]];
      delete tempS[LANGUAGES[index]];
      delete tempSA[LANGUAGES[index]];
      delete tempT[LANGUAGES[index]];
      delete tempHT[LANGUAGES[index]];
      delete tempP[LANGUAGES[index]];
      delete tempA[LANGUAGES[index]];
      delete tempA[LANGUAGES[index] + "-length"];
    }
    temp[index] = !temp[index];
    setLanguages(temp);
    setQuestion(tempQ);
    setSolution(tempS);
    setSolutionAnswers(tempSA);
    setTests(tempT);
    setHiddenTests(tempHT);
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
        name: name,
        category: category,
        difficulty: difficulty,
        type: type,
        question: question,
        languages: temp,
        solution: solution,
        solutionAnswers: solutionAnswers,
        placeholder: placeholder,
        answers: answers
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
            name={name}
            submitFailed={submitFailed}
            checkQuestion={checkQuestion}
            languages={languages}
            lang={lang}
            setLang={setLang}
            setAllQuestions={setAllQuestions}
            onChangeQuestion={onChangeQuestion}
            tests={tests}
            onChangeTests={onChangeTests}
            hiddenTests={hiddenTests}
            onChangeHiddenTests={onChangeHiddenTests}
            setAllTests={setAllTests}
            user={user}
          />
        )}
        {/* <div className={"center p-container bg-1-" + user.theme}>
              <p className="preview-title">Preview</p>
              <FontAwesomeIcon
                style={{
                  height: "30px",
                  width: "30px",
                  margin: "5px"
                }}
                className="icon"
                icon={ICONS[LANGUAGES.indexOf(LANGUAGES[lang])]}
              />
              <p className="preview-id">{name}</p>
            </div>
            <Question
              id={name}
              preview={true}
              question={question[LANGUAGES[lang]]}
              type={type}
              language={
                LANGUAGES[lang] !== undefined ? LANGUAGES[lang] : "java"
              }
              answer={
                type === "sa"
                  ? placeholder[LANGUAGES[lang]]
                  : answers[LANGUAGES[lang]]
              }
            /> */}
        {lang !== -1 && (
          <div className={"center right-container bg-2-" + user.theme}>
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
                        (type === "mc" ? " btn-selected-" + user.theme : "")
                      }
                      onClick={() => setType("mc")}
                    >
                      Multiple Choice
                    </button>
                    <button
                      className={
                        "btn-small bg-3-" +
                        user.theme +
                        (type === "sa" ? " btn-selected-" + user.theme : "")
                      }
                      onClick={() => setType("sa")}
                    >
                      Free Reponse
                    </button>
                  </div>
                  <button
                    className={"btn-small bg-3-" + user.theme}
                    onClick={() => setAllAnswers()}
                  >
                    apply answer to all languages
                  </button>
                </div>
                {type === "sa" && (
                  <EditShortAnswer
                    lang={lang}
                    solution={solution}
                    onChangeSolution={onChangeSolution}
                    placeholder={placeholder}
                    onChangePlaceholder={onChangePlaceholder}
                    setAllPlaceholders={setAllPlaceholders}
                    user={user}
                  />
                )}
                {type === "mc" && (
                  <EditMC
                    answers={answers}
                    onChangeAnswers={onChangeAnswers}
                    setLength={setLength}
                    lang={lang}
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

function Fields({
  submitFailed,
  names,
  name,
  setName,
  category,
  categories,
  setCategory,
  difficulty,
  setDifficulty,
  lang,
  languages,
  toggleLanguage,
  user
}) {
  return (
    <div className={"center e-fields bg-2-" + user.theme}>
      <div>
        {submitFailed && name.length === 0 ? (
          <p>Please Enter A Name</p>
        ) : (
          undefined
        )}
        {submitFailed && names.includes(name) ? (
          <p>Name is taken</p>
        ) : (
          undefined
        )}
        <input
          className="inp-1"
          placeholder="name"
          type="text"
          value={name}
          onChange={ev => setName(ev.target.value)}
        />
      </div>
      <div>
        {submitFailed && category === -1 ? (
          <p>Please Select A Category</p>
        ) : (
          undefined
        )}
        <select
          className="sel-1"
          value={category}
          onChange={ev => setCategory(ev.target.value)}
        >
          <option value="-1">--Category--</option>
          {categories.map(c => (
            <option key={"category" + c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        {submitFailed && difficulty === -1 ? (
          <p>Please Select A Difficulty</p>
        ) : (
          undefined
        )}
        <select
          className="sel-1"
          value={difficulty}
          onChange={ev => setDifficulty(parseInt(ev.target.value, 10))}
        >
          <option value="-1">--Difficulty--</option>
          {new Array(10).fill(0).map((v, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      <div>
        {submitFailed && lang === -1 ? (
          <p>Please Select A Language</p>
        ) : (
          undefined
        )}
        {LANGUAGES.map((l, i) => (
          <button
            className={
              "btn-icon " + (languages[i] ? "btn-selected-" + user.theme : "")
            }
            key={"toggle-languages-" + i}
            onClick={() => toggleLanguage(i)}
          >
            <FontAwesomeIcon className="icon" icon={ICONS[i]} />
          </button>
        ))}
      </div>
    </div>
  );
}

function EditQuestion({
  question,
  name,
  submitFailed,
  checkQuestion,
  languages,
  lang,
  setLang,
  setAllQuestions,
  onChangeQuestion,
  tests,
  onChangeTests,
  hiddenTests,
  onChangeHiddenTest,
  setAllTests,
  user
}) {

  console.log(tests);
  console.log(hiddenTests);
  return (
    <div className={"left-container bg-2-" + user.theme}>
      {Object.keys(question).length !== 0 && (
        <div className="center mde">
          {submitFailed && checkQuestion() ? <p>check questions</p> : undefined}
          <div className="type">
            <div>
              {languages.map((l, i) =>
                l ? (
                  <button
                    className={
                      "btn-icon " +
                      (lang === i ? "btn-selected-" + user.theme : "")
                    }
                    key={"languages-" + i}
                    onClick={() => setLang(i)}
                  >
                    <FontAwesomeIcon className="icon" icon={ICONS[i]} />
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
          {lang !== -1 && (
            <div className="center" style={{width: "100%", flexDirection: "column"}}>
              {tests[LANGUAGES[lang]].map((test, i) => (
                <AceEditor
                  key={LANGUAGES[lang] + "test case" + i}
                  mode={LANGUAGES[lang]}
                  placeholder="test case"
                  value={tests[LANGUAGES[lang]][i]}
                  onChange={ev => onChangeTests(ev, i)}
                  theme="github"
                  fontSize="14px"
                  showPrintMargin={false}
                  maxLines={50}
                  style={{
                    marginBottom: 5,
                    height: "300px",
                    width: "80%",
                    borderRadius: "10px"
                  }}
                  editorProps={{
                    $blockScrolling: Infinity
                  }}
                />
              ))}
              <button className={"btn-small bg-3-" + user.theme}>add</button>
            </div>
          )}
          {lang !== -1 && (
            <div>
              {hiddenTests[LANGUAGES[lang]].map((test, i) => (
                <AceEditor
                  key={LANGUAGES[lang] + "hidden test case" + i}
                  mode={LANGUAGES[lang]}
                  placeholder="hidden test case"
                  value={hiddenTests[LANGUAGES[lang]][i]}
                  onChange={ev => onChangeHiddenTest(ev, i)}
                  theme="github"
                  fontSize="14px"
                  showPrintMargin={false}
                  maxLines={50}
                  style={{
                    marginBottom: 5,
                    height: "300px",
                    width: "80%",
                    borderRadius: "10px"
                  }}
                  editorProps={{
                    $blockScrolling: Infinity
                  }}
                />
              ))}
              <button className={"btn-small bg-2-" + user.theme}>add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditShortAnswer({
  lang,
  solution,
  onChangeSolution,
  placeholder,
  onChangePlaceholder,
  setAllPlaceholders,
  user
}) {
  return (
    <div className="center ace-container">
      <AceEditor
        key={LANGUAGES[lang] + "free response"}
        mode={LANGUAGES[lang]}
        placeholder="model solution"
        value={solution[LANGUAGES[lang]]}
        onChange={onChangeSolution}
        theme="github"
        fontSize="14px"
        showPrintMargin={false}
        style={{
          height: "300px",
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
          justifyContent: "flex-end"
        }}
      >
        <button
          className={"btn-small bg-3-" + user.theme}
          onClick={() => setAllPlaceholders()}
        >
          apply placeholder to all languages
        </button>
      </div>
      <AceEditor
        key={LANGUAGES[lang] + "placeholder"}
        placeholder="placeholder"
        value={placeholder[LANGUAGES[lang]]}
        onChange={onChangePlaceholder}
        mode={LANGUAGES[lang]}
        theme="github"
        fontSize="14px"
        showPrintMargin={false}
        style={{
          height: "300px",
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

function EditMC({ answers, setLength, lang, onChangeAnswers }) {
  return (
    <div className="mc-container">
      <select
        className="length sel-2"
        value={answers[LANGUAGES[lang] + "-length"]}
        onChange={ev => setLength(ev.target.value)}
      >
        {new Array(3).fill(0).map((v, i) => (
          <option key={"length-" + i} value={4 - i}>
            {4 - i}
          </option>
        ))}
      </select>
      {answers[LANGUAGES[lang]].map((a, i) => (
        <div
          key={LANGUAGES[lang] + "-answer-" + i}
          className="choice-container"
        >
          <AceEditor
            key={LANGUAGES[lang] + "-answer-" + i}
            placeholder={i === 0 ? "correct answer" : "incorrect answer"}
            style={{
              minHeight: "50px",
              width: "100%",
              backgroundColor: i === 0 ? "lightgreen" : "",
              borderRadius: "10px"
            }}
            value={a}
            onChange={ev => onChangeAnswers(ev, i)}
            mode={LANGUAGES[lang]}
            theme="github"
            maxLines={Infinity}
            fontSize="14px"
            showPrintMargin={false}
            setOptions={{
              autoScrollEditorIntoView: false
            }}
            editorProps={{
              $blockScrolling: Infinity
            }}
          />
        </div>
      ))}
    </div>
  );
}
