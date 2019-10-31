import React, { useContext } from "react";
import UserContext from "../../utils/userContext";

export default function Popup({ closePopup, contents }) {
  let user = useContext(UserContext);

  return (
    <div className="center">
      <div onClick={() => closePopup(false)} className="center popup-bg" />
      <div className={"center popup popup-" + user.theme}>{contents}</div>
    </div>
  );
}
