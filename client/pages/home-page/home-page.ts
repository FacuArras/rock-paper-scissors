import { Router } from "@vaadin/router";
import { state } from "../../state";

class HomePage extends HTMLElement {
    connectedCallback() {
        this.render();
    };

    addListeners() {
        const buttonNewGame = this.querySelector("#buttonNewGame") as any;
        const buttonJoinGame = this.querySelector("#buttonJoinGame") as any;
        const joinGameForm = this.querySelector(".joinGameForm") as any;

        buttonNewGame.addEventListener("click", e => {
            state.spinnerLoading();
            state.createGameRoom(() => {
                console.log(state.getState());
                Router.go("/wait-room");
            });
        });

        buttonJoinGame.addEventListener("click", e => {
            buttonNewGame.style.display = "none";
            buttonJoinGame.style.display = "none";
            joinGameForm.style.display = "flex";

            joinGameForm.addEventListener("submit", e => {
                const target = e.target as any;
                e.preventDefault();
                state.spinnerLoading();
                state.setRoomId(target.roomId.value);
                state.joinGameRoom(() => {
                    console.log(state.getState());
                    Router.go("/play");
                });
            });
        });
    };

    render() {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");
        this.innerHTML = `
            <div class="title">
                <text-comp type="title">Piedra </text-comp>
                <br> 
                <text-comp type="title">Papel </text-comp><text-comp type="span">ó</text-comp>
                <br>
                <text-comp type="title">Tijeras</text-comp>
            </div>
            <div class="button-container">
                <form class="joinGameForm">
                    <input type="text" name="roomId" placeholder="código" class="roomIdInput" required>
                    <button type="submit" id="buttonFormLogin">
                        <text-comp type="button">¡Unirse!</text-comp>
                    </button>
                </form>
                <button-comp id="buttonNewGame" class="button">Nuevo juego</button-comp>
                <button-comp id="buttonJoinGame" class="button">Unirse a un juego</button-comp>
            </div>
            <hands-comp></hands-comp>
        `;

        this.addListeners();
    };
};
customElements.define("home-page", HomePage);