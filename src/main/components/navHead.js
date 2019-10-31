import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../utils/userContext";
import Login from "./login";

export default function NavHead() {
  let user = useContext(UserContext);

  return (
    <div className="center navigation">
      <Login />
      {user.loggedIn && !user.loading && (
        <div>
          <Link className="nav-link white-link" to="/quiz">
            Quiz
          </Link>
          {user.admin && (
            <Link className="nav-link white-link" to="/admin">
              Admin
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
