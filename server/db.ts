import admin from "firebase-admin";
import * as serviceAccount from "../key.json";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://rock-paper-scissors-a69a4-default-rtdb.firebaseio.com/"
});

const rtdb = admin.database();
const firestore = admin.firestore();

export { rtdb, firestore };