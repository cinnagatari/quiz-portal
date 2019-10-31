import React, { useState, useEffect, useContext } from "react";
import { db } from "../../utils/firebase";
import moment from "moment";
import Answers from "./components/answers";
import Question from "./components/question";
import { Link } from "react-router-dom";
import UserContext from "../../utils/userContext";

export default function Quiz({ match }) {
  let [loading, setLoading] = useState(true);
  let [questions, setQuestions] = useState([
    {
      question: "",
      answer: "",
      answers: { a: [], att: [] },
      result: 0,
      attempts: 0
    }
  ]);
  let [expire, setExpire] = useState("");
  let [current, setCurrent] = useState(0);
  let [currentA, setCurrentA] = useState([0]);
  let [completed, setCompleted] = useState(0);
  let user = useContext(UserContext);

  useEffect(() => {
    async function loadSet() {
      let qIDs = [];
      let expire = {};
      let ss = await db.collection("questionSets").get();
      ss.docs.forEach(s => {
        if (s.data().set === match.params.set) {
          qIDs = s.data().questions;
          expire = s.data().expire;
        }
      });
      let quiz = [];
      ss = await db.collection("questionPool").get();
      ss.docs.forEach(q => {
        if (qIDs.includes(q.data().id)) {
          if (q.data().type === "mc") {
            quiz.push({
              question: q.data().question,
              type: "mc",
              answers: q.data().answers
            });
          } else {
            quiz.push({
              question: q.data().question,
              type: "sa",
              answers: q.data().answers
            });
          }
        }
      });
      loadQuiz(quiz);
      setExpire(
        moment()
          .add(expire.time, expire.type)
          .format("LLL")
      );
      setLoading(false);
    }
    if (
      !moment(
        localStorage.getItem(user.user + "-" + match.params.set + "expire"),
        "LLL",
        true
      ).isAfter()
    )
      clearStorage();
    if (
      localStorage.getItem(user.user + "-" + match.params.set + "expire") ===
      null
    ) {
      loadSet();
    } else {
      loadStorage();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (completed !== 0) setStorage();
  }, [completed]);

  function loadQuiz(quiz) {
    let questions = [];
    let randQuiz = randomize(quiz);
    randQuiz.forEach(q => {
      if (q.type === "mc") {
        questions.push({
          question: q.question,
          answer: q.answers[0],
          answers: {
            a: randomize(q.answers),
            att: new Array(q.answers.length).fill(false)
          },
          result: 0,
          attempts: 0
        });
      } else {
        questions.push({
          question: q.question,
          answer: "fr",
          answers: q.answers,
          result: 0,
          attempts: 0
        });
      }
    });
    setQuestions(questions);
    setCurrentA(new Array(questions.length).fill(-1));
  }

  function randomize(ar) {
    for (let i = 0; i < 1000; i++) {
      let one = Math.floor(Math.random() * ar.length);
      let two = Math.floor(Math.random() * ar.length);
      let temp = ar[one];
      ar[one] = ar[two];
      ar[two] = temp;
    }
    return ar;
  }

  function currentAnswer(index) {
    let temp = [...currentA];
    temp[current] = index;
    setCurrentA(temp);
  }

  function checkAnswer(index) {
    let tempQuestions = [...questions];
    if (questions[current].answer === "fr") {
      tempQuestions[current].result = 1;
      setCompleted(completed + 1);
    } else if (
      questions[current].answers.a[index] === questions[current].answer
    ) {
      tempQuestions[current].answers.att[index] = true;
      tempQuestions[current].result = 1;
      setCompleted(completed + 1);
    } else {
      tempQuestions[current].answers.att[index] = true;
      tempQuestions[current].result = -1;
      setCompleted(completed + 1);
    }
    setQuestions(tempQuestions);
  }

  function submitQuiz() {
    db.collection("submissions").add({
      username: user.user,
      questions: questions,
      time: moment().format("LLL")
    });
    clearStorage();
  }

  function loadStorage() {
    setExpire(
      localStorage.getItem(user.user + "-" + match.params.set + "expire")
    );
    setQuestions(
      JSON.parse(localStorage.getItem(user.user + "-" + match.params.set))
    );
    setCurrentA(
      JSON.parse(
        localStorage.getItem(user.user + "-" + match.params.set + "current")
      )
    );
    setCompleted(
      parseInt(
        user.user + "-" + localStorage.getItem(match.params.set + "completed"),
        10
      )
    );
  }

  function clearStorage() {
    localStorage.removeItem(user.user + "-" + match.params.set + "expire");
    localStorage.removeItem(user.user + "-" + match.params.set);
    localStorage.removeItem(user.user + "-" + match.params.set + "current");
    localStorage.removeItem(user.user + "-" + match.params.set + "completed");
  }

  function setStorage() {
    localStorage.setItem(user.user + "-" + match.params.set + "expire", expire);
    localStorage.setItem(
      user.user + "-" + match.params.set,
      JSON.stringify(questions)
    );
    localStorage.setItem(
      user.user + "-" + match.params.set + "current",
      JSON.stringify(currentA)
    );
    localStorage.setItem(
      user.user + "-" + match.params.set + "completed",
      completed
    );
  }

  function onChange(newValue) {
    let tempQuestions = [...questions];
    tempQuestions[current].answers = newValue;
    setQuestions(tempQuestions);
  }

  return (
    <div>
      {loading && <div>{"" + loading}</div>}
      {!loading && (
        <div className="quiz">
          <div className="questionList">
            {questions.map((q, i) => {
              let backgroundColor = q.result !== 0 ? "#adcbe3" : "";
              return (
                <button
                  key={q.question + i}
                  style={{ backgroundColor }}
                  className={
                    i === current ? "questionNumber btnAnim" : "questionNumber"
                  }
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <Question question={questions[current].question} />
          <Answers
            key={current + "answer"}
            answers={questions[current].answers}
            result={questions[current].result}
            answer={questions[current].answer}
            currentA={currentA[current]}
            setCurrentA={currentAnswer}
            onChange={onChange}
          />
          <div className="questionNav">
            {current > 0 ? (
              <button
                className="navButton"
                onClick={() => setCurrent(current - 1)}
              >
                {"<"}
              </button>
            ) : (
              <button className="navButton">{"--"}</button>
            )}
            {!loading && (
              <Link to={completed === questions.length ? "/quiz" : undefined}>
                <button
                  className="submit"
                  onClick={
                    completed === questions.length
                      ? submitQuiz
                      : questions[current].result === 0
                      ? () => checkAnswer(currentA[current])
                      : undefined
                  }
                >
                  {completed === questions.length ? "submit quiz" : "submit"}
                </button>
              </Link>
            )}
            {current < questions.length - 1 ? (
              <button
                className="navButton"
                onClick={() => setCurrent(current + 1)}
              >
                {">"}
              </button>
            ) : (
              <button className="navButton">{"--"}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
