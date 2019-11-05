import React, { useEffect, useState, useContext } from "react";
import { version, loadDB } from "../../../libraries/loadDB";
import { course } from "../../../libraries/course";
import UserContext from "../../../utils/userContext";
import idb from "../../../utils/indexedDB";

export default function Courses() {
    let [courses, setCourses] = useState([]);
    let [classes, setClasses] = useState([]);
    let [users, setUsers] = useState([]);
    let [currentC, setCurrentC] = useState(-1);
    let [currentClass, setCurrentClass] = useState("");
    let user = useContext(UserContext);

    useEffect(() => {
        versionCheck();
    }, []);

    async function versionCheck() {
        let versionState = {};
        await version
            .check(["co", "u"])
            .then(versions => (versionState = versions));
        let courses = await idb.courses.get("courses").then(c => c);
        let classes = await idb.classes.get("classes").then(c => c);
        if (
            versionState.co === "load" ||
            courses === undefined ||
            classes === undefined
        ) {
            loadDB.courses().then(courses => setCourses(courses));
            loadDB.classes().then(classes => setClasses(classes));
        } else {
            setCourses(courses.courses);
            setClasses(classes.classes);
        }
        let users = await idb.users.get("users").then(u => u);
        if (versionState.u === "load" || users === undefined) {
            loadDB.users().then(users => setUsers(users));
        } else {
            setUsers(users.users);
        }
    }

    console.log(classes);

    return (
        <div className="courses-container">
            <div className={"courses bg-2-" + user.theme}>
                <p className={"center c-title bg-1-" + user.theme}>Courses</p>
                <div className="course">
                    {courses.map((c, i) => (
                        <button
                            className={"btn-medium btn-" + user.theme}
                            key={"course-" + c}
                            onClick={() => setCurrentC(i)}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className={"classes bg-2-" + user.theme}>
                <p className={"center c-title bg-1-" + user.theme}>Classes</p>
                {currentC !== -1 && (
                    <div className="class">
                        {classes.map(c => {
                            if (c.course === courses[currentC].name) {
                                return (
                                    <button
                                        className={
                                            "btn-medium btn-" + user.theme
                                        }
                                        key={
                                            courses[currentC].name +
                                            "-class-" +
                                            c.time
                                        }
                                        onClick={() => setCurrentClass(c)}
                                    >
                                        {c.time}
                                    </button>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
            {currentClass !== "" && (
                <div className="class">
                    <p>{currentClass.time}</p>
                    <div>
                        {currentClass.students.map(s => (
                            <button>{s}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
