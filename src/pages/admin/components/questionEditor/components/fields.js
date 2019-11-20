import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJava, faPython, faJs } from "@fortawesome/free-brands-svg-icons";
import { LANGUAGES } from "../../../../../utils/config";
const ICONS = [faJava, faPython, faJs];

export default function Fields({
    submitFailed,
    names,
    name,
    setName,
    category,
    categories,
    setCategory,
    difficulty,
    setDifficulty,
    lang,
    languages,
    toggleLanguage,
    user
}) {
    return (
        <div className={"center e-fields bg-2-" + user.theme}>
            <div>
                {submitFailed && name.length === 0 ? (
                    <p>Please Enter A Name</p>
                ) : (
                    undefined
                )}
                {submitFailed && names.includes(name) ? (
                    <p>Name is taken</p>
                ) : (
                    undefined
                )}
                <input
                    className="inp-1"
                    placeholder="name"
                    type="text"
                    value={name}
                    onChange={ev => setName(ev.target.value)}
                />
            </div>
            <div>
                {submitFailed && category === -1 ? (
                    <p>Please Select A Category</p>
                ) : (
                    undefined
                )}
                <select
                    className="sel-1"
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}
                >
                    <option value="-1">--Category--</option>
                    {categories.map(c => (
                        <option key={"category" + c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                {submitFailed && difficulty === -1 ? (
                    <p>Please Select A Difficulty</p>
                ) : (
                    undefined
                )}
                <select
                    className="sel-1"
                    value={difficulty}
                    onChange={ev =>
                        setDifficulty(parseInt(ev.target.value, 10))
                    }
                >
                    <option value="-1">--Difficulty--</option>
                    {new Array(10).fill(0).map((v, i) => (
                        <option key={i} value={i + 1}>
                            {i + 1}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                {submitFailed && lang === -1 ? (
                    <p>Please Select A Language</p>
                ) : (
                    undefined
                )}
                {LANGUAGES.map((l, i) => (
                    <button
                        className={
                            "btn-icon " +
                            (languages[i] ? "btn-selected-" + user.theme : "")
                        }
                        key={"toggle-languages-" + i}
                        onClick={() => toggleLanguage(i)}
                    >
                        <FontAwesomeIcon className="icon" icon={ICONS[i]} />
                    </button>
                ))}
            </div>
        </div>
    );
}
