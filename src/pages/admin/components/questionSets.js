import React, { useState, useEffect } from "react";
import { db } from "../../../utils/firebase";
import { loadDB } from "../../../libraries/loadDB";

const DEFAULT = [
  {
    name: "testSet",
    questions: [],
    timeLimit: {time: 7, type: "days"}
  }
]

export default function QuestionSets({ questions, categories }) {
  let [sets, setSets] = useState([]);

  useEffect(() => {
    loadDB.sets().then(v => setSets(v));
  }, [])


  console.log(sets);

  return (
    <div className="set-editor">
      <div className="sets">
        <div>{sets}</div>
      </div>
    </div>
  );
}
