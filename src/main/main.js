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
import Test from "../pages/test";
import Courses from "../pages/admin/components/courses";

export default function Main() {
  let [user, setUser] = useState("");
  let [admin, setAdmin] = useState(false);
  let [loggedIn, setLoggedIn] = useState(false);
  let [loading, setLoading] = useState(true);
  let [classes, setClasses] = useState([]);
  let [theme, setTheme] = useState("dark");

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
        theme,
        setTheme
      }}
    >
      <div className={"app bg-1-" + theme}>
        <div className={"center header bg-1-" + theme}>
          <Link to="/">
            <img
              className="center main-logo"
              src="https://s3-us-west-2.amazonaws.com/static.irvinecode.net/v1/imgs/logo_top.png"
              alt="logo"
            />
          </Link>
          <p className="title">Quiz Portal</p>
          <NavHead />
        </div>
        <div className={"center page bg-3-" + theme}>
          {loggedIn && (
            <Switch>
              <Route path="/admin/questions" component={Questions} />
              <Route path="/admin/courses" component={Courses} />
              <Route path="/admin/sets" component={QuestionSets} />
              <Route path="/admin" component={Admin} />
              <Route path={`/quiz/:set`} component={Quiz} />
              <Route path={"/quiz"} component={QuizHome} />
              <Route path={"/test"} component={Test} />
              <Route path={"/"} component={Home} />
            </Switch>
          )}
        </div>
        <div className={"center footer bg-1-" + theme}>
          <NavFoot />
        </div>
      </div>
    </UserContext.Provider>
  );
}
