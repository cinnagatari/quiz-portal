import React, { useState, useContext, useEffect } from "react";
import Submit from "../libraries/submit";

export default function Test() {
    let [code, setCode] = useState("");

    return (
        <div>
            <Submit defaultValue={code} language={"python"}/>
        </div>
    );
}
