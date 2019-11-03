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
  type,
  answer
}) {
  let user = useContext(UserContext);

  let previewOnLoad = instance => {
    instance.togglePreview();
  };

  return (
    <div className="center fin-question">
      <div className="text">
        <SimpleMDE
          getMdeInstance={previewOnLoad}
          key={"fin-question" + id + language}
          value={question}
          options={{
            lineWrapping: false,
            spellChecker: false,
            toolbar: false,
            status: false
          }}
        />
      </div>
      <div className="center fin-ans">
        {type === "sa" && (
          <AceEditor
            key={"final-fr" + id}
            value={answer}
            mode={language}
            theme="github"
            fontSize="14px"
            showPrintMargin={false}
            style={{ maxHeight: "330px", width: "80%", borderRadius: '10px' }}
            editorProps={{
              $blockScrolling: Infinity
            }}
            setOptions={{
              readOnly: preview
            }}
          />
        )}
        {type === "mc" && (
          <div className="center mc-container">
            {answer.map((a, i) => (
              <button key={"final-mc" + id + i} className={"mc-ans-btn mc-ans-btn-" + user.theme}>
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
