import React, { useState, useEffect, useContext } from "react";
import { db } from "../../../utils/firebase";
import { version, loadDB, sets, question } from "../../../libraries/loadDB";
import Popup from "../../../main/components/popup";
import Question from "../../quiz/components/question";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faJava, faPython, faJs } from '@fortawesome/free-brands-svg-icons'
import UserContext from "../../../utils/userContext";
import Filter from "../../../libraries/filter";

const LANGUAGES = ["java", "python", "javascript"];
const ICONS = [faJava, faPython, faJs];

const TYPES = [
  "mc",
  "sa"
]

const DIFFICULTY = new Array(10).fill(0).map((v, i) => i + 1);

export default function QuestionSets() {
  let [sets, setSets] = useState([]);
  let [questions, setQuestions] = useState([]);
  let [sections, setSections] = useState([]);
  let [currentS, setCurrentS] = useState(-1);
  let [categories, setCategories] = useState([]);
  let [selectedCategories, setSelectedCategories] = useState([]);
  let [type, setType] = useState("none");
  let [filter, setFilter] = useState([]);
  let [lowerDiff, setLowerDiff] = useState(1);
  let [upperDiff, setUpperDiff] = useState(10);
  let [currentSet, setCurrentSet] = useState("");
  let [currentQ, setCurrentQ] = useState("");
  let [showEditor, setShowEditor] = useState(false);
  let user = useContext(UserContext);

  useEffect(() => {
    versionCheck();
  }, [])

  async function versionCheck() {
    let versionState = {};
    await version.check().then(version => versionState = version);
    if (versionState.s === "load") await loadDB.sets().then(sets => setSets(sets));
    else setSets(JSON.parse(localStorage.getItem("sets")));
    if (versionState.q === "load") await loadDB.questions().then(questions => setQuestions(questions));
    else setQuestions(JSON.parse(localStorage.getItem("questions")));
  }

  useEffect(() => {
    if (questions.length !== 0) {
      let sections = [];
      let categories = [];
      questions.forEach(q => {
        if (!categories.includes(q.category))
          categories.push(q.category)
      });
      categories.forEach(c => {
        if (!sections.includes(c.substring(0, c.indexOf("-"))))
          sections.push(c.substring(0, c.indexOf("-")));
      })
      setSections(sections);
      setCategories(categories);
    }
  }, [questions])

  function checkFilter(set) {
    let cnt = 0;
    filter.forEach(f => {
      if (set.filter.includes(f)) cnt++;
    })
    if ((type === "mc" && set.filter.includes("sa"))) cnt += 100;
    if ((type === "sa" && set.filter.includes("mc"))) cnt += 100;
    return cnt === filter.length;
  }

  return (
    <div className="set-editor">
      <div>
        <Filter newFilter={setFilter} newType={setType}/>
      </div>
      <div className="sets">
        <div>Sets</div>
        {sets.map(s => {
          if (checkFilter(s) && lowerDiff <= s.difficulty && s.difficulty <= upperDiff) return <button key={s.name} onClick={() => setCurrentSet(s)}>{s.name}</button>
        })}
      </div>
      <div>
        {currentSet !== "" &&
          <div>
            {currentSet.questions.map((q, i) => <button key={q + i} onClick={() => setCurrentQ(questions[questions.map(q => q.name).indexOf(q)])}>{q}</button>)}
          </div>
        }
      </div>
      {showEditor && <EditSets questions={questions} sets={sets} setSets={setSets} mode={"add"} categories={categories} />}

      {currentQ !== "" && <Popup
        close={() => setCurrentQ("")}
        contents={
          <div className={"center question-preview bg-2-" + user.theme}>
            <div className={"center p-container bg-1-" + user.theme}>
              <p className="preview-title">Preview</p>
              <FontAwesomeIcon style={{
                height: '30px',
                width: '30px',
                margin: '5px'
              }} className="icon" icon={ICONS[LANGUAGES.indexOf("java")]} />
              <p className="preview-id">{currentQ.name}</p>
            </div>
            <Question
              preview={true}
              id={currentQ.name}
              question={currentQ.question.java}
              language={"java"}
              type={currentQ.type}
              answer={currentQ.type === "mc" ? currentQ.answers.java : currentQ.placeholder.java}
            />
          </div>
        }
      />
      }
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
