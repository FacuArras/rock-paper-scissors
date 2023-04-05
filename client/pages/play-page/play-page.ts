import { Router } from "@vaadin/router";
import { state } from "../../state";

class PlayPage extends HTMLElement {
    opponentName: String;
    connectedCallback() {
        state.getOpponentName(() => {
            const currentState = state.getState();
            this.opponentName = currentState.currentGame.opponentName;
            this.render();
        });
    };

    addListeners() {
        const playInstructionsEl = this.querySelector("#playInstructions") as any;
        const buttonPlayGameEl = this.querySelector("#buttonPlayGame") as any;
        const playWaitEl = this.querySelector("#playWait") as any;

        buttonPlayGameEl!.addEventListener("click", e => {
            state.changeReadyStatus();
            const currentState = state.getState();
            currentState.currentGame.playerReady = true;
            currentState.currentGame.playerPlay = "";
            state.setState(currentState);
            playInstructionsEl.style.display = "none";
            buttonPlayGameEl.style.display = "none";
            playWaitEl.style.display = "block";
        });
    };

    render() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");
        const currentState = state.getState();

        this.innerHTML = `
            <div class="roomInfo">
                <div class="roomInfo__players">
                    <p class="roomInfo__players__player">${currentState.userName}: 0</p>
                    <p class="roomInfo__players__opponent">${this.opponentName}: 0</p>
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
            <button-comp id="buttonPlayGame" class="button">¡Jugar!</button-comp>
            <hands-comp></hands-comp>
        `;

        this.addListeners();
    };
};
customElements.define("play-page", PlayPage);