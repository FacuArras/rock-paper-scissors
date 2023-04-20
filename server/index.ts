import { rtdb, firestore } from "./db.js";
import * as express from "express";
import * as cors from "cors";
import * as process from "process";
import * as path from "path";
import { nanoid } from "nanoid";

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const usersCollectionRef = firestore.collection("users");
const roomsCollectionRef = firestore.collection("rooms");


/* Registra un usuario en la base de datos pidiendo un nombre y un mail, devolviendo el id del usuario. */
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
            });
        };
    });
});

/* Obtiene un usuario de la base de datos, pidiendo un mail y devolviendo el id del usuario y el nombre. */
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

/* Crea una room tanto en la base de datos, como en la base de datos realtime, pidiendo el id y el nombre del usuario, devolviendo el id 
     corto de la base de datos y el id largo de la base de datos realtime. */
app.post("/rooms", (req, res) => {
    const { userId, userName } = req.body;

    usersCollectionRef.doc(userId.toString()).get().then(querySnapshot => {
        if (querySnapshot.exists) {
            const roomRef = rtdb.ref("rooms/" + nanoid());
            roomRef.set({
                currentGame: {
                    [userId]: {
                        name: userName,
                        online: true,
                        ready: false,
                        play: "",
                    },
                },
                owner: userId,
                history: [{ message: "Bienvenido al historial de partidas!" }]
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
                        message: "Sala creada correctamente.",
                        history: [{ message: "Bienvenido al historial de partidas!" }]
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

/* Accede a una room, pidiendo el id y el nombre de el usuario, además de la id corta de la room a la que se quiere unir.
     Creando su espacio en la base de datos realtime si es que en la misma no hay mas de una persona, devolviendo el id de la base de datos realtime. */
app.post("/rooms/:roomId", (req, res) => {
    const { userId } = req.query;
    const { roomId } = req.params;
    const { userName } = req.body;

    usersCollectionRef.doc(userId.toString()).get().then(querySnapshot => {
        if (querySnapshot.exists) {
            /* Obtengo la room en la base de datos. */
            roomsCollectionRef.doc(roomId).get().then(querySnapshot => {
                /* Obtengo la room en firebase. */
                const rtRoomRef = rtdb.ref("rooms/" + querySnapshot.get("firebaseId"));
                rtRoomRef.once("value").then(snapshot => {
                    const owner = snapshot.val().owner;
                    const history = snapshot.val().history;
                    const playersVal = snapshot.val().currentGame;
                    /* Verifico si la sala está disponible o llena, si en la sala hay mas de 2 jugadores, chequea si el "guest" soy yo o es otra persona.
                    Si coincide mi "userName" con el invitado de la partida, me deja unirme. */
                    if (Object.keys(playersVal).length > 1 && Object.keys(playersVal).includes(userId.toString()) === false) {
                        res.status(401).json({
                            message: "La sala está llena."
                        });
                    } else {
                        const opponentUserId = Object.keys(playersVal).find(player => player !== userId) as any;
                        const opponentData = playersVal[opponentUserId];
                        /* Al estar disponible hago un update para agregar al guest a la firebase. */
                        const updates = {};
                        updates["/currentGame/" + userId] = {
                            name: userName,
                            online: true,
                            ready: false,
                            play: ""
                        };

                        rtRoomRef.update(updates).then(() => {
                            res.status(302).json({
                                firebaseId: querySnapshot.get("firebaseId"),
                                opponentId: opponentUserId,
                                opponentName: opponentData.name,
                                owner,
                                history,
                                message: "Sala obtenida correctamente ."
                            });
                        });
                    };
                });
            });
        } else {
            res.status(401).json({
                message: "Usuario con el id " + userId + " no registrado."
            });
        };
    });
});

/* Accedo a una room para cambiar el estado de ready e inicializar la "play" con un string vacío por si tenía una jugada ya escrita, 
     pidiendo como requisito el id del usuario y el id corto de la base de datos. */
app.put("/rooms/:roomId/ready", (req, res) => {
    const { userId, ready } = req.body;
    const { roomId } = req.params;

    usersCollectionRef.doc(userId.toString()).get().then(querySnapshot => {
        if (querySnapshot.exists) {
            roomsCollectionRef.doc(roomId).get().then(querySnapshot => {
                if (querySnapshot.exists) {
                    const rtRoomRef = rtdb.ref("rooms/" + querySnapshot.get("firebaseId") + "/currentGame/" + userId);
                    rtRoomRef.update({
                        ready,
                        play: ""
                    }).then(() => {
                        res.status(202).json({
                            message: "Cambio realizado correctamente."
                        });
                    });
                } else {
                    res.status(404).json({
                        message: "La sala con el id " + roomId + " no existe."
                    });
                };
            });
        } else {
            res.status(401).json({
                message: "Usuario con el id " + userId + " no registrado."
            });
        };
    });
});


/* Accedo a la room para cambiar la "play", pidiendo como requisito el id largo de la base 
     de datos realtime, el id de usuario y obviamente la jugada a cambiar. En este caso no verifico si existe 
         el usuario o la room para que el cambio sea lo más rápido posible y pueda hacerse dentro de los 3 segundos. */
app.put("/rooms/:roomId/play", (req, res) => {
    const { firebaseId, userId, play } = req.body;

    const rtdbRoomRef = rtdb.ref("rooms/" + firebaseId + "/currentGame/" + userId);
    rtdbRoomRef.update({
        play,
    }).then(() => {
        res.status(202).json({
            message: "Cambio realizado correctamente."
        });
    });
});

/* Pusheo el historial de la firebase pidiendo como requisito el id del usuario, del oponente y la jugada de ambos. */
app.post("/rooms/:roomId/history", (req, res) => {
    const { userId, opponentId, userPlay, opponentPlay } = req.body;
    const { roomId } = req.params;

    const roomRef = rtdb.ref("/rooms/" + roomId + "/history");

    roomRef.push({
        [userId]: userPlay,
        [opponentId]: opponentPlay
    }).then(() => {
        res.status(200).json({
            message: "Historial modificado correctamente."
        });
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.use(express.static(path.join(__dirname, "../dist")));

app.listen(port, () => {
    console.log(`Aplicación lista y escuchando en el puerto ${port}`);
}); 