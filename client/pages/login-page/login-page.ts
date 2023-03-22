import { Router } from "@vaadin/router";
import { state } from "../../state";

class LoginPage extends HTMLElement {
    connectedCallback() {
        this.render();

        this.querySelector(".loginForm")?.addEventListener("submit", e => {

        });
    };
    addListeners() {
        const buttonLoginEl = this.querySelector("#buttonLogin") as any;
        const buttonSignupEl = this.querySelector("#buttonSignup") as any;
        const titleEl = this.querySelector(".title") as any;

        buttonLoginEl!.addEventListener("click", e => {
            const loginFormContainerEl = this.querySelector(".loginFormContainer") as any;
            titleEl.style.display = "none";
            buttonLoginEl.style.display = "none";
            buttonSignupEl.style.display = "none";
            loginFormContainerEl.style.display = "block";

            const loginFormEl = this.querySelector(".loginForm");

            loginFormEl!.addEventListener("submit", e => {
                e.preventDefault();
                const target = e.target as any;

                if (target.mail.value === target["confirm-mail"].value && target.mail.value.length > 0) {
                    state.setMail(target.mail.value);
                    state.login(() => {
                        console.log(state.getState());
                        Router.go("/home");
                    });
                } else {
                    console.log("Los correos electrónicos no coinciden.");
                };
            });
        });

        buttonSignupEl!.addEventListener("click", e => {
            const signupFormContainerEl = this.querySelector(".signupFormContainer") as any;
            titleEl.style.display = "none";
            buttonLoginEl.style.display = "none";
            buttonSignupEl.style.display = "none";
            signupFormContainerEl.style.display = "block";

            const signupFormEl = this.querySelector(".signupForm");

            signupFormEl!.addEventListener("submit", e => {
                e.preventDefault();
                const target = e.target as any;

                if (target.mail.value === target["confirm-mail"].value && target.mail.value.length > 0) {
                    state.setMail(target.mail.value);
                    state.setName(target.name.value);
                    state.signup(() => {
                        console.log(state.getState());
                        Router.go("/home");
                    });
                } else {
                    console.log("Los correos electrónicos no coinciden.");
                };
            });
        });
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
            <button-comp id="buttonLogin" class="button">Iniciar sesión</button-comp>
            <button-comp id="buttonSignup" class="button">Registrarse</button-comp>
            

            <div class="loginFormContainer">
                <text-comp type="bodyText" class="loginTitle">Bienvenido de vuelta!</text-comp>
                <form class="loginForm">
                    <label for="mail">Correo electrónico:</label>
                    <input type="email" name="mail" reqiured>

                    <label for="confirm-mail">Confirme el correo electrónico:</label>
                    <input type="email" name="confirm-mail" reqiured>

                    <label class="rememberLabel" for="remember">
                        Mantener sesión iniciada
                        <input type="checkbox" class="rememberInput" name="remember">
                    </label>

                    <button type="submit" id="buttonFormLogin">
                        <text-comp type="button">Iniciar sesión</text-comp>
                    </button>
                </form>
            </div>
            
            <div class="signupFormContainer">
                <text-comp type="bodyText" class="signupTitle">Bienvenido!</text-comp>
                <form class="signupForm">
                    <label for="name">Nombre:</label>
                    <input type="text" name="name" required>

                    <label for="mail">Correo electrónico:</label>
                    <input type="email" name="mail" reqiured>
                    
                    <label for="confirm-mail">Confirmar correo electrónico:</label>
                    <input type="email" name="confirm-mail" reqiured>

                    <button type="submit" id="buttonFormSignup">
                        <text-comp type="button">Registrarse</text-comp>
                    </button>
                </form>
            </div>
            <hands-comp></hands-comp>
        `;

        this.addListeners();
    };
};
customElements.define("login-page", LoginPage);