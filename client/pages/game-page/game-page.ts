import { Router } from "@vaadin/router";
import { state } from "../../state";
type Plays = "rock" | "paper" | "scissors" | "";

class GamePage extends HTMLElement {
    play: Plays = "";
    connectedCallback() {
        /* Me quedo escuchando a los cambios que se producen en la play del oponente en la firebase */
        state.getOpponentPlay();
        this.render();
    };

    addListeners() {
        /* Obtengo las manos para poder darle un estilo inicial de "noSeleccionada", así se ven grises */
        const playerHands = this.querySelector(".playerHands")?.shadowRoot?.querySelectorAll(".hand");
        const computerHands = this.querySelector(".computerHands")?.shadowRoot?.querySelectorAll(".hand");
        for (const h of playerHands!) {
            h.classList.add("noSeleccionada");
        };
        for (const h of computerHands!) {
            h.classList.add("noSeleccionada");
        };

        /* Obtengo nuevamente las manos para que al hacerles click se vean como seleccionadas,
            además de guardar en la propiedad "play" la jugada seleccionada */
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
        elegidas de ambos jugadores, además de redireccionar a la página de resultados.  */
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
                        if (currentOpponentPlay !== "") {
                            console.log("Jugada del oponente desde gamePage 2: " + currentState.currentGame.opponentPlay);
                            clearInterval(interValForOpponent);
                            const found = document.querySelector(".computerHands")?.shadowRoot?.querySelector("#" + currentOpponentPlay);
                            found?.classList.add("seleccionada");
                        };
                    }, 1000)

                    /* Agrego otro intervalo de tiempo para que se muestren ambas jugadas por 1 segundo y medio */
                    const anotherInterval = setInterval(() => {
                        state.spinnerLoading();
                        Router.go("/result");
                        clearInterval(anotherInterval);
                    }, 3500)
                });
            }
        }, 1500);
    };

    render() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");

        this.innerHTML = `
            <hands-comp type="bigHand" class="computerHands"></hands-comp> 
            <div class="counter-cont">0</div>
            <hands-comp type="bigHand" class="playerHands"></hands-comp>
        `;

        this.counterTimer(this.querySelector(".counter-cont"));
        this.addListeners();
    };
};
customElements.define("game-page", GamePage);