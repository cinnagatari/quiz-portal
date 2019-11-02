import React, { useContext } from "react";
import UserContext from "../../utils/userContext";

export default function Popup({ close, contents }) {
  let user = useContext(UserContext);

  return (
    <div className="center">
      <div onClick={close} className="center popup-bg" />
      <div className={"center popup bg-3-" + user.theme}>{contents}</div>
    </div>
  );
}
