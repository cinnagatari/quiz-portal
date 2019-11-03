import React, { useEffect, useState, useContext } from "react";
import { db, firebase } from "../../../utils/firebase";
import QuestionEditor from "./questionEditor";
import Popup from "../../../main/components/popup";
import UserContext from "../../../utils/userContext";
import { loadDB, version, category, question } from "../../../libraries/loadDB";

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
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    versionCheck();
  }, []);

  useEffect(() => {
    setNames(questions.map(q => q.name));
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
    await question.add(newQuestion).then(newQuestions => {
      if (newQuestions.error !== undefined) {
        setErrorMessage(newQuestions.error);
        setReloadQ(newQuestion);
      } else {
        setAdding(false);
        setAddID(addID + 1);
      }
      setQuestions(newQuestions.q);
      setCategories(newQuestions.c);
    });
  }

  async function editQ(newQuestion, original) {
    await question.edit(newQuestion, original).then(newQuestions => {
      console.log(newQuestions);
      if (newQuestions.error !== undefined) setErrorMessage(newQuestions.error);
      setQuestions(newQuestions.q);
      setCategories(newQuestions.c);
    });
  }

  async function deleteQ(original) {
    await question.delete(original).then(newQuestions => {
      if (newQuestions.error !== undefined) setErrorMessage(newQuestions.error);
      setQuestions(newQuestions.q);
      setCategories(newQuestions.c);
      setCurrentQ(-1);
    });
  }

  async function versionCheck() {
    let versionState = "";
    await version.check().then(v => (versionState = v));
    if (versionState.q === "load") loadQuestions();
    else localQuestions();
    if (versionState.c === "load") loadCategories();
    else localCategories();
  }

  async function loadQuestions() {
    await loadDB.questions().then(questions => {
      setQuestions(questions);
    });
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
    let names = JSON.parse(localStorage.getItem("questionNames"));
    let questions = JSON.parse(localStorage.getItem("questions"));
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
        <div
          style={{ display: "flex", flexDirection: "column" }}
          className="center"
        >
          <p className={"center q-section-title bg-1-" + user.theme}>
            Sections
          </p>
        </div>
        <div className="section-btns">
          {sections.map((s, i) => (
            <button
              className={
                "btn-medium btn-" +
                user.theme +
                (i === currentS ? " btn-selected-" + user.theme : "")
              }
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
        <div
          style={{ display: "flex", flexDirection: "column" }}
          className="center"
        >
          <p className={"center q-category-title bg-1-" + user.theme}>
            Categories
          </p>
          <button
            className={"edit-category btn-" + user.theme}
            onClick={() => setEditCat(true)}
          >
            Edit Categories
          </button>
        </div>
        <div className={"category-btns"}>
          {categories.map(
            (c, i) =>
              c.substring(0, c.indexOf("-")) === sections[currentS] && (
                <button
                  className={
                    "btn-small btn-" +
                    user.theme +
                    (i === currentC ? " btn-selected-" + user.theme : "")
                  }
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
        <div
          className="center"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <p className={"center q-question-title bg-1-" + user.theme}>
            Questions
          </p>
          <button
            className={"center add-question btn-" + user.theme}
            onClick={() => {
              setAdding(true);
              setCurrentQ(-1);
            }}
          >
            Add Question
          </button>
          {currentQ !== -1 && (
            <button
              className={"center delete-question btn-" + user.theme}
              onClick={() => deleteQ(questions[currentQ])}
            >
              Delete Question
            </button>
          )}
        </div>
        <div>
          {questions.map((q, i) => {
            return q.category === categories[currentC] ? (
              <button
                className={
                  "btn-small btn-" +
                  user.theme +
                  (i === currentQ ? " btn-selected-" + user.theme : "")
                }
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
          close={() => setEditCat(false)}
          contents={
            <EditCategories
              sections={sections}
              categories={categories}
              setCategories={setCategories}
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
  sections,
  categories,
  setCategories,
  setQuestions,
  user
}) {
  let [currentS, setCurrentS] = useState(-1);
  let [currentC, setCurrentC] = useState(-1);
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

  async function addC(newCategory) {
    await category.add(newCategory).then(newCategories => {
      if (newCategories.error !== undefined)
        setErrorMessage(newCategories.error);
      setCategories(newCategories.c);
    });
  }

  async function editC(newCategory, original) {
    await category.edit(newCategory, original).then(newCategories => {
      if (newCategories.error !== undefined)
        setErrorMessage(newCategories.error);
      setCategories(newCategories.c);
      setQuestions(newCategories.q);
    });
  }

  async function deleteC(original, newCategory) {
    await category.delete(original, newCategory).then(newCategories => {
      if (newCategories.error !== undefined)
        setErrorMessage(newCategories.error);
      setCategories(newCategories.c);
      setQuestions(newCategories.q);
    });
  }

  return (
    <div className="center c-editor">
      <div className={"center c-title bg-1-" + user.theme}>
        <p>Category Editor</p>
      </div>
      <div className="c-container">
        <div className={"c-list-sections bg-2-" + user.theme}>
          <p style={{ alignSelf: "center" }}>Section</p>
          {sections.map((s, i) => (
            <button
              key={"section:" + s}
              className={
                "btn-xsmall bg-3-" +
                user.theme +
                (i === currentS ? " btn-selected-" + user.theme : "")
              }
              onClick={() => setCurrentS(i)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className={"c-list-categories bg-2-" + user.theme}>
          <p style={{ alignSelf: "center" }}>Category</p>
          {categories.map((c, i) => {
            return sections[currentS] === c.substring(0, c.indexOf("-")) ? (
              <button
                className={
                  "btn-xsmall bg-3-" +
                  user.theme +
                  (i === currentC ? " btn-selected-" + user.theme : "")
                }
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
            {categories.includes(addCat + "-" + addCatNum) && (
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
                    !categories.includes(addCat + "-" + addCatNum) &&
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
              <p className="c-subtitle">Edit {categories[currentC]}</p>
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
                  Editing {categories[currentC]} to {editCat + "-" + editCatNum}
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
                        categories[currentC]
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
                  <button
                    className={"btn-small bg-3-" + user.theme}
                    onClick={() => setEditState(0)}
                  >
                    cancel
                  </button>
                )}
              </div>
            </div>
          )}
          {currentC !== -1 && (
            <div
              style={{ display: "flex", flexDirection: "column" }}
              className={"center action-delete bg-1-" + user.theme}
            >
              <p className="c-subtitle">Delete {categories[currentC]}</p>
              <div>
                {deleteState === 0 && (
                  <button
                    className={"btn-small bg-3-" + user.theme}
                    onClick={() => setDeleteState(1)}
                  >
                    delete
                  </button>
                )}
                {deleteState === 1 && (
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="center"
                  >
                    <p>Assign to another category for affected questions?</p>
                    <div className="center">
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => setDeleteState(2)}
                      >
                        yes
                      </button>
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => setDeleteState(3)}
                      >
                        no
                      </button>
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
                      {newC !== -1 && <p>Selected: {categories[newC]}</p>}
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => {
                          setDeleteState(3);
                          setNewCat(categories[newC]);
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
                      {categories.includes(newName + "-" + newNumber) && (
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
                              !categories.includes(newName + " " + newNumber)
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
                      Deleting {categories[currentC]} and assigning questions to{" "}
                      {newCat}
                    </p>
                    <div>
                      <button
                        className={"btn-small bg-3-" + user.theme}
                        onClick={() => {
                          setDeleteState(0);
                          deleteC(categories[currentC], newCat);
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
              <button
                className={"btn-small bg-3-" + user.theme}
                onClick={() => setErrorMessage("")}
              >
                ok
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
