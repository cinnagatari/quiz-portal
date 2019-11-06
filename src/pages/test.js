import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
const DAYS = ["", "mon", "tues", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];


export default function Test() {
    let [date, setDate] = useState(
        moment()
            .add("30", "d")
            .format()
    );
    let [day, setDay] = useState(moment().isoWeekday());
    let [weekday, setWeekday] = useState(WEEKDAYS[day - 1]);
    let [time, setTime] = useState(moment("").format());
    let [classTime, setClassTime] = useState("");

    useEffect(() => {}, [weekday]);

    return (
        <div>
            <div>{DAYS[day]}</div>
            <select
                value={weekday}
                onChange={ev => setWeekday(ev.target.value)}
            >
                {WEEKDAYS.map(w => (
                    <option key={"weekday-" + w} value={w}>
                        {w}
                    </option>
                ))}
            </select>
            <select>
                {new Array(24).fill(0).map((v, i) => (
                    <option>{}</option>
                ))}
            </select>
        </div>
    );
}
