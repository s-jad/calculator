// HTML ELEMENTS
const root = document.documentElement;
const buttons = document.getElementsByClassName('btn');

const screenCurrentEq = document.getElementById('current-equation');
const screenPrevAns = document.getElementById('answer');


// GLOBAL VARIABLES
let currentEq = [];
let prevAns = 0;
let extendedOptionsOpen = false;
let postOperatorSpace = false;
let postNumberSpace = false;

// FUNCTIONS 
function handleButtons(button) {
    let currentBtnGroup = 0; // Indiating nothing
    switch (true) {
        case button.classList.contains("number-btn"):
            currentBtnGroup = 1; // Indiating number button
            displayButtonInput(button, currentBtnGroup);
            break;

        case button.classList.contains("operation-btn"):
            currentBtnGroup = 2; // Indiating operation button
            displayButtonInput(button, currentBtnGroup);

            console.log("Operation button pressed");
            break;

        case button.classList.contains("control-btn"):
            currentBtnGroup = 3; // Indiating control button
            displayButtonInput(button, currentBtnGroup);

            console.log("Control button pressed");
            break;
    }
}

function displayButtonInput(button, currentBtnGroup) {
    switch (currentBtnGroup) {
        case 1:
            let match = button.id.match(/\d+/);
            if (match) {
                let btnNumber = parseInt(match[0], 10);
                currentEq.push(btnNumber);
                if (postOperatorSpace === true) {
                    screenCurrentEq.innerText += (" " + match[0]);
                    postOperatorSpace = false;
                } else {
                    screenCurrentEq.innerText += match[0];
                }
            }
            break;

        case 2:
            updateDisplayOperator(button);
            break;

        case 3:
            if (button.id === "result-btn") {
                currentEq.push(prevAns);
                updateDisplayString("Ans");
            } else if (button.id === "menu-btn") {
                openExtendedOptions();
            } else if (button.id === "cancel-btn") {
                cancelCurrentEq();
            }
            break;

        default:
            break;
    }
}



function updateDisplayOperator(nextOperator) {
    switch (true) {
        case nextOperator.id === "plus-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " +";
            currentEq.push("+");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "minus-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " - ";
            currentEq.push("-");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "multiply-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " * ";
            currentEq.push("*");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "divide-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " / ";
            currentEq.push("/");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "equals-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " = ";
            currentEq.push("=");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "factorial-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + "!";
            currentEq.push("!");
            postOperatorSpace = true;
            break;

        case nextOperator.id === "power-btn":
            currentEq.push("^");
            screenCurrentEq.innerText = screenCurrentEq.innerText + "^";
            break;

        case nextOperator.id === "sqrt-btn":
            currentEq.push("√");
            screenCurrentEq.innerText = screenCurrentEq.innerText + "√";
            break;

        case nextOperator.id === "l-bracket-btn":
            currentEq.push("(");
            screenCurrentEq.innerText = screenCurrentEq.innerText + "(";
            break;

        case nextOperator.id === "r-bracket-btn":
            currentEq.push(")");
            screenCurrentEq.innerText = screenCurrentEq.innerText + ")";
            break;
    }
}

function cancelCurrentEq() {
    currentEq = [];
    screenCurrentEq.innerText = "";
}

function openExtendedOptions() {
    console.log(`Extended Options currently open: ${extendedOptionsOpen}`);
}


// EVENT LISTENERS

// -- MOUSE EVENT LISTENERS
Array.from(buttons).forEach((button) => {
    button.addEventListener('click', () => handleButtons(button));
});


// -- KEYBOARD EVENT LISTENERS

// UTILITY FUNCTIONS


