import React, { useState, useEffect, useContext } from 'react';
import { loadDB, version } from "./loadDB";
import UserContext from "../utils/userContext"

let LANGUAGES = ["java", "python", "javascript"];
let TYPES = ["mc", "sa"];
let DIFFICULTY = new Array(10).fill(0).map((v, i) => i + 1);

export default function Filter({ newFilter, newType }) {
    let [sections, setSections] = useState([]);
    let [currentS, setCurrentS] = useState(-1);
    let [categories, setCategories] = useState([]);
    let [selected, setSelected] = useState([]);
    let [filter, setFilter] = useState([]);
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
            if (!sections.includes(c.substring(0, c.indexOf("-"))) && c !== "no category")
                sections.push(c.substring(0, c.indexOf("-")));
        })
        setSections(sections);
    }, [categories])

    useEffect(() => {
        newFilter(filter);
        newType(type);
    }, [filter, type])

    function updateFilter(value) {
        setFilter(filter.includes(value) ? filter.filter(f => f !== value) : [...filter, value]);
    }

    async function versionCheck() {
        let versionState = {};
        await version.check().then(v => versionState = v);
        if (versionState.c === "load") await loadDB.categories(newCategories => categories = newCategories);
        else setCategories(JSON.parse(localStorage.getItem("categories")));
    }


    return (
        <div className={"filter bg-1-" + user.theme}>
            {filter}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <p className={"f-title"}>Filter</p>
            </div>
            <div className={"f-top-row + bg-2-" + user.theme}>
                <div className={"center f-subsection + bg-1-" + user.theme}>
                    <p className={"f-subtitle"}>Languages</p>
                    <div>
                        {LANGUAGES.map(l => <button
                            key={l}
                            className={"btn-small btn-" + user.theme + (filter.includes(l) ? " btn-selected-2" + user.theme : "")}
                            onClick={() => updateFilter(l)}>{l}</button>
                        )}
                    </div>
                </div>
                <div className={"center f-subsection bg-1-" + user.theme}>
                    <p className={"f-subtitle"}>Type</p>
                    <div>
                        <button
                            key={"mc"}
                            className={"btn-small btn-" + user.theme}
                            onClick={() => setType(type !== "mc" ? "mc" : "none")}>{"Multiple Choice"}</button>
                        <button
                            key={"mc"}
                            className={"btn-small btn-" + user.theme}
                            onClick={() => setType(type !== "sa" ? "sa" : "none")}>{"Free Response"}</button>
                    </div>
                </div>
                <div className={"center f-subsection bg-1-" + user.theme}>
                    <p className={"f-subtitle"}>Difficulty Range</p>
                    <div>
                        <select className={"sel-2"} key={'lower'} value={lowerDiff} onChange={ev => setLowerDiff(parseInt(ev.target.value), 10)}>
                            {DIFFICULTY.map(d => <option value={d}>{d}</option>)}
                        </select>
                        <select className={"sel-2"} key={'upper'} value={upperDiff} onChange={ev => setUpperDiff(parseInt(ev.target.value), 10)}>
                            {new Array(DIFFICULTY.length + 1 - lowerDiff).fill(0).map((d, i) => lowerDiff + i).map((d, i) => <option value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className={"f-sections"}>
                <div>
                    <p className="f-title">Sections</p>
                </div>
                {sections.map((s, i) => <button
                    className={"btn-small btn-" + user.theme}
                    onClick={() => setCurrentS(i)}>{s}</button>)}
            </div>
            <div className={"f-categories bg-2-" + user.theme}>
                <p className="f-title">Categories</p>
                {categories.map(c => {
                    if (sections[currentS] === c.substring(0, c.indexOf("-"))) {
                        return (<button className={"btn-small btn-" + user.theme} onClick={() => {
                            updateFilter(c);
                            setSelected(
                                selected.includes(c) ?
                                    selected.filter(s => s !== c) :
                                    [...selected, c]
                            );
                        }}>{c}</button>);
                    }
                })}
            </div>
            <div className="f-categories">
                <p className="f-title">Selected Categories</p>
                {selected.map(c => <button className={"btn-small btn-" + user.theme} onClick={() => {
                    updateFilter(c);
                    setSelected(selected.filter(s => s !== c));
                }}>{c}</button>)}
            </div>
        </div>
    );
}