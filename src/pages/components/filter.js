import React, { useState, useEffect, useContext } from "react";
import { loadDB, version } from "../../libraries/loadDB";
import UserContext from "../../utils/userContext";
import idb from "../../utils/indexedDB";

let LANGUAGES = ["java", "python", "javascript"];
let DIFFICULTY = new Array(10).fill(0).map((v, i) => i + 1);

export default function Filter({
    newFilter,
    newType,
    newLowerDiff,
    newUpperDiff,
    newLanguage
}) {
    let [sections, setSections] = useState([]);
    let [currentS, setCurrentS] = useState(-1);
    let [categories, setCategories] = useState([]);
    let [selected, setSelected] = useState([]);
    let [filter, setFilter] = useState([]);
    let [showFilter, setShowFilter] = useState(false);
    let [language, setLanguage] = useState("none");
    let [type, setType] = useState("none");
    let [lowerDiff, setLowerDiff] = useState(1);
    let [upperDiff, setUpperDiff] = useState(10);
    let user = useContext(UserContext);

    useEffect(() => {
        versionCheck();
    }, []);

    useEffect(() => {
        let sections = [];
        categories.forEach(c => {
            if (
                !sections.includes(c.substring(0, c.indexOf(" - "))) &&
                c !== "no category"
            )
                sections.push(c.substring(0, c.indexOf(" - ")));
        });
        setSections(sections);
    }, [categories]);

    function updateFilter(value) {
        setFilter(
            filter.includes(value)
                ? filter.filter(f => f !== value)
                : [...filter, value]
        );
    }

    async function versionCheck() {
        let versionState = {};
        await version.check(["c"]).then(v => (versionState = v));
        let categories = await idb.categories.get("categories").then(c => c);
        if (versionState.c === "load" || categories === undefined)
            await loadDB.categories(newCategories =>
                setCategories(newCategories)
            );
        else setCategories(categories.categories);
    }
    return (
        <div className={"filter bg-1-" + user.theme}>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={"btn-medium btn-" + user.theme}
                >
                    {!showFilter ? "Open Filter" : "Close Filter"}
                </button>
            </div>
            {showFilter && (
                <div>
                    <div className={"f-top-row + bg-2-" + user.theme}>
                        <div
                            className={
                                "center f-subsection + bg-1-" + user.theme
                            }
                        >
                            <p className={"f-subtitle"}>Languages</p>
                            <div>
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l}
                                        className={
                                            "btn-small btn-" +
                                            user.theme +
                                            (l === language
                                                ? " btn-selected-2-" +
                                                  user.theme
                                                : "")
                                        }
                                        onClick={() => setLanguage(l)}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div
                            className={"center f-subsection bg-1-" + user.theme}
                        >
                            <p className={"f-subtitle"}>Type</p>
                            <div>
                                <button
                                    key={"mc"}
                                    className={
                                        "btn-small btn-" +
                                        user.theme +
                                        (type === "mc"
                                            ? " btn-selected-2-" + user.theme
                                            : "")
                                    }
                                    onClick={() => {
                                        setType(type !== "mc" ? "mc" : "none");
                                    }}
                                >
                                    {"Multiple Choice"}
                                </button>
                                <button
                                    key={"sa"}
                                    className={
                                        "btn-small btn-" +
                                        user.theme +
                                        (type === "sa"
                                            ? " btn-selected-2-" + user.theme
                                            : "")
                                    }
                                    onClick={() => {
                                        setType(type !== "sa" ? "sa" : "none");
                                    }}
                                >
                                    {"Free Response"}
                                </button>
                            </div>
                        </div>
                        <div
                            className={"center f-subsection bg-1-" + user.theme}
                        >
                            <p className={"f-subtitle"}>Difficulty Range</p>
                            <div>
                                <select
                                    className={"sel-2"}
                                    key={"lower"}
                                    value={lowerDiff}
                                    onChange={ev => {
                                        setLowerDiff(
                                            parseInt(ev.target.value),
                                            10
                                        );
                                        if (upperDiff < ev.target.value)
                                            setUpperDiff(ev.target.value);
                                    }}
                                >
                                    {DIFFICULTY.map(d => (
                                        <option key={"l" + d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={"sel-2"}
                                    key={"upper"}
                                    value={upperDiff}
                                    onChange={ev => {
                                        setUpperDiff(
                                            parseInt(ev.target.value, 10)
                                        );
                                        if (ev.target.value < lowerDiff)
                                            setLowerDiff(ev.target.value);
                                    }}
                                >
                                    {DIFFICULTY.map(d => (
                                        <option key={"" + d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={"f-sections"}>
                        <div>
                            <p className="f-title">Sections</p>
                        </div>
                        {sections.map((s, i) => (
                            <button
                                key={s + i}
                                className={
                                    "btn-small btn-" +
                                    user.theme +
                                    (currentS === i
                                        ? " btn-selected-2-" + user.theme
                                        : "")
                                }
                                onClick={() => setCurrentS(i)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className={"f-categories bg-2-" + user.theme}>
                        <p className="f-title">Categories</p>
                        {categories.map(c => {
                            if (
                                sections[currentS] ===
                                c.substring(0, c.indexOf(" - "))
                            ) {
                                return (
                                    <button
                                        key={c + "f"}
                                        className={
                                            "btn-small btn-" +
                                            user.theme +
                                            (filter.includes(c)
                                                ? " btn-selected-" + user.theme
                                                : "")
                                        }
                                        onClick={() => {
                                            updateFilter(c);
                                            setSelected(
                                                selected.includes(c)
                                                    ? selected.filter(
                                                          s => s !== c
                                                      )
                                                    : [...selected, c]
                                            );
                                        }}
                                    >
                                        {c}
                                    </button>
                                );
                            }
                        })}
                    </div>
                    <div className="f-categories">
                        <p className="f-title">Selected Categories</p>
                        {selected.map(c => (
                            <button
                                key={c + "s"}
                                className={"btn-small btn-" + user.theme}
                                onClick={() => {
                                    updateFilter(c);
                                    setSelected(selected.filter(s => s !== c));
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-start"
                        }}
                    >
                        <button
                            className={"btn-small btn-" + user.theme}
                            onClick={() => {
                                newFilter(filter);
                                newType(type);
                                newLanguage(language);
                                newUpperDiff(upperDiff);
                                newLowerDiff(lowerDiff);
                            }}
                        >
                            Apply filter
                        </button>
                        <button
                            className={"btn-small btn-" + user.theme}
                            onClick={() => {
                                setFilter([]);
                                setSelected([]);
                                setType("none");
                                setUpperDiff(10);
                                setLowerDiff(1);
                            }}
                        >
                            Reset filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
