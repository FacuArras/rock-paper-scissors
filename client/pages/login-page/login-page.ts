import { Router } from "@vaadin/router";
import { state } from "../../state";

class LoginPage extends HTMLElement {
    connectedCallback() {
        /* Si el usuario ya inició sesión se saltea esta page para ir directamente a "/home". */
        const currentState = state.getState();
        if (currentState.userId.length > 1) {
            state.spinnerLoading();
            Router.go("/home");
        }
        this.render();
    };

    addListeners() {
        /* Esucho cuando le hagan click a uno de los dos botones para que solamente se muestre el respectivo formulario y enviarlo. */
        const buttonLoginEl = this.querySelector("#buttonLogin") as any;
        const buttonSignupEl = this.querySelector("#buttonSignup") as any;
        const titleEl = this.querySelector(".title") as any;

        buttonLoginEl!.addEventListener("click", e => {
            const loginFormContainerEl = this.querySelector(".loginFormContainer") as any;
            const rememberInputEl = this.querySelector(".rememberInput") as any;
            const loginFormEl = this.querySelector(".loginForm");

            titleEl.style.display = "none";
            buttonLoginEl.style.display = "none";
            buttonSignupEl.style.display = "none";
            loginFormContainerEl.style.display = "block";

            loginFormEl!.addEventListener("submit", e => {
                e.preventDefault();
                const target = e.target as any;

                /* Verifico que los mails conicidan y que por lo menos tengan 1 carácter. */
                if (target.mail.value === target["confirm-mail"].value && target.mail.value.length > 0) {
                    /* Si coinciden activo el spinner, seteo el mail en el state, activo la función "login"
                         y en el callback me fijo si el checkbox de recordarme se activó. Si se activó guardo la información
                             del usuario en el localStorage y finalmente redirecciono a "/home". */
                    state.spinnerLoading();
                    state.setMail(target.mail.value);
                    state.login(() => {
                        if (rememberInputEl.checked) {
                            const currentState = state.getState();
                            localStorage.setItem("rock-paper-scissors", JSON.stringify({
                                mail: currentState.mail,
                                online: true,
                                userId: currentState.userId,
                                userName: currentState.userName
                            }));
                        };
                        Router.go("/home");
                    });
                } else {
                    console.error("Los correos electrónicos no coinciden.");
                    const errorEl = this.querySelector(".form-error") as any;
                    errorEl.style.display = "block";
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
                /* Chequeo que los mails conicidan y que por lo menos tengan 1 carácter. */
                if (target.mail.value === target["confirm-mail"].value && target.mail.value.length > 0) {
                    /* Si coniciden activo el spinner, seteo el mail y el name en state y activo la función "signup" para que
                         al ejecutarse me redireccione a "/home". */
                    state.spinnerLoading();
                    state.setMail(target.mail.value);
                    state.setName(target.name.value);
                    state.signup(() => {
                        Router.go("/home");
                    });
                } else {
                    console.error("Los correos electrónicos no coinciden.");
                    const errorEl = signupFormContainerEl.querySelector(".form-error") as any;
                    errorEl.style.display = "block";
                };
            });
        });
    }

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
                <button-comp id="buttonLogin" class="button">Iniciar sesión</button-comp>
                <button-comp id="buttonSignup" class="button">Registrarse</button-comp>
            </div>

            <div class="loginFormContainer">
                <h3 class="loginTitle">Bienvenido de vuelta!</h3>
                <form class="loginForm">
                    <label for="mail">Correo electrónico:</label>
                    <input type="email" name="mail" required>

                    <label for="confirm-mail">Confirme el correo electrónico:</label>
                    <input type="email" name="confirm-mail" required>

                    <p class="form-error">Los correos no coinciden</p>

                    <label class="rememberLabel" for="remember">
                        Mantener sesión iniciada
                        <input type="checkbox" class="rememberInput" name="remember">
                    </label>

                    <button type="submit" id="buttonFormLogin">Iniciar sesión</button>
                </form>
            </div>
            
            <div class="signupFormContainer">
                <h3 class="signupTitle">Bienvenido!</h3>
                <form class="signupForm">
                    <label for="name">Nombre:</label>
                    <input type="text" name="name" maxlength="15" required>

                    <label for="mail">Correo electrónico:</label>
                    <input type="email" name="mail" required>
                    
                    <label for="confirm-mail">Confirmar correo electrónico:</label>
                    <input type="email" name="confirm-mail" required>

                    <p class="form-error">Los correos no coinciden</p>

                    <button type="submit" id="buttonFormSignup">Registrarse</button>
                </form>
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
customElements.define("login-page", LoginPage);