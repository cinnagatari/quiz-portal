import Dexie from "dexie";

const idb = new Dexie("QuizPortal");
idb.version(1).stores({
    versions: "type",
    questions: "all",
    categories: "all",
    sets: "all",
    courses: "all",
    classes: "all",
    users: "all"
});

export default idb;
