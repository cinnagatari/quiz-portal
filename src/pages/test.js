import React, { useState, useContext, useEffect } from "react";
import Submit from "../libraries/submit";

export default function Test() {
    let [code, setCode] = useState("");

    return (
        <div>
            <textarea value={code} onChange={ev => setCode(ev.target.value)} />
            <Submit defaultValue={code} language={"python"}/>
        </div>
    );
}
