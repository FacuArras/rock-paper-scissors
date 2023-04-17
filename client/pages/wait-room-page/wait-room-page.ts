import { Router } from "@vaadin/router";
import { state } from "../../state";

class WaitRoomPage extends HTMLElement {
    connectedCallback() {
        const currentState = state.getState();

        /* Verifico que el usuario haya iniciado sesión y haya entrado en una room antes de  
             entrar a esta página, si no lo hizo lo redirecciono a su respectiva página.*/
        if (currentState.userId.length > 1) {
            if (currentState.currentGame.roomId.length > 1) {
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
        state.getJoinGame();
    };

    render() {
        const currentState = state.getState();

        this.innerHTML = `
            <div class="wait-room__container">
                <p class="roomMainText">Compartí el código</p>
                <h2 class="roomMainText__roomId">${currentState.currentGame.roomId}</h2>
                <p class="roomMainText">Con tu contrincante</p>
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
customElements.define("wait-room-page", WaitRoomPage);