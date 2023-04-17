import { Router } from "@vaadin/router";
import { state } from "../../state";
const winImage = require("url:../../img/win-img.svg");
const loseImage = require("url:../../img/lose-img.svg");
const tieImage = require("url:../../img/tie-img.svg");

class ResultsPage extends HTMLElement {
    connectedCallback() {
        const currentState = state.getState();

        /* Verifico que el usuario haya iniciado sesión y haya entrado en una room antes de  
             entrar a esta página, si no lo hizo lo redirecciono a su respectiva página.*/
        if (currentState.userId.length > 1) {
            if (currentState.currentGame.roomId.length > 1) {
                state.pushHistory();
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
        /* Escucho a que botón le hacen click para redireccionar a sus respectivas páginas. */
        const playAgainEl = this.querySelector(".play-again-button");
        const menuEl = this.querySelector(".menu-button");

        playAgainEl?.addEventListener("click", e => {
            state.spinnerLoading();
            Router.go("/play");
        });

        menuEl?.addEventListener("click", e => {
            state.spinnerLoading();
            Router.go("/home");
        });
    };

    render() {
        const currentState = state.getState();

        /* Dependiendo del resultado, se muestra una página diferente. */
        if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === 1) {
            this.innerHTML = `
                <div class="results-background results-background--win">
                    <img class="results-star--win" src="${winImage}" alt="winStar">
                    <div class="results">
                        <h3 class="resultTitle">Resultados</h3>
                        <h4 class="resultText">Vos: ${state.getHistoryOfPoints().player}</h4>
                        <h4 class="resultText">${currentState.currentGame.opponentName}: ${state.getHistoryOfPoints().opponent}</h4>    
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `;
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === -1) {
            this.innerHTML = `
                <div class="results-background results-background--lose">
                    <img class="results-star--win" src="${loseImage}" alt="loseStar">
                    <div class="results">
                        <h3 class="resultTitle">Resultados</h3>
                        <h4 class="resultText">Vos: ${state.getHistoryOfPoints().player}</h4>
                        <h4 class="resultText">${currentState.currentGame.opponentName}: ${state.getHistoryOfPoints().opponent}</h4>     
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `;
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === 0) {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <img class="results-star--win tie-image" src="${tieImage}" alt="loseStar">
                    <div class="results">
                        <h3 class="resultTitle">Resultados</h3>
                        <h4 class="resultText">Vos: ${state.getHistoryOfPoints().player}</h4>
                        <h4 class="resultText">${currentState.currentGame.opponentName}: ${state.getHistoryOfPoints().opponent}</h4>  
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `;
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === "player") {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <h3 class="noSelectionTitle resultTitle">No te olvides de elegir una mano!!!</h3>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `;
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === "opponent") {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <h3 class="noSelectionTitle resultTitle">${currentState.currentGame.opponentName} se olvidó de elegir...</h3>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `;
        };

        /* Al activarse la función render y haber ejecutado y descargado el html quito el spinner
             para revelar el contenido de la página. */
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");

        this.addListeners();
    };
};
customElements.define("results-page", ResultsPage);