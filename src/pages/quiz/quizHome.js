import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../../utils/firebase";
import UserContext from "../../utils/userContext";

export default function QuizHome({ match }) {
  let user = useContext(UserContext);
  let [classes, setClasses] = useState([["", []]]);
  let [loading, setLoading] = useState(true);
  let [currentClass, setCurrentClass] = useState(0);

  useEffect(() => {
    async function loadItems() {
      let classes = [];
      await db
        .collection("classes")
        .get()
        .then(snapshot => {
          snapshot.docs.forEach(doc => {
            if (user.classes.includes(doc.data().class))
              classes.push([doc.data().class, doc.data().sets]);
          });
        });
      setLoading(false);
      classes.sort(function(a, b) {
        return a[0].localeCompare(b[0]);
      });
      setClasses(classes);
    }
    loadItems();
  }, []);

  return (
    <div>
      <div>{loading && <div>Loading...</div>}</div>
      <div>
        <p>Select Class</p>
        <div>
          {!loading &&
            classes.map((c, i) => {
              if (currentClass === i) {
                return (
                  <button
                    className="currentClass"
                    key={"class" + i}
                    onClick={() => setCurrentClass(i)}
                  >
                    {c[0]}
                  </button>
                );
              } else {
                return (
                  <button
                    className="class"
                    key={"class" + i}
                    onClick={() => setCurrentClass(i)}
                  >
                    {c[0]}
                  </button>
                );
              }
            })}
        </div>
        <div>
          {!loading && (
            <div>
              <div>Select Set</div>
              {classes[currentClass][1].map((set, i) => (
                <Link key={"link" + i} className="class" to={`/quiz/${set}`}>
                  <button>{set}</button>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div />
      </div>
    </div>
  );
}
