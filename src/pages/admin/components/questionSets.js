import React, { useState, useEffect, useContext } from "react";
import { version, loadDB } from "../../../libraries/loadDB";
import idb from "../../../utils/indexedDB";
import { set } from "../../../libraries/set";
import Popup from "../../../main/components/popup";
import Question from "../../quiz/components/question";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJava, faPython, faJs } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowAltCircleLeft,
  faArrowAltCircleRight
} from "@fortawesome/free-regular-svg-icons";
import UserContext from "../../../utils/userContext";
import Filter from "../../components/filter";

const LANGUAGES = ["java", "python", "javascript"];
const ICONS = [faJava, faPython, faJs];

export default function QuestionSets() {
  let [sets, setSets] = useState([]);
  let [questions, setQuestions] = useState([]);
  let [type, setType] = useState("none");
  let [filter, setFilter] = useState([]);
  let [language, setLanguage] = useState("none");
  let [lowerDiff, setLowerDiff] = useState(1);
  let [upperDiff, setUpperDiff] = useState(10);
  let [currentSet, setCurrentSet] = useState("");
  let [currentQ, setCurrentQ] = useState(-1);
  let [currentQuestion, setCurrentQuestion] = useState("");
  let [adding, setAdding] = useState(false);
  let [editing, setEditing] = useState(false);
  let [loading, setLoading] = useState(true);
  let [errorMessage, setErrorMessage] = useState("");
  let user = useContext(UserContext);

  useEffect(() => {
    versionCheck();
  }, []);

  useEffect(() => {
    setCurrentQ(-1);
    setCurrentSet("");
  }, [filter, type, language]);

  useEffect(() => {
    if (currentQ !== -1)
      setCurrentQuestion(
        questions[
          questions.map(q => q.name).indexOf(currentSet.questions[currentQ])
        ]
      );
  }, [currentQ]);

  async function deleteSet(original) {
    await set.delete(original).then(newValues => {
      if (newValues.error !== "") setErrorMessage(newValues.error);
      setSets(newValues.s);
    });
  }

  async function versionCheck() {
    let versionState = {};
    await version.check(["s", "q"]).then(version => (versionState = version));
    if (versionState.q === "load")
      await loadDB.questions().then(questions => {
        setQuestions(questions);
      });
    else {
      let questions = await idb.questions.get("questions").then(q => q);
      if (questions === undefined)
        await loadDB.questions().then(questions => {
          setQuestions(questions);
        });
      else {
        setQuestions(questions.questions);
      }
    }
    if (versionState.s === "load") loadDB.sets().then(sets => setSets(sets));
    else {
      let sets = await idb.sets.get("sets").then(s => s);
      if (sets === undefined) loadDB.sets().then(sets => setSets(sets));
      else setSets(sets.sets);
    }
    setLoading(false);
  }

  function checkFilter(set) {
    let cnt = 0;
    filter.forEach(f => {
      if (set.filter.includes(f)) cnt++;
    });
    return cnt === filter.length;
  }

  return (
    <div className="set-editor">
      <div className="filter-container">
        {!loading && (
          <Filter
            newFilter={setFilter}
            newType={setType}
            newLowerDiff={setLowerDiff}
            newUpperDiff={setUpperDiff}
            newLanguage={setLanguage}
          />
        )}
      </div>
      <div className={"set-container bg-2-" + user.theme}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start"
          }}
        >
          <div className={"center s-title bg-1-" + user.theme}>Sets</div>
          <button
            className={"btn-small btn-" + user.theme}
            onClick={() => setAdding(true)}
          >
            Add
          </button>
          {currentSet !== "" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button
                onClick={() => setEditing(true)}
                className={"btn-small btn-" + user.theme}
              >
                Edit
              </button>
              <button
                className={"btn-small btn-" + user.theme}
                onClick={() => {
                  deleteSet(currentSet.name);
                  setCurrentSet("");
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <div className={"sets"}>
          {sets.map(s => {
            if (
              checkFilter(s) &&
              lowerDiff <= s.difficulty &&
              s.difficulty <= upperDiff &&
              (s.languages.includes(language) || language === "none")
            )
              return (
                <button
                  className={
                    "btn-small btn-" +
                    user.theme +
                    (s.name === currentSet.name
                      ? " btn-selected-" + user.theme
                      : "")
                  }
                  key={s.name}
                  onClick={() =>
                    setCurrentSet(s.name === currentSet.name ? "" : s)
                  }
                >
                  {s.name}
                </button>
              );
          })}
        </div>
      </div>
      <div>
        {currentSet !== "" && (
          <div className={"set-container bg-2-" + user.theme}>
            <div className={"s-title bg-1-" + user.theme}>Questions</div>
            <div>
              {currentSet.questions.map((q, i) => (
                <button
                  className={
                    "btn-small btn-" +
                    user.theme +
                    (i === currentQ ? " btn-selected-" + user.theme : "")
                  }
                  key={q + i}
                  onClick={() => setCurrentQ(i)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {adding && (
        <Popup
          close={() => setAdding(false)}
          contents={
            <EditSets
              questions={questions}
              setQuestions={setQuestions}
              sets={sets}
              setSets={setSets}
              mode={"Add"}
              close={() => setAdding(false)}
            />
          }
        />
      )}
      {editing && (
        <Popup
          close={() => setEditing(false)}
          contents={
            <EditSets
              questions={questions}
              setQuestions={setQuestions}
              sets={sets}
              setSets={setSets}
              setCurrentSet={setCurrentSet}
              setEdit={currentSet}
              mode={"Edit"}
              close={() => setEditing(false)}
            />
          }
        />
      )}

      {currentQuestion !== "" && (
        <Popup
          close={() => {
            setCurrentQuestion("");
            setCurrentQ(-1);
          }}
          contents={
            <div className={"center question-preview bg-2-" + user.theme}>
              <button
                className="btn-icon"
                onClick={() =>
                  setCurrentQ(
                    currentQ !== 0
                      ? currentQ - 1
                      : currentSet.questions.length - 1
                  )
                }
              >
                <FontAwesomeIcon
                  className="icon-2"
                  icon={faArrowAltCircleLeft}
                />
              </button>
              <div className={"center p-container bg-1-" + user.theme}>
                <div className="t-container">
                  <p className="preview-title">Preview</p>
                  <FontAwesomeIcon
                    style={{
                      height: "30px",
                      width: "30px",
                      margin: "5px"
                    }}
                    className="icon"
                    icon={
                      ICONS[
                        LANGUAGES.indexOf(
                          language !== "none"
                            ? language
                            : currentQuestion.languages[0]
                        )
                      ]
                    }
                  />
                  <p className="preview-id">{currentQuestion.name}</p>
                </div>
                <Question
                  preview={true}
                  id={currentQuestion.name}
                  question={
                    currentQuestion.question[
                      language !== "none"
                        ? language
                        : currentQuestion.languages[0]
                    ]
                  }
                  language={
                    language !== "none"
                      ? language
                      : currentQuestion.languages[0]
                  }
                  type={currentQuestion.type}
                  answer={
                    currentQuestion.type === "mc"
                      ? currentQuestion.answers[
                          language !== "none"
                            ? language
                            : currentQuestion.languages[0]
                        ]
                      : currentQuestion.placeholder[
                          language !== "none"
                            ? language
                            : currentQuestion.languages[0]
                        ]
                  }
                />
              </div>
              <button
                className="btn-icon"
                onClick={() =>
                  setCurrentQ(
                    currentQ !== currentSet.questions.length - 1
                      ? currentQ + 1
                      : 0
                  )
                }
              >
                <FontAwesomeIcon
                  className="icon-2"
                  icon={faArrowAltCircleRight}
                />
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}

function EditSets({
  questions,
  setQuestions,
  sets,
  setSets,
  setCurrentSet,
  setEdit,
  mode,
  close
}) {
  let [filter, setFilter] = useState([]);
  let [language, setLanguage] = useState("none");
  let [type, setType] = useState("none");
  let [lowerDiff, setLowerDiff] = useState(1);
  let [upperDiff, setUpperDiff] = useState(10);
  let [currentQuestion, setCurrentQuestion] = useState("");
  let [name, setName] = useState("");
  let names = questions.map(q => q.name);
  let [length, setLength] = useState("");
  let [addedQuestions, setAddedQuestions] = useState([]);
  let [addedCategories, setAddedCategories] = useState([]);
  let [currentC, setCurrentC] = useState("");
  let [averageDiff, setAverageDiff] = useState("");
  let [valid, setValid] = useState(true);
  let [errorMessage, setErrorMessage] = useState("");
  let user = useContext(UserContext);

  function checkFilter(q) {
    return (
      (filter.includes(q.category) || filter.length === 0) &&
      (type === q.type || type === "none") &&
      lowerDiff <= q.difficulty &&
      q.difficulty <= upperDiff &&
      (q.languages.includes(language) || language === "none")
    );
  }

  useEffect(() => {
    if (mode === "Edit") {
      setName(setEdit.name);
      setAddedQuestions(
        setEdit.questions.map(q => questions[names.indexOf(q)])
      );
    }
  }, []);

  useEffect(() => {
    let categories = [];
    let difficulty = 0;
    addedQuestions.forEach(q => {
      if (!categories.includes(q.category)) categories.push(q.category);
      difficulty += parseInt(q.difficulty, 10);
    });
    setCurrentC(categories.includes(currentC) ? currentC : "");
    setAddedCategories(categories.sort());
    setAverageDiff(Math.floor(difficulty / addedQuestions.length));
  }, [addedQuestions]);

  async function addSet(newSet) {
    await set.add(newSet).then(newValues => {
      if (newValues.error !== undefined) setErrorMessage(newValues.error);
      setQuestions(newValues.q);
      setSets(newValues.s);
    });
  }

  async function editSet(newSet) {
    await set.edit(newSet, setEdit.name).then(newValues => {
      if (newValues.error !== undefined) setErrorMessage(newValues.error);
      else setCurrentSet(newSet);
      setQuestions(newValues.q);
      setSets(newValues.s);
    });
  }

  function randomize() {
    let filtered = [...questions];
    filtered = filtered.filter(q => checkFilter(q));
    let visited = new Array(filtered.length).fill(false);
    let random = [];
    while (random.length < Math.min(filtered.length, length)) {
      let rand = Math.floor(Math.random() * filtered.length);
      if (!visited[rand]) {
        random.push(filtered[rand]);
        visited[rand] = true;
      }
    }
    setAddedQuestions(random);
  }

  return (
    <div className="center s-editor">
      <div className={"s-title bg-1-" + user.theme}>Set Editor</div>
      <div className={"s-fields"}>
        <div className={"fields-inputs"}>
          {!valid && names.includes(name) && <p>Name is in use</p>}
          <input
            className="inp-1"
            value={name}
            onChange={ev => setName(ev.target.value)}
            placeholder="enter name"
          />
          {errorMessage !== "" && <p>{errorMessage}</p>}
          <button
            className={"btn-small btn-" + user.theme}
            onClick={() => {
              if (
                addedQuestions.length !== 0 &&
                (!sets.map(s => s.name).includes(name) || name === setEdit.name)
              ) {
                if (mode === "Add")
                  addSet({
                    name: name,
                    questions: addedQuestions.map(q => q.name)
                  });
                else
                  editSet({
                    name: name,
                    questions: addedQuestions.map(q => q.name)
                  });
                setValid(true);
                close();
              } else {
                setValid(false);
              }
            }}
          >
            {mode}
          </button>
          <input
            placeholder="# of questions"
            type="number"
            className="inp-2"
            value={length}
            onChange={ev => setLength(ev.target.value)}
          />
          <button
            className={"btn-small btn-" + user.theme}
            onClick={() => randomize()}
          >
            randomize
          </button>
          {addedQuestions.length !== 0 && (
            <div className={"center stats-difficulty"}>
              <p className={"stats-title bg-1-" + user.theme}>Difficulty</p>
              <p className={"stats-number"}>{averageDiff}</p>
            </div>
          )}
        </div>
      </div>
      <div className={"fields-questions"}>
        {addedQuestions.length !== 0 && (
          <div className={"f-stats"}>
            <div className={"stats-categories"}>
              <p className={"stats-title bg-1-" + user.theme}>Categories</p>

              {addedCategories.map(c => (
                <button
                  key={"sel-" + c}
                  className={
                    "btn-small btn-" +
                    user.theme +
                    (c === currentC ? " btn-selected-" + user.theme : "")
                  }
                  onClick={() => setCurrentC(c !== currentC ? c : "")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={"f-questions"}>
          {addedQuestions.map(q => (
            <button
              key={q.name + "-selected"}
              onClick={() => {
                if (currentQuestion.name === q.name)
                  setAddedQuestions(
                    addedQuestions.filter(v => v.name !== q.name)
                  );
                else setCurrentQuestion(q);
              }}
              className={
                "btn-small btn-" +
                user.theme +
                (q.category === currentC ? " btn-selected-" + user.theme : "")
              }
            >
              {q.name + (currentQuestion.name === q.name ? "(X)" : "")}
            </button>
          ))}
        </div>
      </div>
      <div className="s-container">
        <div className={"left-container bg-1-" + user.theme}>
          <div className={"filter-container"}>
            <Filter
              newFilter={setFilter}
              newType={setType}
              newLowerDiff={setLowerDiff}
              newUpperDiff={setUpperDiff}
              newLanguage={setLanguage}
            />
          </div>
          <div className={"q-container bg-2-" + user.theme}>
            <div>
              <p className={"q-title bg-1-" + user.theme}>Questions</p>
            </div>
            <div>
              {questions.map(q => {
                if (checkFilter(q))
                  return (
                    <button
                      key={q.name}
                      className={
                        "btn-small btn-" +
                        user.theme +
                        (addedQuestions.map(q => q.name).includes(q.name)
                          ? " btn-selected-" + user.theme
                          : "")
                      }
                      onClick={() => {
                        setCurrentQuestion(q);
                        setAddedQuestions(
                          addedQuestions.map(q => q.name).includes(q.name)
                            ? addedQuestions.filter(v => v.name !== q.name)
                            : [...addedQuestions, q]
                        );
                      }}
                    >
                      {q.name}
                    </button>
                  );
              })}
            </div>
          </div>
        </div>
        {currentQuestion !== "" && (
          <div className={"center right-container bg-1-" + user.theme}>
            <div className="center t-container">
              <p className="preview-title">Preview</p>
              <FontAwesomeIcon
                style={{
                  height: "30px",
                  width: "30px",
                  margin: "5px"
                }}
                className="icon"
                icon={
                  ICONS[
                    LANGUAGES.indexOf(
                      language !== "none"
                        ? language
                        : currentQuestion.languages[0]
                    )
                  ]
                }
              />
              <p className="preview-id">{currentQuestion.name}</p>
            </div>
            <Question
              preview={true}
              id={currentQuestion.name}
              question={
                currentQuestion.question[
                  language !== "none" ? language : currentQuestion.languages[0]
                ]
              }
              language={
                language !== "none" ? language : currentQuestion.languages[0]
              }
              type={currentQuestion.type}
              answer={
                currentQuestion.type === "mc"
                  ? currentQuestion.answers[
                      language !== "none"
                        ? language
                        : currentQuestion.languages[0]
                    ]
                  : currentQuestion.placeholder[
                      language !== "none"
                        ? language
                        : currentQuestion.languages[0]
                    ]
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
