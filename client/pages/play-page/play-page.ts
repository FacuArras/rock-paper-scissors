import { state } from "../../state";
import { Router } from "@vaadin/router";

class PlayPage extends HTMLElement {
    opponentName: String;
    connectedCallback() {
        const currentState = state.getState();

        /* Verifico que el usuario haya iniciado sesión y haya entrado en una room antes de  
             entrar a esta página, si no lo hizo lo redirecciono a su respectiva página.*/
        if (currentState.userId.length > 1) {
            if (currentState.currentGame.roomId.length > 1) {
                /* Al entrar seteo las propiedades "ready"  del state y de la firebase para que
                     se inicialicen en false y asi no ocurran erorres con la función "changeReadyStatus". */
                state.changeReadyStatus(false);

                /* La funcion "getOpponentReady" me avisa cuando la prpiedad "ready" del oponente cambie y si es true
                     en el callback me activa el elemento "opponentReadyEl". */
                state.getOpponentReady(() => {
                    const opponentReadyEl = this.querySelector(".roomInfo__players__opponent-ready__container") as any;
                    opponentReadyEl.style.display = "block";
                });

                this.opponentName = currentState.currentGame.opponentName;
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
        const playInstructionsEl = this.querySelector("#playInstructions") as any;
        const buttonPlayGameEl = this.querySelector("#buttonPlayGame") as any;
        const menuButtonEl = this.querySelector(".menu-button") as any;
        const playWaitEl = this.querySelector("#playWait") as any;
        const playerReadyEl = this.querySelector(".roomInfo__players__player-ready__container") as any;

        /* Al hacer click en el botón de jugar se ejecuta la función "changeReadyStatus" para que setee el ready
             en true y así empezar el juego. */
        buttonPlayGameEl!.addEventListener("click", e => {
            state.changeReadyStatus(true);

            playerReadyEl.style.display = "block";
            playInstructionsEl.style.display = "none";
            buttonPlayGameEl.style.display = "none";
            menuButtonEl.style.display = "none";
            playWaitEl.style.display = "block";
        });

        menuButtonEl.addEventListener("click", e => {
            state.spinnerLoading();
            Router.go("/home");
        });
    };

    render() {
        const currentState = state.getState();

        this.innerHTML = `
            <div class="roomInfo">
                <div class="roomInfo__players">
                    <div class="roomInfo__players__player__container">
                        <p class="roomInfo__players__player">${currentState.userName}: ${state.getHistoryOfPoints().player}</p>
                        <div class="roomInfo__players__player-ready__container">
                            <p class="roomInfo__players__player--ready">¡Listo!</p>
                        </div>
                    </div>
                    <div class="roomInfo__players__player__container">
                        <p class="roomInfo__players__opponent">${this.opponentName}: ${state.getHistoryOfPoints().opponent}</p>
                        <div class="roomInfo__players__opponent-ready__container">
                            <p class="roomInfo__players__player--ready">¡Listo!</p>
                        </div>
                    </div>
                </div>
                <div class="roomInfo__room">
                    <p class="roomInfo__roomName">Sala</p>
                    <p class="roomInfo__roomId">${currentState.currentGame.roomId}</p>
                </div>
            </div>
            <p id="playInstructions" class="roomMainText playMainText">
                Presioná jugar y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.
            </p>
            <p id="playWait" class="roomMainText playMainText">
                Esperando a que ${currentState.currentGame.opponentName} presione jugar...
            </p>
            <div class="button-container">
                <button-comp id="buttonPlayGame" class="button">¡Jugar!</button-comp>
                <button-comp class="menu-button">Menu principal</button-comp>
            </div>
            <hands-comp class="menuHands"></hands-comp>
        `;

        /* Al activarse la función render y haber ejecutado y descargado el html quito el spinner
             para revelar el contenido de la página. */
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");

        this.addListeners();
    };
};
customElements.define("play-page", PlayPage);