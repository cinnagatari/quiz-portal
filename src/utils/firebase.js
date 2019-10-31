import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

let API_KEY = "AIzaSyB54DtENheYOh31gTCjSfsf-ty0ksgWQ9o";
let PROJECT_ID = "ica-mc-portal";

let config = {
  apiKey: API_KEY,
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${PROJECT_ID}.firebaseio.com`,
  projectId: PROJECT_ID,
  storageBucket: `${PROJECT_ID}.appspot.com`
};

firebase.initializeApp(config);
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth, firebase };
