import React, { useState, useEffect } from "react";
import { db } from "../../../utils/firebase";

export default function QuestionSets() {
  let [questions, setQuestions] = useState([
    {
      question: "",
      answers: [],
      category: "",
      difficulty: 1,
      id: "",
      language: "java",
      type: "mc"
    }
  ]);

  useEffect(() => {
    async function loadQuestions() {
      let questions = [];
      let qSS = await db.collection("questionPool").get();
      qSS.docs.forEach(q => {
        questions.push({
          question: q.question,
          answers: q.answers,
          category: q.category,
          difficulty: q.difficulty,
          id: q.id,
          language: q.language,
          type: q.type
        });
      });
      setQuestions(questions);
    }
    loadQuestions();
  }, []);

  return (
    <div>
      <p>Question Sets</p>
    </div>
  );
}
