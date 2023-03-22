import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "aa09676f8dc625215b9712017ccb9c61078f74a3",
    authDomain: "rock-paper-scissors-a69a4.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-a69a4-default-rtdb.firebaseio.com",
    projectId: "rock-paper-scissors-a69a4",
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

export { rtdb };