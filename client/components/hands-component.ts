const rockImage = require("url:../img/piedra.svg");
const paperImage = require("url:../img/papel.svg");
const scissorsImage = require("url:../img/tijera.svg");

class HandsComponent extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    render() {
        const shadow = this.attachShadow({ mode: "open" });
        const div = document.createElement("div");
        if (this.classList.value) {
            div.classList.add(this.classList.value);
        } else {
            div.classList.add("playerHands");
        }
        div.innerHTML = `
            <div>
                <img id="rock" class="hand" src="${rockImage}" alt="handImage">
            </div>
            <div>
                <img id="paper" class="hand" src="${paperImage}" alt="handImage">
            </div>
            <div>
                <img id="scissors" class="hand" src="${scissorsImage}" alt="handImage">
            </div>
        `;
        const style = document.createElement("style");

        const handEl = div.querySelectorAll(".hand");
        if (this.getAttribute("type") === "bigHand") {
            for (const h of handEl) {
                h!.classList.add("bigHand");
            }
        }

        style.innerHTML = `  
            .opponentHands{
                display: flex;
                justify-content: center;
                gap: 6%;
                align-items: flex-end;
                position: absolute;
                top: -15px;
                right: 0;
                left: 0;
                rotate: 180deg;
            }
            .playerHands,
            .menuHands {
                display: flex;
                justify-content: center;
                gap: 6%;
                align-items: flex-end;
                position: absolute;
                bottom: -10px;
                right: 0;
                left: 0;
                cursor: pointer;
            }
            @media(max-height:750px){
                .menuHands {
                    display:none;
                }
            }
            .hand {
                height: 20vh;
            }
            .bigHand{
                height: 26vh !important;
            }
            .noSeleccionada{
                opacity: 0.5;
                transform: translateY(8vh);
            }
            .seleccionada{
                opacity: 1;
                transform: translateY(0vh);
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(div);
    }
}
customElements.define("hands-comp", HandsComponent);
