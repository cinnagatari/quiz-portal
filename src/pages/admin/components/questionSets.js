import React, { useState, useEffect } from "react";
import { db } from "../../../utils/firebase";
import { version, loadDB, sets, question } from "../../../libraries/loadDB";
import Popup from "../../../main/components/popup";
import Question from "../../quiz/components/question";

const LANGUAGES = [
  "java",
  "python",
  "javascript"
]

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
  let [showPopup, setShowpopup] = useState(true);

  useEffect(() => {
    versionCheck();
  }, [])

  async function versionCheck() {
    let versionState = {};
    await version.sets().then(version => versionState = version);
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

  function updateFilter(value) {
    setFilter(filter.includes(value) ? filter.filter(f => f !== value) : [...filter, value]);
  }

  function checkFilter(set) {
    let cnt = 0;
    filter.forEach(f => {
      if (set.filter.includes(f)) cnt++;
    })
    if ((type === "mc" && set.filter.includes("sa"))) cnt += 100;
    if ((type === "sa" && set.filter.includes("mc"))) cnt += 100;
    return cnt === filter.length;
  }
  console.log(questions);
  console.log(currentSet);
  console.log(questions.length !== 0 ? questions[questions.map(q => q.name).indexOf("lengthZero")] : "");
  console.log(currentQ);
  return (
    <div className="set-editor">
      <div>
        <div>Filter</div>
        {filter}
        <div>
          <p>Languages</p>
          {LANGUAGES.map(l => <button onClick={() => updateFilter(l)}>{l}</button>)}
        </div>
        <div>
          <p>Sections</p>
          {sections.map((s, i) => <button onClick={() => setCurrentS(i)}>{s}</button>)}
        </div>
        <div>
          <p>Categories</p>
          {categories.map(c => {
            if (sections[currentS] === c.substring(0, c.indexOf("-"))) {
              return (<button onClick={() => {
                updateFilter(c);
                setSelectedCategories([...selectedCategories, c]);
              }}>{c}</button>);
            }
          })}
          <p>Selected Categories</p>
          {selectedCategories.map(c => <button onClick={() => {
            updateFilter(c);
            setSelectedCategories(selectedCategories.filter(s => s !== c));
          }}>{c}</button>)}
        </div>
        <div>
          <p>Type</p>
          {TYPES.map(t => <button onClick={() => setType(type !== t ? t : "none")}>{t}</button>)}
        </div>
        <div>
          <p>Difficulty</p>
          <p>Select Range</p>
          <select key={'lower'} value={lowerDiff} onChange={ev => setLowerDiff(parseInt(ev.target.value), 10)}>
            {DIFFICULTY.map(d => <option value={d}>{d}</option>)}
          </select>
          <select key={'upper'} value={upperDiff} onChange={ev => setUpperDiff(parseInt(ev.target.value), 10)}>
            {new Array(DIFFICULTY.length + 1 - lowerDiff).fill(0).map((d, i) => lowerDiff + i).map((d, i) => <option value={d}>{d}</option>)}
          </select>
        </div>
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
      {currentQ !== "" && <Popup
        close={() => setCurrentQ("")}
        contents={<Question
          preview={true}
          id={currentQ.name}
          question={currentQ.question.java}
          language={"java"}
          type={currentQ.type}
          answer={currentQ.type === "mc" ? currentQ.answers.java : currentQ.placeholder.java}
        />}
      />
      }
    </div>
  );
}
