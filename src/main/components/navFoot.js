import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../utils/userContext";

export default function NavFoot() {
  let user = useContext(UserContext);
  return (
    <div className="center footer">
      <div className="themes">
        <button className="btn-small bg-3-light" onClick={() => user.setTheme("light")}>Light</button>
        <button className="btn-small bg-1-dark" onClick={() => user.setTheme("dark")}>Dark</button>
      </div>
    </div>
  );
}
