import React, { useEffect, useState, useContext } from "react";
import { db, firebase } from "../../../utils/firebase";
import QuestionEditor from "./questionEditor";
import Popup from "../../../main/components/popup";
import UserContext from "../../../utils/userContext";
import { loadDB, version } from "../../../libraries/loadDB";


const DEFAULT = [
  {
    question: { java: "a", python: "b", javascript: "c" },
    solution: { java: "a", python: "a", javascript: "a" },
    placeholder: { java: "a", python: "a", javascript: "a" },
    answers: {
      java: ["a", "a", "a", "a"],
      "java-length": 4,
      python: ["", "", ""],
      "python-length": 3,
      javascript: ["", ""],
      "javascript-length": 2
    },
    category: "array-1",
    difficulty: 1,
    id: 999,
    name: "testQuestion1",
    languages: ["java", "python", "javascript"],
    type: "sa"
  }
];

let newData = { q: "", c: "" };

export default function Questions() {
  let user = useContext(UserContext);
  let [sections, setSections] = useState([]);
  let [currentS, setCurrentS] = useState(-1);
  let [categories, setCategories] = useState([]);
  let [currentC, setCurrentC] = useState(-1);
  let [questions, setQuestions] = useState(DEFAULT);
  let [currentQ, setCurrentQ] = useState(-1);
  let [names, setNames] = useState([]);
  let [adding, setAdding] = useState(false);
  let [addID, setAddID] = useState(0);
  let [reloadQ, setReloadQ] = useState(undefined);
  let [editCat, setEditCat] = useState(false);

  useEffect(() => {
    versionCheck();
  }, []);

  useEffect(() => {
    let section = [];
    categories.forEach(c => {
      if (
        !section.includes(c.substring(0, c.indexOf("-"))) &&
        c !== "no category"
      )
        section.push(c.substring(0, c.indexOf("-")));
    });
    setSections(section);
  }, [categories]);

  async function addQ(newQuestion) {
    newData = { q: "", c: "" };
    await versionCheck();
    if (newData.q !== "" && newData.n.includes(newQuestion.name)) {
      setReloadQ(newQuestion);
    } else {
      db.collection("questions")
        .doc(newQuestion.name)
        .set(newQuestion);
      await db
        .collection("version")
        .doc("versionCheck")
        .update({ questions: firebase.firestore.FieldValue.increment(1) });
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
      setQuestions([...questions, newQuestion]);
      setNames([...names, newQuestion.name]);
      setAdding(false);
      localStorage.setItem(
        "all-questions",
        JSON.stringify([
          ...JSON.parse(localStorage.getItem("all-questions")),
          newQuestion
        ])
      );
      localStorage.setItem(
        "all-names",
        JSON.stringify([
          ...JSON.parse(localStorage.getItem("all-names")),
          newQuestion.name
        ])
      );
      setReloadQ(undefined);
      setAddID(addID + 1);
    }
  }

  async function editQ(question, oName) {
    newData = { q: "", c: "" };
    await versionCheck();
    let temp = [];
    let tempNames = [];
    if (newData.q !== "") {
      temp = [...newData.q.q];
      tempNames = [...names];
    } else {
      temp = [...questions];
      tempNames = [...names];
    }
    temp[currentQ] = { ...question };
    tempNames[currentQ] = question.name;
    await db
      .collection("version")
      .doc("versionCheck")
      .update({ questions: firebase.firestore.FieldValue.increment(1) });
    localStorage.setItem(
      "question-version",
      parseInt(localStorage.getItem("question-version"), 10) + 1
    );
    if (question.name !== oName) {
      db.collection("questions")
        .doc(oName)
        .delete();
    }
    db.collection("questions")
      .doc(question.name)
      .set(question);
    setQuestions(temp);
    setNames(tempNames);
    localStorage.setItem("all-questions", JSON.stringify(temp));
    localStorage.setItem("all-names", JSON.stringify(tempNames));
  }

  async function deleteQ(question) {
    setCurrentQ(-1);
    newData = { q: "", c: "" };
    await versionCheck();
    let temp = [];
    let tempNames = [];
    if (newData.q !== "") {
      temp = [...newData.q.q];
      tempNames = [...names];
    } else {
      temp = [...questions];
      tempNames = [...names];
    }
    temp = temp.filter(q => question.name !== q.name);
    tempNames = tempNames.filter(n => question.name !== n);
    await db
      .collection("version")
      .doc("versionCheck")
      .update({ questions: firebase.firestore.FieldValue.increment(1) });
    localStorage.setItem(
      "question-version",
      parseInt(localStorage.getItem("question-version"), 10) + 1
    );
    db.collection("questions")
      .doc(question.name)
      .delete();
    setQuestions(temp);
    setNames(tempNames);
    localStorage.setItem("all-questions", JSON.stringify(temp));
    localStorage.setItem("all-names", JSON.stringify(tempNames));
    setCurrentQ(-1);
  }

  async function versionCheck() {
    let versionState = "";
    await version.check().then(v => versionState = v);
    if (versionState.q === "load") loadQuestions();
    else localQuestions();
    if (versionState.c === "load") loadCategories();
    else localCategories();
  }

  async function loadQuestions() {
    await loadDB.questions().then(questions => { setQuestions(questions.q); setNames(questions.n) });
  }

  async function loadCategories() {
    await loadDB.categories().then(categories => setCategories(categories));
  }

  function localCategories() {
    let categories = JSON.parse(localStorage.getItem("categories"));
    if (categories === null) {
      loadCategories();
    } else {
      setCategories(categories);
    }
  }

  function localQuestions() {
    let names = JSON.parse(localStorage.getItem("all-names"));
    let questions = JSON.parse(localStorage.getItem("all-questions"));
    if (names === null || questions === null) {
      loadQuestions();
      loadCategories();
    } else {
      setNames(names);
      setQuestions(questions);
    }
  }

  return (
    <div className="questions">
      <div className={"q-sections bg-2-" + user.theme}>
        <div style={{ display: 'flex', flexDirection: "column" }} className="center">
          <p className={"center q-section-title bg-1-" + user.theme}>Sections</p>
        </div>
        <div className="section-btns">
          {sections.map((s, i) => (
            <button
              className={"btn-medium btn-" + user.theme + (i === currentS ? " btn-selected-" + user.theme : "")}
              key={s + i}
              onClick={() => {
                setCurrentS(currentS !== i ? i : -1);
                setCurrentC(-1);
                setCurrentQ(-1);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className={"q-categories bg-2-" + user.theme}>
        <div style={{ display: 'flex', flexDirection: "column" }} className="center">
          <p className={"center q-category-title bg-1-" + user.theme}>Categories</p>
          <button className={"edit-category btn-" + user.theme} onClick={() => setEditCat(true)}>Edit Categories</button>
        </div>
        <div className={"category-btns"}>
          {categories.map(
            (c, i) =>
              c.substring(0, c.indexOf("-")) === sections[currentS] && (
                <button
                  className={"btn-small btn-" + user.theme + (i === currentC ? " btn-selected-" + user.theme : "")}
                  onClick={() => {
                    setCurrentC(currentC === i ? -1 : i);
                    setCurrentQ(-1);
                  }}
                  key={c + i}
                >
                  {c}
                </button>
              )
          )}
        </div>
      </div>
      <div className={"q-questions bg-2-" + user.theme}>
        <div className="center" style={{ display: 'flex', flexDirection: "column" }}>
          <p className={"center q-question-title bg-1-" + user.theme}>Questions</p>
          <button className={"center add-question btn-" + user.theme} onClick={() => {
            setAdding(true);
            setCurrentQ(-1);
          }}>Add Question</button>
          {currentQ !== -1 && <button className={"center delete-question btn-" + user.theme} onClick={() => deleteQ(questions[currentQ])}>Delete Question</button>}
        </div>
        <div>
          {questions.map((q, i) => {
            return q.category === categories[currentC] ? (
              <button
                className={"btn-small btn-" + user.theme + (i === currentQ ? " btn-selected-" + user.theme : "")}
                key={q.name + i}
                onClick={() => {
                  setCurrentQ(currentQ !== i ? i : -1);
                  setAdding(false);
                }}
              >
                {q.name}
              </button>
            ) : (
                undefined
              );
          })}
        </div>
      </div>
      {currentQ !== -1 && (
        <QuestionEditor
          key={questions[currentQ].name + "edit"}
          update={editQ}
          mode={"update"}
          names={names}
          categories={categories}
          editQuestion={questions[currentQ]}
        />
      )}
      {adding && (
        <QuestionEditor
          key={addID}
          update={addQ}
          names={names}
          mode={"add"}
          categories={categories}
          editQuestion={reloadQ}
        />
      )}
      {editCat && (
        <Popup
          closePopup={setEditCat}
          contents={
            <EditCategories
              categories={categories}
              setCategories={setCategories}
              versionCheck={versionCheck}
              questions={questions}
              setQuestions={setQuestions}
              user={user}
            />
          }
        />
      )}
    </div>
  );
}

export function EditCategories({
  categories,
  setCategories,
  versionCheck,
  questions,
  setQuestions,
  user
}) {
  let [sections, setSections] = useState([]);
  let [currentS, setCurrentS] = useState(-1);
  let [currentC, setCurrentC] = useState(-1);
  let [cats, setCats] = useState(categories);
  let [qs, setQs] = useState(questions);
  let [addState, setAddState] = useState(0);
  let [addCat, setAddCat] = useState("");
  let [addCatNum, setAddCatNum] = useState("");
  let [editState, setEditState] = useState(0);
  let [editCat, setEditCat] = useState("");
  let [editCatNum, setEditCatNum] = useState("");
  let [deleteState, setDeleteState] = useState(0);
  let [newName, setNewName] = useState("");
  let [newNumber, setNewNumber] = useState("");
  let [newC, setNewC] = useState(-1);
  let [newCat, setNewCat] = useState("no category");
  let [newCatCheck, setNewCatCheck] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let section = [];
    cats.forEach(c => {
      if (
        !section.includes(c.substring(0, c.indexOf("-"))) &&
        c !== "no category"
      )
        section.push(c.substring(0, c.indexOf("-")));
    });
    setSections(section.sort());
  }, [cats]);

  async function addC(category) {
    newData = { q: "", c: "" };
    await versionCheck();
    if (newData.c === "" || (newData.c !== "" && !newData.c.includes(category)))
      await db
        .collection("fields")
        .doc("category")
        .update({
          categories: firebase.firestore.FieldValue.arrayUnion(category)
        });
    await db
      .collection("version")
      .doc("versionCheck")
      .update({
        questions: firebase.firestore.FieldValue.increment(1),
        categories: firebase.firestore.FieldValue.increment(1)
      });
    localStorage.setItem(
      "category-version",
      parseInt(localStorage.getItem("category-version"), 10) + 1
    );
    let tempC = [];
    if (newData.c === "") {
      tempC = [...cats, category].sort();
    } else {
      tempC = [...newData.c, category].sort();
    }
    setCategories(tempC);
    setCats(tempC);
    localStorage.setItem("categories", JSON.stringify(tempC));
  }
  async function editC(category, oCat) {
    newData = { q: "", c: "" };
    await versionCheck();
    console.log(1);
    console.log(newData);
    if (newData.c === "" || (newData.c !== "" && newData.c.includes(oCat))) {
      console.log(2);
      let tempQ = [];
      let updateQ = [];
      if (newData.q === "") {
        tempQ = [...qs];
      } else {
        tempQ = [...newData.q.q];
      }
      tempQ = tempQ.map(q => {
        if (q.category === oCat) {
          updateQ.push({ ...q, category: category });
          return { ...q, category: category };
        } else {
          return { ...q };
        }
      });
      let tempC = [];
      if (newData.c === "") {
        tempC = [...cats];
      } else {
        tempC = [...newData.c];
      }
      tempC = tempC.map(c => {
        if (c === oCat) return category;
        else return c;
      });
      await db
        .collection("fields")
        .doc("category")
        .set({ categories: tempC });
      let batch = db.batch();
      updateQ.forEach(q => {
        batch.update(db.collection("questions").doc(q.name), q);
      });
      batch.commit();
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          questions: firebase.firestore.FieldValue.increment(1),
          categories: firebase.firestore.FieldValue.increment(1)
        });
      setQs(tempQ);
      setQuestions(tempQ);
      setCats(tempC);
      setCategories(tempC);
      localStorage.setItem("all-questions", JSON.stringify(tempQ));
      localStorage.setItem("categories", JSON.stringify(tempC));
      localStorage.setItem(
        "category-version",
        parseInt(localStorage.getItem("category-version"), 10) + 1
      );
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
    } else {
      setCats(newData.c);
      setCategories(newData.c);
      localStorage.setItem("categories", JSON.stringify(newData.c));
      if (newData.q !== "") {
        setQs(newData.q.q);
        setQuestions(newData.q.q);
        localStorage.setItem("all-questions", JSON.stringify(newData.q.q));
      }
      setCurrentC(-1);
      setErrorMessage(
        "Error: The category you are trying to edit no longer exists or was changed to something else."
      );
    }
  }

  async function deleteC(category, newCat) {
    newData = { q: "", c: "" };
    await versionCheck();
    if (newData.c === "" || (newData.c !== "" && newData.c.includes(category))) {
      await db
        .collection("fields")
        .doc("category")
        .update({
          categories: firebase.firestore.FieldValue.arrayRemove(category)
        });
      let tempC = [];
      if (newData.c !== "") {
        tempC = [...newData.c];
      } else {
        tempC = [...cats];
      }
      tempC = tempC.filter(c => c !== category);
      if (!tempC.includes(newCat)) {
        await db
          .collection("fields")
          .doc("category")
          .update({
            categories: firebase.firestore.FieldValue.arrayUnion(newCat)
          });
        tempC = [...tempC, newCat];
      }
      let tempQ = [];
      let updatedQ = [];
      if (newData.q.q !== "") {
        tempQ = [...newData.q.q];
      } else {
        tempQ = [...qs];
      }
      tempQ = tempQ.map(q => {
        if (q.category === category) {
          updatedQ.push({ ...q, category: newCat });
          return { ...q, category: newCat };
        } else {
          return { ...q };
        }
      });
      let batch = db.batch();
      updatedQ.forEach(q => {
        batch.update(db.collection("questions").doc(q.name), q);
      });
      batch.commit();
      await db
        .collection("version")
        .doc("versionCheck")
        .update({
          questions: firebase.firestore.FieldValue.increment(1),
          categories: firebase.firestore.FieldValue.increment(1)
        });
      setQs(tempQ);
      setQuestions(tempQ);
      setCats(tempC);
      setCategories(tempC);
      localStorage.setItem("all-questions", JSON.stringify(tempQ));
      localStorage.setItem("categories", JSON.stringify(tempC));
      localStorage.setItem(
        "category-version",
        parseInt(localStorage.getItem("category-version"), 10) + 1
      );
      localStorage.setItem(
        "question-version",
        parseInt(localStorage.getItem("question-version"), 10) + 1
      );
    } else {
      setCats(newData.c);
      setCategories(newData.c);
      localStorage.setItem("categories", JSON.stringify(newData.c));
      if (newData.q.q !== "") {
        setQs(newData.q.q);
        setQuestions(newData.q.q);
        localStorage.setItem("all-questions", JSON.stringify(newData.q.q));
      }
      setCurrentC(-1);
      setErrorMessage(
        "Error: The category you are trying to delete no longer exists or was changed to something else."
      );
    }
  }
  return (
    <div className="center c-editor">
      <div className={"center c-title bg-1-" + user.theme}>
        <p>Category Editor</p>
      </div>
      <div className="c-container">
        <div className={"c-list-sections bg-2-" + user.theme}>
          <p style={{ alignSelf: 'center' }}>Section</p>
          {sections.map((s, i) => (
            <button key={"section:" + s} className={"btn-xsmall bg-3-" + user.theme + (i === currentS ? " btn-selected-" + user.theme : "")} onClick={() => setCurrentS(i)}>
              {s}
            </button>
          ))}
        </div>
        <div className={"c-list-categories bg-2-" + user.theme}>
          <p style={{ alignSelf: 'center' }}>Category</p>
          {categories.map((c, i) => {
            return sections[currentS] === c.substring(0, c.indexOf("-")) ? (
              <button
                className={"btn-xsmall bg-3-" + user.theme + (i === currentC ? " btn-selected-" + user.theme : "")}
                key={c + i}
                onClick={() => {
                  deleteState === 0
                    ? setCurrentC(i)
                    : deleteState === 2
                      ? setNewC(i === currentC ? newC : i)
                      : setNewC(newC);
                }}
              >
                {c}
              </button>
            ) : (
                undefined
              );
          })}
        </div>
        <div className={"c-actions bg-2-" + user.theme}>
          <div className={"center action-add bg-1-" + user.theme}>
            <p className={"center c-subtitle"}>Add Category</p>
            {cats.includes(addCat + "-" + addCatNum) && (
              <p>Category Already Exists!</p>
            )}
            {addState === 1 && <p>Invalid Category</p>}
            {(addCat.length > 0 || addCatNum.length > 0) && (
              <p>
                Preview: {addCat.length > 0 ? addCat : "_____"}-
                {addCatNum.length > 0 ? addCatNum : "_____"}
              </p>
            )}
            <div className="center add-input">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  className="inp-2"
                  placeholder="name (letters only)"
                  value={addCat}
                  onChange={ev => {
                    setAddCat(
                      /[^a-z]/i.test(ev.target.value) ? addCat : ev.target.value
                    );
                    if (
                      sections.includes(ev.target.value.toLocaleLowerCase())
                    ) {
                      setCurrentS(
                        sections.indexOf(ev.target.value.toLocaleLowerCase())
                      );
                    }
                  }}
                />
                <input
                  className="inp-2"
                  placeholder="number"
                  value={addCatNum}
                  onChange={ev =>
                    setAddCatNum(
                      !isNaN(ev.target.value) ? ev.target.value : addCatNum
                    )
                  }
                />
              </div>
              <button
                className={"btn-small bg-3-" + user.theme}
                onClick={() => {
                  if (
                    !cats.includes(addCat + "-" + addCatNum) &&
                    addCat.length !== 0 &&
                    addCatNum.length !== 0
                  ) {
                    addC((addCat + "-" + addCatNum).toLocaleLowerCase());
                    setAddState(0);
                    setAddCatNum("");
                  } else {
                    setAddState(1);
                  }
                }}
              >
                add
              </button>
            </div>
          </div>
          {currentC !== -1 && (
            <div className={"center action-edit bg-1-" + user.theme}>
              <p className="c-subtitle">Edit {cats[currentC]}</p>
              {editState === -1 &&
                (editCat.length === 0 || editCatNum.length === 0) && (
                  <p>Invalid Category</p>
                )}
              {(editCat.length !== 0 || editCatNum.length !== 0) && (
                <p>
                  Preview: {editCat.length === 0 ? "_____" : editCat}-
                  {editCatNum.length === 0 ? "_____" : editCatNum}
                </p>
              )}
              {editState === 1 && (
                <p>
                  Editing {cats[currentC]} to {editCat + "-" + editCatNum}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  className="inp-2"
                  placeholder="name (letters only)"
                  value={editCat}
                  onChange={ev => {
                    setEditCat(
                      /[^a-z]/i.test(ev.target.value)
                        ? editCat
                        : ev.target.value
                    );
                    if (
                      sections.includes(ev.target.value.toLocaleLowerCase())
                    ) {
                      setCurrentS(
                        sections.indexOf(ev.target.value.toLocaleLowerCase())
                      );
                    }
                  }}
                />
                <input
                  className="inp-2"
                  placeholder="number"
                  value={editCatNum}
                  onChange={ev =>
                    setEditCatNum(
                      !isNaN(ev.target.value) ? ev.target.value : addCatNum
                    )
                  }
                />

                <button
                  className={"btn-small bg-3-" + user.theme}
                  onClick={() => {
                    if (editCat.length === 0 || editCatNum.length === 0) {
                      setEditState(-1);
                    } else if (
                      editCat.length !== 0 &&
                      editCatNum.length !== 0 &&
                      editState !== 1
                    ) {
                      setEditState(1);
                    } else {
                      editC(
                        (editCat + "-" + editCatNum).toLocaleLowerCase(),
                        cats[currentC]
                      );
                      setEditState(0);
                      setEditCat("");
                      setEditCatNum("");
                    }
                  }}
                >
                  {editState === 1 ? "confirm" : "edit"}
                </button>
                {editState === 1 && (
                  <button className={"btn-small bg-3-" + user.theme} onClick={() => setEditState(0)}>cancel</button>
                )}
              </div>
            </div>
          )}
          {currentC !== -1 && (
            <div
              style={{ display: "flex", flexDirection: "column" }}
              className={"center action-delete bg-1-" + user.theme}
            >
              <p className="c-subtitle">Delete {cats[currentC]}</p>
              <div>
                {deleteState === 0 && (
                  <button className={"btn-small bg-3-" + user.theme} onClick={() => setDeleteState(1)}>delete</button>
                )}
                {deleteState === 1 && (
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                  >
                    <p>Assign to another category for affected questions?</p>
                    <div className="center">
                      <button className={"btn-small bg-3-" + user.theme} onClick={() => setDeleteState(2)}>yes</button>
                      <button className={"btn-small bg-3-" + user.theme} onClick={() => setDeleteState(3)}>no</button>
                    </div>
                  </div>
                )}
                {deleteState === 2 && (
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                  >
                    <div
                      style={{ display: "flex", flexDirection: "column" }}
                      className="center"
                    >
                      <p>Select an existing category</p>
                      {newC !== -1 && <p>Selected: {cats[newC]}</p>}
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => {
                          setDeleteState(3);
                          setNewCat(cats[newC]);
                          setNewC(-1);
                        }}
                      >
                        Assign Existing
                      </button>
                    </div>
                    <p> or </p>
                    <div
                      className="center"
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <p>Assign to new category</p>
                      {newCatCheck &&
                        (newName.length === 0 || newNumber.length === 0) && (
                          <p>Invalid Category</p>
                        )}
                      {(newName.length > 0 || newNumber.length > 0) && (
                        <p>
                          Preview: {newName.length > 0 ? newName : "_____"}-
                          {newNumber.length > 0 ? newNumber : "_____"}
                        </p>
                      )}
                      {cats.includes(newName + "-" + newNumber) && (
                        <p>Category Exists! Please select instead</p>
                      )}
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <input
                          className="inp-2"
                          placeholder="name (letters only)"
                          value={newName}
                          onChange={ev => {
                            setNewName(
                              /[^a-z]/i.test(ev.target.value)
                                ? newName
                                : ev.target.value
                            );
                            if (
                              sections.includes(
                                ev.target.value.toLocaleLowerCase()
                              )
                            ) {
                              setCurrentS(
                                sections.indexOf(
                                  ev.target.value.toLocaleLowerCase()
                                )
                              );
                            }
                          }}
                        />
                        <input
                          className="inp-2"
                          placeholder="number"
                          value={newNumber}
                          onChange={ev =>
                            setNewNumber(
                              !isNaN(ev.target.value)
                                ? ev.target.value
                                : newNumber
                            )
                          }
                        />
                        <button
                          className={"btn-small bg-3-" + user.theme}
                          onClick={() => {
                            if (
                              newName.length > 0 &&
                              newNumber.length > 0 &&
                              !cats.includes(newName + " " + newNumber)
                            ) {
                              setDeleteState(3);
                              setNewCat(newName + "-" + newNumber);
                              setNewName("");
                              setNewNumber("");
                              setNewCatCheck(false);
                            } else {
                              setNewCatCheck(true);
                            }
                          }}
                        >
                          Assign New
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {deleteState === 3 && (
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                  >
                    <p>
                      Deleting {cats[currentC]} and assigning questions to{" "}
                      {newCat}
                    </p>
                    <div>
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => {
                          setDeleteState(0);
                          deleteC(cats[currentC], newCat);
                          setNewCat("no category");
                          setCurrentC(-1);
                        }}
                      >
                        confirm
                      </button>
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => {
                          setDeleteState(0);
                          setNewCat("no category");
                          setNewName("");
                          setNewNumber("");
                        }}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {errorMessage !== "" && (
            <div
              className={"center action-error-message bg-1-" + user.theme}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <p>{errorMessage}</p>
              <button className={"btn-small bg-3-" + user.theme} onClick={() => setErrorMessage("")}>ok</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
