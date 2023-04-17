import "./router";
import "./pages/home-page/home-page";
import "./pages/login-page/login-page";
import "./pages/wait-room-page/wait-room-page";
import "./pages/play-page/play-page";
import "./pages/game-page/game-page";
import "./pages/results-page/results-page";
import "./components/button-component";
import "./components/hands-component";
import { state } from "./state";

(function () {
    state.userInit();
    state.init();
    window.addEventListener("load", e => {
        const spinnerContainer = document.getElementById("spinner-container");
        spinnerContainer!.classList.add("loaded");
    });
})();
