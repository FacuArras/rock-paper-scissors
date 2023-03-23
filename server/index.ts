import { rtdb, firestore } from "./db.js";
import * as express from "express";
import * as cors from "cors";
import * as process from "process";
import * as path from "path";
import { nanoid } from "nanoid";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

console.log("Hola desde el server");


const usersCollectionRef = firestore.collection("users");
const roomsCollectionRef = firestore.collection("rooms");

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

//Registra un usuario en la base de datos pidiendo un nombre y un mail, devolviendo el id del usuario.
app.post("/signup", (req, res) => {
    const { mail, name } = req.body;

    usersCollectionRef.where('mail', '==', mail).get().then(querySnapshot => {
        if (querySnapshot.empty) {
            usersCollectionRef.add({
                name, mail
            }).then(documentReference => {
                res.status(201).json({
                    id: documentReference.id,
                    message: "Usuario creado correctamente."
                });
            });
        } else {
            querySnapshot.forEach(documentSnapshot => {
                res.status(400).json({
                    id: documentSnapshot.id,
                    message: "El usuario ya existe."
                });
            })
        };
    });
});

app.post("/login", (req, res) => {
    const { mail } = req.body;

    usersCollectionRef.where('mail', '==', mail).get().then(querySnapshot => {
        if (querySnapshot.empty) {
            res.status(404).json({
                message: "El usuario con el mail " + mail + " no existe."
            });
        } else {
            querySnapshot.forEach(documentSnapshot => {
                res.status(302).json({
                    id: documentSnapshot.id,
                    name: documentSnapshot.get("name"),
                    message: "Inicio de sesión con el mail " + mail + " exitoso."
                });
            });
        };
    });
});

app.post("/rooms", (req, res) => {
    const { userId } = req.body;

    usersCollectionRef.doc(userId.toString()).get().then(querySnapshot => {
        if (querySnapshot.exists) {
            const roomRef = rtdb.ref("rooms/" + nanoid());
            roomRef.set({
                ownerId: userId
            }).then(() => {
                const roomLongId = roomRef.key;
                const roomShortId = 1000 + Math.floor(Math.random() * 999);

                roomsCollectionRef.doc(roomShortId.toString()).set({
                    firebaseId: roomLongId,
                    ownerId: userId
                }).then(() => {
                    res.status(201).json({
                        firestoreId: roomShortId.toString(),
                        firebaseId: roomLongId.toString(),
                        message: "Sala creada correctamente."
                    });
                });
            });
        } else {
            res.status(401).json({
                message: "Usuario con el id " + userId + " no registrado."
            });
        };
    });
});

app.get("/rooms/:roomId", (req, res) => {
    const { userId } = req.body;
    const { roomId } = req.params;

    usersCollectionRef.doc(userId.toString()).get().then(querySnapshot => {
        if (querySnapshot.exists) {
            roomsCollectionRef.doc(roomId).get().then(querySnapshot => {
                res.status(302).json({
                    firebaseId: querySnapshot.get("firebaseId"),
                    message: "Sala obtenida correctamente."
                });
            });
        } else {
            res.status(401).json({
                message: "Usuario con el id " + userId + " no registrado."
            });
        };
    });
});

app.use(express.static(path.join(__dirname, "../dist")));

app.listen(port, () => {
    console.log(`Aplicación incializada y escuchando en el puerto ${port}`);
}); 