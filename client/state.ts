import { rtdb } from "./rtdb";
import { ref, onValue, get } from "firebase/database";
const API_BASE_URL = process.env.PORT || "http://127.0.0.1:3000";
type Plays = "rock" | "paper" | "scissors";

const state = {
    data: {
        roomId: "",
        userName: "",
        mail: "",
        userId: "",
        opponentName: "",
        rtdbData: {},
        currentGame: {
            playerPlay: "",
            opponentPlay: ""
        },
        gameReady: false,
        playerReady: false,
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
                if (callback) {
                    callback();
                };
            });
        } else {
            console.error("Ha ocurrido un error con el formulario, por favor volvé a intentar.")
        };
    },

    subscribe(callback: (any) => any) {
        this.listeners.push(callback);
    }
};


export { state };