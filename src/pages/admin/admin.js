import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../utils/userContext";

export default function Admin() {
  let user = useContext(UserContext);

  return (
    <div className="center admin-page">
      {user.loggedIn && !user.admin && (
        <div>Must be an admin to see this page.</div>
      )}
      {user.loggedIn && user.admin && (
        <div className="center options">
          <Link
            className={"center option option-" + user.theme}
            to="/admin/questions"
          >
            Edit Questions
          </Link>
          <Link
            className={"center option option-" + user.theme}
            to="/admin/sets"
          >
            Edit Question Sets
          </Link>
          <Link
            className={"center option option-" + user.theme}
            to="/admin/classes"
          >
            Edit Classes
          </Link>
          <Link
            className={"center option option-" + user.theme}
            to="/admin/students"
          >
            View Students
          </Link>
          <Link
            className={"center option option-" + user.theme}
            to="/admin/submissions"
          >
            View Submissions
          </Link>
        </div>
      )}
    </div>
  );
}
