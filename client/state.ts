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
        error: "",
        currentGame: {
            roomId: "",
            firebaseId: "",
            owner: "",
            opponentName: "Oponente",
            opponentId: "",
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

        sessionStorage.setItem("rock-paper-scissors", JSON.stringify(newState));
    },

    /* Obtiene la data de session storage y la guarda en el state. */
    init() {
        const localData = sessionStorage.getItem("rock-paper-scissors");
        if (JSON.parse(localData!)) {
            this.setState(JSON.parse(localData!));
        };
    },

    /* Obtiene la data del usuario de local stroge y la guarda en el state. */
    userInit() {
        const localData = localStorage.getItem("rock-paper-scissors");
        const currentState = this.getState();

        if (JSON.parse(localData!)) {
            const dataParseada = JSON.parse(localData!);
            currentState.mail = dataParseada.mail;
            currentState.online = dataParseada.online;
            currentState.userId = dataParseada.userId;
            currentState.userName = dataParseada.userName;
            this.setState(currentState);
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
        sessionStorage.setItem("roomId", roomId);
    },

    /* Si en el state hay un mail registrado, hago un fetch obteniendo la data del usuario previamente
         registrado y guardandola en el state. */
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

    /* Si en el state hay un nombre y mail registrados, hago un fetch obteniendo el id del usuario creado. */
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
                this.setState(currentState);

                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un error con el formulario, por favor volvé a intentar.")
        };
    },

    /* Si en el state está guardado el id del usuario, hago un fetch creando una nueva sala de juego y obteniendo su data. */
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
                currentState.currentGame.owner = currentState.userId;
                currentState.history = [...Object.values(data.history)]
                this.setState(currentState);

                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("El usuario no inició sesión correctamente.");
        };
    },

    /* Si en el state está guardado el id del usuario, hago un fetch obteniendo toda la data de 
         la sala de juego previamente creada. */
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
                    console.error("La sala ya está llena");
                    currentState.error = "La sala de juego está llena...";
                    this.setState(currentState);
                } else {
                    return res.json();
                };
            }).then(data => {
                callback();
                currentState.currentGame.firebaseId = data.firebaseId;
                currentState.currentGame.opponentName = data.opponentName;
                currentState.currentGame.opponentId = data.opponentId;
                currentState.currentGame.owner = data.owner;
                currentState.history = [...Object.values(data.history)]
                this.setState(currentState);
            });
        } else {
            console.error("El usuario no inició sesión correctamente.");
        };
    },

    /* Me quedo escuchando a los cambios en la sala de juego hasta que el oponente se una para así redireccionar a "/play". */
    getJoinGame() {
        /* Hago referencia al currentGame en firebase. */
        const roomRef = ref(rtdb, "/rooms/" + state.getState().currentGame.firebaseId + "/currentGame");

        /* Inicializo la variable "isFirstChange" en true para que cuando haya un cambio en firebase, pase a ser false, para que así
                escuche el segundo cambio que se haga. Porque el primero es el mío que indica que estoy online, y el segundo es el del oponente
                    que indica que está online. */
        let isFirstChange = true;

        onValue(roomRef, snapshot => {
            if (isFirstChange) {
                isFirstChange = false;
            } else {
                const currentState = state.getState();
                const playersVal = snapshot.val();
                /* Obtengo y guardo en el state el id de usuario del oponente buscando el id que no sea mío entre los jugadores que están en la sala de juego. */
                const opponentUserId = Object.keys(playersVal).find(player => player !== currentState.userId) as any;
                currentState.currentGame.opponentId = opponentUserId;

                const opponentData = playersVal[opponentUserId];
                currentState.currentGame.opponentName = opponentData.name;

                this.setState(currentState);
                /* Una vez que se escuche el segundo cambio, dejo de escuchar todo cambio en firebase y redirecciono hacia "/play". */
                off(roomRef, "value");
                state.spinnerLoading();
                Router.go("/play");
            };
        });
    },

    /* Remueve la clase "loaded" del spinner para que se muestre y la página cargue sin ser vista. */
    spinnerLoading() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.style.display = "fixed";
        spinnerContainer!.classList.remove("loaded");
    },

    /* Obtengo el nombre del oponente sacando una única captura a la base de datos realtime, además de quedarme escuchando a los cambios que se realicen
         para así escuchar cuando el oponente cambie el estado de "ready" a true y redireccionar a "/game". */
    getOpponentReady(callback) {
        const currentState = this.getState();
        const opponentDataRef = ref(rtdb, "/rooms/" + currentState.currentGame.firebaseId + "/currentGame");
        onValue(opponentDataRef, snapshot => {
            const currentState = this.getState();
            const opponentData = snapshot.val()[currentState.currentGame.opponentId];

            if (opponentData.ready) {
                currentState.currentGame.opponentReady = true;
                this.setState(currentState);
                callback();
            };
            if (currentState.currentGame.playerReady && opponentData.ready) {
                off(opponentDataRef, "value");
                this.spinnerLoading();
                Router.go("/game");
            };
        });
    },

    /* Primero cambio los valores del state de "playerReady" a true y "playerPlay" a "", luego verifico si
         tengo guardado el id del usuario y el id de la sala para hacer un fetch y cambiar mi estado de "ready" en firebase. */
    changeReadyStatus(ready, callback?) {
        const currentState = this.getState();
        currentState.currentGame.playerReady = ready;
        currentState.currentGame.playerPlay = "";
        this.setState(currentState);

        if (currentState.userId && currentState.currentGame.roomId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.roomId + "/ready", {
                method: "put",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ userId: currentState.userId, ready })
            }).then(res => {
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un problema...");
        };
    },

    /* Primero cambio el valor de mi jugada en el state con la jugada que me pasen entre los parámetros, luego verifico si
         tengo gurdado en el state el id de firebase y el id del usuario para hacer un fetch y cambiar el valor de la jugada
             en firebase.  */
    setPlay(play: Plays, callback?) {
        const currentState = this.getState();
        currentState.currentGame.playerPlay = play;
        this.setState(currentState);

        if (currentState.currentGame.firebaseId, currentState.userId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.roomId + "/play", {
                method: "put",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    firebaseId: currentState.currentGame.firebaseId,
                    userId: currentState.userId,
                    play
                })
            }).then(res => {
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un problema...");
        };
    },

    /* Mee quedo escuchando a cualquier cambio que suceda en la sala de juego, principalmente para obtener la play del oponente, 
         guardarla en el state y pasados 10 segundos, dejar de escuchar los cambios. */
    getOpponentPlay() {
        const currentState = this.getState();
        const opponentDataRef = ref(rtdb, "/rooms/" + currentState.currentGame.firebaseId + "/currentGame/" + currentState.currentGame.opponentId);

        onValue(opponentDataRef, snapshot => {
            const opponentData = snapshot.val().play;
            currentState.currentGame.opponentPlay = opponentData;
            this.setState(currentState);
        });

        setTimeout(() => {
            off(opponentDataRef, "value");
        }, 10000);
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

    /* Primero obtengo del state el id de ambos jugadores, luego verifico que el "history" exista para que no ocurran errores,
         para finalmente ir por cada jugada guardada en el "history", ejecutando la función "whoWins" y dependiendo del resultado
             agrego los puntos al jugador o al oponente. */
    getHistoryOfPoints() {
        let player = 0;
        let opponent = 0;

        const currentState = this.getState();
        const playerId = currentState.userId;
        const opponentId = currentState.currentGame.opponentId;

        if (currentState.history != null) {
            for (const play of currentState.history) {
                if (this.whoWins(play[playerId], play[opponentId]) === 1) {
                    player++;
                } else if (this.whoWins(play[playerId], play[opponentId]) === -1) {
                    opponent++;
                }
            }
        }

        return {
            player,
            opponent
        };
    },


    /* Primero agrego al historial del state las jugadas que se realizaron en la partida luego, si el jugador es el creador de
         la sala, hago un fetch agregando las jugadas a la firebase. */
    pushHistory(callback?) {
        const currentState = this.getState();

        currentState.history.push({
            [currentState.userId]: currentState.currentGame.playerPlay,
            [currentState.currentGame.opponentId]: currentState.currentGame.opponentPlay
        });

        this.setState(currentState);
        if (currentState.currentGame.owner === currentState.userId) {
            fetch(API_BASE_URL + "/rooms/" + currentState.currentGame.firebaseId + "/history", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    userId: currentState.userId,
                    opponentId: currentState.currentGame.opponentId,
                    userPlay: currentState.currentGame.playerPlay,
                    opponentPlay: currentState.currentGame.opponentPlay
                })
            });
        };
    },

    subscribe(callback: (any) => any) {
        this.listeners.push(callback);
    }
};


export { state };