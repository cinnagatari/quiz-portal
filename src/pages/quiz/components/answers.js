import React from "react";
import brace from "brace";
import AceEditor from "react-ace";
import "brace/mode/java";
import "brace/theme/dracula";
import "brace/theme/github";

export default function Answers({
  answers,
  result,
  answer,
  currentA,
  setCurrentA,
  onChange
}) {
  return (
    <div className="answerList">
      {answer !== "fr" ? (
        answers.a.map((a, i) => {
          let backgroundColor =
            result === 1 && a === answer
              ? "lightgreen"
              : result === -1 && answers.att[i]
              ? "lightpink"
              : "";
          return (
            <div className="answer">
              <button
                id={a + i}
                style={{ backgroundColor }}
                onClick={
                  result === 0
                    ? () => {
                        setCurrentA(i);
                      }
                    : undefined
                }
                className={
                  currentA === i ? "answerChoice btnAnim" : "answerChoice"
                }
              >
                {String.fromCharCode(65 + i)}
              </button>
              <p className={"center answerText"}>{a}</p>
            </div>
          );
        })
      ) : (
        <div className="center">
          <AceEditor
            id={"fr" + currentA}
            value={answers}
            mode="java"
            theme="github"
            onChange={onChange}
            readOnly={result === 1}
            width="550px"
            height="275px"
            fontSize="14px"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: Infinity }}
          />
        </div>
      )}
    </div>
  );
}
