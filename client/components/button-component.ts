class ButtonComponent extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    render() {
        const shadow = this.attachShadow({ mode: "open" });
        const button = document.createElement("button");
        button.classList.add("button");
        button.innerHTML = `
            <text-comp type="button">${this.textContent}</text-comp>
        `;
        const style = document.createElement("style");
        style.innerHTML = `
                button{
                    padding: 0 30px;
                    height: 70px;
                    background-color: #006CFC;
                    border-radius: 15px;
                    border: solid #001997 6px;
                    font-family: "Odibee Sans", cursive;
                    cursor: pointer;
                    margin: 0 auto;
                    display: block
                }
            `;

        shadow.appendChild(button);
        shadow.appendChild(style);
    }
}
customElements.define("button-comp", ButtonComponent);
