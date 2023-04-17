import { Router } from "@vaadin/router";
import { state } from "../../state";
type Plays = "rock" | "paper" | "scissors" | "";

class GamePage extends HTMLElement {
    play: Plays = "";
    connectedCallback() {
        const currentState = state.getState();

        /* Verifico que el usuario haya iniciado sesión y haya entrado en una room antes de  
             entrar a esta página, si no lo hizo lo redirecciono a su respectiva página.*/
        if (currentState.userId.length > 1) {
            if (currentState.currentGame.roomId.length > 1) {
                /* Me quedo escuchando a la firebase con la función "getOpponentPlay" para escuchar la jugada del oponente. */
                state.getOpponentPlay();
                this.render();
            } else {
                Router.go("/home");
                console.error("Ocurrió un error al entrar en la room.");
            };
        } else {
            Router.go("/login");
            console.error("Ocurrió un error en el inicio de sesión.");
        };
    };

    addListeners() {
        /* Obtengo las manos para poder darle un estilo inicial de "noSeleccionada", así se ven grises. */
        const playerHands = this.querySelector(".playerHands")?.shadowRoot?.querySelectorAll(".hand");
        const opponentHands = this.querySelector(".opponentHands")?.shadowRoot?.querySelectorAll(".hand");
        for (const h of playerHands!) {
            h.classList.add("noSeleccionada");
        };
        for (const h of opponentHands!) {
            h.classList.add("noSeleccionada");
        };

        /* Obtengo nuevamente las manos para que al hacerles click se vean como seleccionadas,
            además de guardar en la propiedad "play" la jugada seleccionada. */
        this.querySelector(".playerHands")?.shadowRoot?.querySelector(".playerHands")?.addEventListener("click", e => {
            const target = e.target as any;
            const scissors = this.querySelector(".playerHands")?.shadowRoot?.querySelector("#scissors");
            const paper = this.querySelector(".playerHands")?.shadowRoot?.querySelector("#paper");
            const rock = this.querySelector(".playerHands")?.shadowRoot?.querySelector("#rock");

            if (target.id === "scissors") {
                scissors?.classList.toggle("seleccionada");
                paper?.classList.remove("seleccionada");
                rock?.classList.remove("seleccionada");
            } else if (target.id === "paper") {
                paper?.classList.toggle("seleccionada");
                scissors?.classList.remove("seleccionada");
                rock?.classList.remove("seleccionada");
            } else if (target.id === "rock") {
                rock?.classList.toggle("seleccionada");
                paper?.classList.remove("seleccionada");
                scissors?.classList.remove("seleccionada");
            };

            this.play = target.id;
        });
    };

    /* Inicializo el timer para que pasados poco más de 3 segundos, guarde la jugada seleccionada y muestre las manos 
        elegidas de ambos jugadores, además de redireccionar a la página de "/result".  */
    counterTimer(counterEl) {
        let counterNum = 0;

        const interval = setInterval(() => {
            counterNum++;
            counterEl!.innerHTML = `${counterNum}`;

            if (counterNum > 2) {
                clearInterval(interval);
                state.setPlay(this.play, () => {
                    counterEl.style.display = "none";

                    const interValForOpponent = setInterval(() => {
                        const currentState = state.getState();
                        const currentOpponentPlay = currentState.currentGame.opponentPlay;
                        if (currentOpponentPlay !== "" && currentState.currentGame.playerPlay !== "") {
                            clearInterval(interValForOpponent);
                            const found = document.querySelector(".opponentHands")?.shadowRoot?.querySelector("#" + currentOpponentPlay);
                            found?.classList.add("seleccionada");
                        };
                    }, 1000);

                    /* Agrego otro intervalo de tiempo para que se muestren ambas jugadas por 3 segundo y medio. */
                    const anotherInterval = setInterval(() => {
                        state.spinnerLoading();
                        Router.go("/result");
                        clearInterval(anotherInterval);
                    }, 3500);
                });
            };
        }, 1500);
    };

    render() {
        this.innerHTML = `
            <hands-comp type="bigHand" class="opponentHands"></hands-comp> 
            <div class="counter-cont">0</div>
            <hands-comp type="bigHand" class="playerHands"></hands-comp>
        `;

        this.counterTimer(this.querySelector(".counter-cont"));

        /* Al activarse la función render y haber ejecutado y descargado el html quito el spinner
             para revelar el contenido de la página. */
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");

        this.addListeners();
    };
};
customElements.define("game-page", GamePage);