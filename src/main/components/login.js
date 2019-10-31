import React, { useEffect, useState, useContext } from "react";
import { db, auth } from "../../utils/firebase";
import { Link } from "react-router-dom";
import UserContext from "../../utils/userContext";

export default function Login() {
  let login = useContext(UserContext);
  let [password, setPassword] = useState("");
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    auth.onAuthStateChanged(function(user) {
      if (mounted) {
        if (user) {
          async function loadUser() {
            let u = await auth.currentUser;
            login.setUser(u.email.substring(0, u.email.length - 12));
            let userSS = await db
              .collection("users")
              .doc(u.email.substring(0, u.email.length - 12))
              .get();
            login.setAdmin(userSS.data().admin);
            login.setClasses(userSS.data().classes);
            login.setLoading(false);
            login.setLoggedIn(true);
            setLoading(false);
          }
          loadUser();
        } else {
          login.setLoggedIn(false);
          setLoading(false);
        }
      }
    });

    return () => (mounted = false);
  }, []);

  function attemptLogin(e) {
    e.preventDefault();
    setPassword("");
    auth.signInWithEmailAndPassword(login.user + "@icaquiz.com", password);
  }

  function logout() {
    auth.signOut();
    login.setUser("");
    login.setLoading(true);
  }

  return (
    <div>
      {!loading && !login.loggedIn && (
        <form onSubmit={attemptLogin}>
          <div className="login">
            <div className="login-input">
              <div>
                <input
                  placeholder="username"
                  value={login.user}
                  onChange={ev => login.setUser(ev.target.value)}
                />
              </div>
              <div>
                <input
                  placeholder="password"
                  type="password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                />
              </div>
            </div>
            <button submit="submit">Login</button>
          </div>
        </form>
      )}
      {login.loggedIn && (
        <Link to="/">
          <button className="logout" onClick={() => logout()}>
            Logout
          </button>
        </Link>
      )}
    </div>
  );
}
