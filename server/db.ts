import admin from "firebase-admin";
import * as serviceAccount from "../key.json";

/* const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_MAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_CERT,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
}; */

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://rock-paper-scissors-a69a4-default-rtdb.firebaseio.com/"
});

const rtdb = admin.database();
const firestore = admin.firestore();

export { rtdb, firestore };