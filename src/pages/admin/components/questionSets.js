import React, { useState, useEffect, useContext } from "react";
import { db } from "../../../utils/firebase";
import { version, loadDB, sets, question } from "../../../libraries/loadDB";
import Popup from "../../../main/components/popup";
import Question from "../../quiz/components/question";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJava, faPython, faJs } from "@fortawesome/free-brands-svg-icons";
import UserContext from "../../../utils/userContext";
import Filter from "../../../libraries/filter";

const LANGUAGES = ["java", "python", "javascript"];
const ICONS = [faJava, faPython, faJs];

const TYPES = ["mc", "sa"];

const DIFFICULTY = new Array(10).fill(0).map((v, i) => i + 1);

export default function QuestionSets() {
  let [sets, setSets] = useState([]);
  let [questions, setQuestions] = useState([]);
  let [type, setType] = useState("none");
  let [filter, setFilter] = useState([]);
  let [language, setLanguage] = useState("none");
  let [lowerDiff, setLowerDiff] = useState(1);
  let [upperDiff, setUpperDiff] = useState(10);
  let [currentSet, setCurrentSet] = useState("");
  let [currentQ, setCurrentQ] = useState("");
  let [showEditor, setShowEditor] = useState(false);
  let [loading, setLoading] = useState(true);
  let user = useContext(UserContext);

  useEffect(() => {
    versionCheck();
  }, []);

  useEffect(() => {
    setCurrentQ("");
    setCurrentSet("");
  }, [filter, type, language]);

  async function versionCheck() {
    let versionState = {};
    await version.check().then(version => (versionState = version));
    if (versionState.s === "load")
      await loadDB.sets().then(sets => setSets(sets));
    else setSets(JSON.parse(localStorage.getItem("sets")));
    if (versionState.q === "load")
      await loadDB.questions().then(questions => setQuestions(questions));
    else setQuestions(JSON.parse(localStorage.getItem("questions")));
    setLoading(false);
  }

  function checkFilter(set) {
    let cnt = 0;
    filter.forEach(f => {
      if (set.filter.includes(f)) cnt++;
    });
    if (type === "mc" && set.filter.includes("sa")) cnt += 100;
    if (type === "sa" && set.filter.includes("mc")) cnt += 100;
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
      <div className="sets">
        <div>Sets</div>
        {sets.map(s => {
          if (
            checkFilter(s) &&
            lowerDiff <= s.difficulty &&
            s.difficulty <= upperDiff &&
            (s.languages.includes(language) || language === "none")
          )
            return (
              <button key={s.name} onClick={() => setCurrentSet(s)}>
                {s.name}
              </button>
            );
        })}
      </div>
      <div>
        {currentSet !== "" && (
          <div>
            {currentSet.questions.map((q, i) => (
              <button
                key={q + i}
                onClick={() =>
                  setCurrentQ(questions[questions.map(q => q.name).indexOf(q)])
                }
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
      {showEditor && (
        <EditSets
          questions={questions}
          sets={sets}
          setSets={setSets}
          mode={"add"}
        />
      )}

      {currentQ !== "" && (
        <Popup
          close={() => setCurrentQ("")}
          contents={
            <div className={"center question-preview bg-2-" + user.theme}>
              <div className={"center p-container bg-1-" + user.theme}>
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
                      LANGUAGES.indexOf(language !== "none" ? language : "java")
                    ]
                  }
                />
                <p className="preview-id">{currentQ.name}</p>
              </div>
              <Question
                preview={true}
                id={currentQ.name}
                question={
                  currentQ.question[language !== "none" ? language : "java"]
                }
                language={language !== "none" ? language : "java"}
                type={currentQ.type}
                answer={
                  currentQ.type === "mc"
                    ? currentQ.answers[language !== "none" ? language : "java"]
                    : currentQ.placeholder[
                        language !== "none" ? language : "java"
                      ]
                }
              />
            </div>
          }
        />
      )}
    </div>
  );
}

function EditSets({ questions, sets, setSets, mode, categories }) {
  let [filter, setFilter] = useState([]);

  return (
    <div>
      <Filter newFilter={setFilter} filteredCategories={categories} />
    </div>
  );
}
