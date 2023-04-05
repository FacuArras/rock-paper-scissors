import { Router } from "@vaadin/router";
import { state } from "../../state";
import { rtdb } from "../../rtdb";
import { ref, onValue } from "firebase/database";
const winImage = require("url:../../img/win-img.svg");
const loseImage = require("url:../../img/lose-img.svg");
const tieImage = require("url:../../img/tie-img.svg");

class ResultsPage extends HTMLElement {
    connectedCallback() {
        this.render();
        const currentState = state.getState();
        currentState.currentGame.playerReady = false;
        state.setState(currentState);
    };

    addListeners() {
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
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");
        const currentState = state.getState();

        if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === 1) {
            this.innerHTML = `
                <div class="results-background results-background--win">
                    <img class="results-star--win" src="${winImage}" alt="winStar">
                    <div class="results">
                        <text-comp type="resultTitle">Resultados</text-comp>
                        <text-comp type="resultText">Vos:</text-comp>
                        <text-comp type="resultText">Máquina: </text-comp>    
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                    </div>
                    `
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === -1) {
            this.innerHTML = `
                    <div class="results-background results-background--lose">
                    <img class="results-star--win" src="${loseImage}" alt="loseStar">
                    <div class="results">
                    <text-comp type="resultTitle">Resultados</text-comp>
                    <text-comp type="resultText">Vos:</text-comp>
                    <text-comp type="resultText">Máquina: </text-comp>    
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === 0) {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <img class="results-star--win tie-image" src="${tieImage}" alt="loseStar">
                    <div class="results">
                        <text-comp type="resultTitle">Resultados</text-comp>
                        <text-comp type="resultText">Vos:</text-comp>
                        <text-comp type="resultText">Máquina: </text-comp>    
                    </div>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === "player") {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <text-comp class="noSelectionTitle" type="resultTitle">No te olvides de elegir una mano!!!</text-comp>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `
        } else if (state.whoWins(currentState.currentGame.playerPlay, currentState.currentGame.opponentPlay) === "opponent") {
            this.innerHTML = `
                <div class="results-background results-background--tie">
                    <text-comp class="noSelectionTitle" type="resultTitle">${currentState.currentGame.opponentName} se olvidó de elegir...</text-comp>
                    <button-comp class="play-again-button">Volver a jugar</button-comp>
                    <button-comp class="menu-button">Menu principal</button-comp>
                </div>
            `
        }

        this.addListeners();
    };
};
customElements.define("results-page", ResultsPage);