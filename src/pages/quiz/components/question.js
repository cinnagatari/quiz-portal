import React, { useContext } from "react";
import UserContext from "../../../utils/userContext";
import AceEditor from "react-ace";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/dracula";
import "brace/theme/github";

export default function Question({
  preview,
  id,
  question,
  language,
  type
}) {
  let user = useContext(UserContext);

  let previewOnLoad = instance => {
    instance.togglePreview();
  };

  console.log(question);
  return (
    <div className="center fin-question">
      <div className="text">
        <SimpleMDE
          getMdeInstance={previewOnLoad}
          key={"fin-question" + id + language}
          value={question.question[language]}
          options={{
            lineWrapping: false,
            spellChecker: false,
            toolbar: false,
            status: false
          }}
        />
        {question.type === "sa" && preview && (
          <div>
            {question.tests[language].map((test, i) => (
              <AceEditor
                key={"test case" + i}
                mode={language}
                placeholder="test case"
                value={test}
                theme={
                  user.theme === "light" ? "github" : "tomorrow_night_eighties"
                }
                fontSize="14px"
                showPrintMargin={false}
                maxLines={50}
                style={{
                  height: "300px",
                  width: "80%",
                  borderRadius: "10px",
                  marginBottom: 5
                }}
                editorProps={{
                  $blockScrolling: Infinity
                }}
                setOptions={{
                  readOnly: true
                }}
              />
            ))}
          </div>
        )}
        {question.type === "sa" && preview && (
          <div>
            {question.hiddenTests[language].map((test, i) => (
              <AceEditor
                key={"hidden test case" + i}
                mode={language}
                placeholder="test case"
                value={test}
                theme={
                  user.theme === "light" ? "github" : "tomorrow_night_eighties"
                }
                fontSize="14px"
                showPrintMargin={false}
                maxLines={50}
                style={{
                  height: "300px",
                  width: "80%",
                  borderRadius: "10px",
                  marginBottom: 5
                }}
                editorProps={{
                  $blockScrolling: Infinity
                }}
                setOptions={{
                  readOnly: true
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="center fin-ans">
        {question.type === "sa" && (
          <AceEditor
            key={"final-fr" + id}
            value={question.placeholder[language]}
            mode={language}
            theme="github"
            fontSize="14px"
            showPrintMargin={false}
            style={{ maxHeight: "330px", width: "80%", borderRadius: "10px" }}
            editorProps={{
              $blockScrolling: Infinity
            }}
            setOptions={{
              readOnly: preview
            }}
          />
        )}
        {question.type === "mc" && (
          <div className="center mc-container">
            {question.answers[language].map((a, i) => (
              <button
                key={"final-mc" + id + i}
                className={"mc-ans-btn mc-ans-btn-" + user.theme}
              >
                <AceEditor
                  key={"final-mc" + id + i}
                  value={a}
                  mode={language}
                  theme="github"
                  fontSize="14px"
                  showPrintMargin={false}
                  style={{
                    minHeight: "50px",
                    width: "100%",
                    backgroundColor: "transparent",
                    zIndex: 0
                  }}
                  maxLines={Infinity}
                  editorProps={{ $blockScrolling: Infinity }}
                  setOptions={{
                    readOnly: true,
                    showGutter: false,
                    highlightActiveLine: false
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
