import React, { useState } from "react";
import moment from "moment";
import idb from "../utils/indexedDB";

export default function Test() {
    

    let [time, setTime] = useState("mon-4pm");
    let [date, setDate] = useState(
        moment()
            .add("30", "d")
            .format()
    );

    return (
        <div>
            <div>{date}</div>
        </div>
    );
}
