import React, { useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import NavHead from "./components/navHead";
import NavFoot from "./components/navFoot";
import Admin from "../pages/admin/admin";
import QuizHome from "../pages/quiz/quizHome";
import Quiz from "../pages/quiz/quiz";
import UserContext from "../utils/userContext";
import Home from "./components/home";
import QuestionSets from "../pages/admin/components/questionSets";
import Questions from "../pages/admin/components/questions";

export default function Main() {
  let [user, setUser] = useState("");
  let [admin, setAdmin] = useState(false);
  let [loggedIn, setLoggedIn] = useState(false);
  let [loading, setLoading] = useState(true);
  let [classes, setClasses] = useState([]);
  let [theme, setTheme] = useState("light");

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedIn,
        setLoggedIn,
        admin,
        setAdmin,
        loading,
        setLoading,
        classes,
        setClasses,
        theme
      }}
    >
      <div className="app">
        <div className={"center header header-" + theme}>
          <img
            className="center main-logo"
            src="https://s3-us-west-2.amazonaws.com/static.irvinecode.net/v1/imgs/logo_top.png"
            alt="logo"
          />
          <Link className="title" to="/">
            <p>Quiz Portal</p>
          </Link>
          <button onClick={() => setTheme("light")}>Light</button>
          <button onClick={() => setTheme("dark")}>Dark</button>
          <NavHead />
        </div>
        <div className={"center page page-" + theme}>
          {loggedIn && (
            <Switch>
              <Route path="/admin/questions" component={Questions} />
              <Route path="/admin/sets" component={QuestionSets} />
              <Route path="/admin" component={Admin} />
              <Route path={`/quiz/:set`} component={Quiz} />
              <Route path={"/quiz"} component={QuizHome} />
              <Route path={"/"} component={Home} />
            </Switch>
          )}
        </div>
        <div className={"center footer footer-" + theme}>
          <NavFoot />
        </div>
      </div>
    </UserContext.Provider>
  );
}
