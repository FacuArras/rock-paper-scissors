import { rtdb } from "./rtdb";
import { ref, onValue, get, off } from "firebase/database";
import { Router } from "@vaadin/router";
const API_BASE_URL = process.env.BACKEND_URL || "http://127.0.0.1:3000";
type Plays = "rock" | "paper" | "scissors" | "";

const state = {
    data: {
        userName: "",
        mail: "",
        userId: "",
        online: false,
        currentGame: {
            roomId: "",
            firebaseId: "",
            owner: false,
            opponentName: "Oponente",
            playerReady: false,
            opponentReady: false,
            playerPlay: "",
            opponentPlay: "",
        },
        history: [],
    },
    listeners: [],

    getState() {
        return this.data;
    },

    setState(newState) {
        this.data = newState;

        for (const cb of this.listeners) {
            cb();
        };
    },

    setMail(mail: string) {
        const currentState = this.getState();
        currentState.mail = mail;
        this.setState(currentState);
    },

    setName(userName: string) {
        const currentState = this.getState();
        currentState.userName = userName;
        this.setState(currentState);
    },

    setRoomId(roomId: string) {
        const currentState = this.getState();
        currentState.currentGame.roomId = roomId;
        this.setState(currentState);
    },

    login(callback?) {
        const currentState = this.getState();
        if (currentState.mail) {
            fetch(API_BASE_URL + "/login", {
                method: "post",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    mail: currentState.mail
                })
            }).then(res => {
                return res.json();
            }).then(data => {
                currentState.userId = data.id;
                currentState.userName = data.name;
                currentState.online = true;
                this.setState(currentState);
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("No hay un mail registrado.");
        };
    },

    signup(callback?) {
        const currentState = this.getState();
        if (currentState.mail && currentState.userName) {
            fetch(API_BASE_URL + "/signup", {
                method: "post",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    mail: currentState.mail,
                    name: currentState.userName
                })
            }).then(res => {
                return res.json();
            }).then(data => {
                currentState.userId = data.id;
                currentState.online = true;
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un error con el formulario, por favor volvé a intentar.")
        };
    },

    createGameRoom(callback?) {
        const currentState = this.getState();

        if (currentState.userId) {
            fetch(API_BASE_URL + "/rooms", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ userId: currentState.userId, userName: currentState.userName })
            }).then(res => {
                return res.json();
            }).then(data => {
                currentState.currentGame.firebaseId = data.firebaseId;
                currentState.currentGame.roomId = data.firestoreId;
                currentState.currentGame.owner = true;

                this.setState(currentState);
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("El usuario no inició sesión correctamente.");
        };
    },

    joinGameRoom(callback?) {
        const currentState = this.getState();

        if (currentState.userId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.roomId + "?userId=" + currentState.userId, {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ userName: currentState.userName })
            }).then(res => {
                if (res.status === 401) {
                    console.log("La sala ya está llena");
                } else {
                    return res.json();
                }
            }).then(data => {
                currentState.currentGame.firebaseId = data.firebaseId;
                this.setState(currentState);
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("El usuario no inició sesión correctamente.");
        };
    },

    /* Remueve la clase "loaded" del spinner para que la página cargue sin ser vista */
    spinnerLoading() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.style.display = "fixed";
        spinnerContainer!.classList.remove("loaded");
    },


    getOpponentName(callback?) {
        const currentState = this.getState();
        const currentGameRef = ref(rtdb, "/rooms/" + currentState.currentGame.firebaseId + "/currentGame");
        get(currentGameRef).then(snapshot => {
            const opponentUserId = Object.keys(snapshot.val()).find(player => player !== currentState.userId) as any;
            const opponentData = snapshot.child(opponentUserId).val();
            currentState.currentGame.opponentName = opponentData.name;
            this.setState(currentState);
            if (callback) {
                callback();
            };

            onValue(currentGameRef, snapshot => {
                const currentState = this.getState();
                const opponentData = snapshot.child(opponentUserId).val();
                if (currentState.currentGame.playerReady && opponentData.ready) {
                    off(currentGameRef, "value");
                    this.spinnerLoading();
                    Router.go("/game");
                }
            });
        });
    },

    changeReadyStatus(callback?) {
        const currentState = this.getState();

        if (currentState.userId && currentState.currentGame.roomId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.roomId + "/ready", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ userId: currentState.userId })
            }).then(res => {
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un problema...");
        };
    },

    /* Recibo una jugada del tipo "Plays", la guardo en el state y la envió a firebase. */
    setPlay(play: Plays, callback?) {
        const currentState = this.getState();
        currentState.currentGame.playerPlay = play;
        this.setState(currentState);

        if (currentState.userId && currentState.currentGame.roomId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.roomId + "/play", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ userId: currentState.userId, play })
            }).then(res => {
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un problema...");
        };
    },

    /* Primero saco "captura" de la room en firebase para obtener el id de el oponente. Ya al tenerlo, me quedo escuchando
        a cualquier cambio que suceda. Principalmente para obtener su play, guardarla en el state y pasados 4 segundos, dejar de
            escuchar los cambios. */
    getOpponentPlay() {
        const currentState = this.getState();
        const currentGameRef = ref(rtdb, "/rooms/" + currentState.currentGame.firebaseId + "/currentGame");

        get(currentGameRef).then(snapshot => {
            const opponentUserId = Object.keys(snapshot.val()).find(player => player !== currentState.userId) as any;
            const opponentDataRef = ref(rtdb, "/rooms/" + currentState.currentGame.firebaseId + "/currentGame/" + opponentUserId);

            onValue(opponentDataRef, snapshot => {
                const opponentData = snapshot.val().play;
                currentState.currentGame.opponentPlay = opponentData;
                this.setState(currentState);
            });

            setTimeout(() => {
                off(opponentDataRef, "value");
            }, 10000);
        });
    },

    /* Obtiene dentro de los parámetros ambas jugadas y decide el resultado de la partida. */
    whoWins(playerPlay, opponentPlay) {
        const currentState = this.getState();

        const win = [
            playerPlay === "scissors" && opponentPlay === "paper",
            playerPlay === "rock" && opponentPlay === "scissors",
            playerPlay === "paper" && opponentPlay === "rock"
        ];

        const lose = [
            playerPlay === "scissors" && opponentPlay === "rock",
            playerPlay === "rock" && opponentPlay === "paper",
            playerPlay === "paper" && opponentPlay === "scissors"
        ];

        if (win.includes(true)) {
            return 1;
        } else if (lose.includes(true)) {
            return -1;
        } else if (currentState.currentGame.playerPlay === "") {
            return "player";
        } else if (currentState.currentGame.opponentPlay === "") {
            return "opponent";
        } else {
            return 0;
        };
    },

    subscribe(callback: (any) => any) {
        this.listeners.push(callback);
    }
};


export { state };