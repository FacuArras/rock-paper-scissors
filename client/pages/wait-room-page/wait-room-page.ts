import { Router } from "@vaadin/router";
import { state } from "../../state";
import { rtdb } from "../../rtdb";
import { ref, onValue, off } from "firebase/database";

class WaitRoomPage extends HTMLElement {
    connectedCallback() {
        this.render();
    };

    addListeners() {
        const roomRef = ref(rtdb, "/rooms/" + state.getState().currentGame.firebaseId + "/currentGame");

        let isFirstChange = true;

        onValue(roomRef, snapshot => {
            if (isFirstChange) {
                isFirstChange = false;
            } else {
                off(roomRef, "value");
                state.spinnerLoading();
                Router.go("/play");
            };
        });
    };

    render() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");
        const currentState = state.getState();
        this.innerHTML = `
            <div class="wait-room__container">
                <p class="roomMainText">Compartí el código</p>
                <h2 class="roomMainText__roomId">${currentState.currentGame.roomId}</h2>
                <p class="roomMainText">Con tu contrincante</p>
            </div>
            <hands-comp></hands-comp>
        `;

        this.addListeners();
    };
};
customElements.define("wait-room-page", WaitRoomPage);