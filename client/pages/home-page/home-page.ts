import { Router } from "@vaadin/router";

class HomePage extends HTMLElement {
    connectedCallback() {
        this.render();

    };
    addListeners() {

    }

    render() {
        this.innerHTML = `
            <div class="title">
                <text-comp type="title">Piedra </text-comp>
                <br> 
                <text-comp type="title">Papel </text-comp><text-comp type="span">ó</text-comp>
                <br>
                <text-comp type="title">Tijeras</text-comp>
            </div>
            <button-comp id="buttonLogin" class="button">Nuevo juego</button-comp>
            <button-comp id="buttonSignup" class="button">Unirse a un juego</button-comp>

            <hands-comp></hands-comp>
        `;

        this.addListeners();
    };
};
customElements.define("home-page", HomePage);