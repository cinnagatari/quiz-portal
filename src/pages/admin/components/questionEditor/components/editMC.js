import React from "react";
import AceEditor from "react-ace";
import "easymde/dist/easymde.min.css";
import "brace/mode/java";
import "brace/mode/python";
import "brace/mode/javascript";
import "brace/theme/github";
import "brace/theme/tomorrow_night_eighties";
import { LANGUAGES } from "../../../../../utils/config";

export default function EditMC({
    name,
    answers,
    setAnswers,
    lang,
    reload,
    setReload,
    user
}) {
    function onChangeAnswers(newValue, index) {
        let temp = answers;
        temp[LANGUAGES[lang]][index] = newValue;
        setAnswers(temp);
        setReload(!reload);
    }

    

    function setLength(len) {
        let temp = { ...answers };
        let tempLen = temp[LANGUAGES[lang]].length;
        if (len > temp[LANGUAGES[lang]].length) {
            for (let i = 0; i < len - tempLen; i++) {
                temp[LANGUAGES[lang]].push("");
            }
        } else {
            temp[LANGUAGES[lang]].splice(
                len,
                temp[LANGUAGES[lang] + "-length"] - len
            );
        }
        temp[LANGUAGES[lang] + "-length"] = len;
        setAnswers(temp);
    }

    return (
        <div className="mc-container">
            <select
                key={LANGUAGES[lang] + "length select"}
                className="length sel-2"
                value={answers[LANGUAGES[lang] + "-length"]}
                onChange={ev => setLength(ev.target.value)}
            >
                {new Array(3).fill(0).map((v, i) => (
                    <option key={LANGUAGES[lang] + "length-" + i} value={4 - i}>
                        {4 - i}
                    </option>
                ))}
            </select>
            {answers[LANGUAGES[lang]].map((a, i) => (
                <div
                    key={LANGUAGES[lang] + "-answer-" + i}
                    className="choice-container"
                >
                    <AceEditor
                        key={name + LANGUAGES[lang] + "-answer-" + i}
                        placeholder={
                            i === 0 ? "correct answer" : "incorrect answer"
                        }
                        style={{
                            minHeight: "50px",
                            width: "100%",
                            backgroundColor: i === 0 ? "lightgreen" : "",
                            borderRadius: "10px"
                        }}
                        value={a}
                        onChange={ev => onChangeAnswers(ev, i)}
                        mode={LANGUAGES[lang]}
                        theme={
                            user.theme === "light"
                                ? "github"
                                : "tomorrow_night_eighties"
                        }
                        maxLines={Infinity}
                        fontSize="14px"
                        showPrintMargin={false}
                        setOptions={{
                            autoScrollEditorIntoView: false
                        }}
                        editorProps={{
                            $blockScrolling: Infinity
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
