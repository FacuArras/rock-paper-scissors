import { Router } from "@vaadin/router";
import { state } from "../../state";

class HomePage extends HTMLElement {
    connectedCallback() {
        const currentState = state.getState();

        /* Verifico que el usuario haya iniciado sesión antes de entrar a esta página, si no lo hizo 
             lo redirecciono a "/login" */
        if (currentState.userId.length > 1) {
            this.render();
        } else {
            Router.go("/login");
            console.error("Ocurrió un error en el inicio de sesión.");
        };
    };

    addListeners() {
        /* Obtengo los botones y les agrego un listener para realizar las respectivas acciones de cada uno cuando se les haga click.  */
        const buttonNewGame = this.querySelector("#buttonNewGame") as any;
        const buttonJoinGame = this.querySelector("#buttonJoinGame") as any;
        const buttonLogOut = this.querySelector("#buttonLogOut") as any;
        const joinGameForm = this.querySelector(".joinGameForm") as any;

        buttonNewGame.addEventListener("click", e => {
            state.spinnerLoading();
            state.createGameRoom(() => {
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
                    Router.go("/play");
                });
            });
        });

        /* Si el usuario quiere cerrar sesión, al tocar este botón se borra toda información del usuario tanto 
             en el local y session storage como en el state. Además de activar el spinner y redireccionar a "/login".  */
        buttonLogOut.addEventListener("click", e => {
            const currentState = state.getState();

            localStorage.removeItem("rock-paper-scissors");
            sessionStorage.removeItem("rock-paper-scissors");
            currentState.userId = "";
            currentState.mail = "";
            currentState.online = false;
            currentState.userName = "";
            state.setState(currentState);

            state.spinnerLoading();
            Router.go("/login");
        });
    };

    render() {
        this.classList.add("main-page");

        this.innerHTML = `
            <div class="title">
                <h1>
                    Piedra 
                    <br>
                    Papel <span class="title__span">ó</span>
                    <br>
                    Tijeras
                </h1>
            </div>

            <div class="button-container">
                <form class="joinGameForm">
                    <input type="text" name="roomId" placeholder="código" class="roomIdInput" required>
                    <button type="submit" id="buttonFormLogin">¡Unirse!</button>
                </form>
                <button-comp id="buttonNewGame" class="button">Nuevo juego</button-comp>
                <button-comp id="buttonJoinGame" class="button">Unirse a un juego</button-comp>
                <button-comp id="buttonLogOut" class="button">Cerrar sesión</button-comp>
            </div>

            <div class="hands-container">
                <hands-comp class="menuHands"></hands-comp>
            </div>
        `;

        /* Al activarse la función render y haber ejecutado y descargado el html quito el spinner
             para revelar el contenido de la página. */
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");

        this.addListeners();
    };
};
customElements.define("home-page", HomePage);