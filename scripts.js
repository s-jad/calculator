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

            break;

        case button.classList.contains("control-btn"):
            currentBtnGroup = 3; // Indiating control button
            displayButtonInput(button, currentBtnGroup);

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

            if (button.id === "equals-btn") {
                handleEquals();
            }

            break;

        case 3:
            if (button.id === "result-btn") {
                currentEq.push(prevAns);
                updateDisplayString("Ans");
            } else if (button.id === "menu-btn") {
                openExtendedOptions();
            } else if (button.id === "cancel-btn") {
                deleteCurrentEq();
            }
            break;

        default:
            break;
    }
}
function updateDisplayString(str) {
    screenCurrentEq.innerText = screenCurrentEq.innerText + ` ${str} `;
}

function updateDisplayOperator(nextOperator) {
    switch (true) {
        case nextOperator.id === "plus-btn":
            screenCurrentEq.innerText = screenCurrentEq.innerText + " + ";
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
            screenCurrentEq.innerText = screenCurrentEq.innerText + "! ";
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
            screenCurrentEq.innerText = screenCurrentEq.innerText + " ( ";
            break;

        case nextOperator.id === "r-bracket-btn":
            currentEq.push(")");
            screenCurrentEq.innerText = screenCurrentEq.innerText + " ) ";
            break;
    }
}

// class eqNode {
//     constructor(data) {
//         this.data = data;
//         this.x = null;
//         this.depth = 0;
//     }
// }

//u class EqTree {
//u     constructor() {
//u         this.root = null
//u     }
//u 
//u     insert(data) {
//u         const newNode = new Node(data);
//u 
//u         if (this.root === null) {
//u             this.root = newNode;
//u         } else {
//u             this.insertNode(this.root, newNode);
//u         }
//u     }
//u 
//u     insertNode(node, newNode) {
//u         if (newNode.data < node.data) {
//u             if (node.left === null) {
//u                 node.left = newNode;
//u             } else {
//u                 this.insertNode(node.left, newNode);
//u             }
//u         } else {
//u             if (node.right === null) {
//u                 node.right = newNode;
//u             } else {
//u                 this.insertNode(node.right, newNode);
//u             }
//u         }
//u     }
//u }

function handleEquals() {
    // Example: "6 ="
    if (currentEq.length <= 2) {
        prevAns = currentEq[0];
        displayPrevAns(prevAns);
        deleteCurrentEq();
        return;
    };

    console.group();
    let nodesArr = [];
    let startingDepth = 0;
    let { currentDepth, nodes } = handleBrackets(currentEq, startingDepth, nodesArr);

    let total = 0;
    for (let i = nodes.length - 1; i >= 0; i--) {
        console.log(`PRE_REPLACEMENT: nodes[${i}] => ${nodes[i]}`);
        if (nodes[i].includes("?")) {
            console.log("RECOGNIZED ?;");
            let index = nodes[i].indexOf("?");
            console.log(`index of ?: ${index}`);
            let operators = nodes[i].match(/[+\-*/]/g);

            nodes[i] = nodes[i].replace("?", total);
            console.log(`POST_REPLACEMENT: nodes[${i}] => ${nodes[i]}`);
        }
        console.log(`current_depth: ${currentDepth}`);
        total = calculate(nodes[i]);
        console.log(`total: ${total}`);
    }
    prevAns = total;
    displayPrevAns(prevAns);
    deleteCurrentEq();
    console.groupEnd();
}

function calculate(nodeStr) {
    let result;
    let { variables, operators } = collectVarOps(nodeStr);

    // Check for single num in brackets: 3*(54) 
    if (operators === null) {
        return parseFloat(variables[0]);
    }

    console.log(`CALCULATE: variables, operators => [${variables}], [${operators}]`);
    result = parseEquation({ variables, operators });
    console.log(`CALCULATE: sum => ${result}`);

    return parseFloat(result);
}

function parseEquation({ variables, operators }) {
    let result = 0;
    let return_variables = [];
    let stepBackA = 0;
    let stepBackB = 0;

    for (let i = 0; i < operators.length; i++) {
        if (variables.length === 2) {
            console.log("Last operation!!!");
            if (operators[i] == "*") {
                result = parseFloat(variables[0]) * parseFloat(variables[1]);
                console.log(`calculating: ${variables[0]} * ${variables[1]} = ${result}`);
                break;
            }

            if (operators[i] == "/") {
                result = parseFloat(variables[0]) / parseFloat(variables[1]);
                console.log(`calculating: ${variables[0]} / ${variables[1]} = ${result}`);
                break;
            }
        }

        console.log(`Value of i: ${i}`);
        console.log(`value of stepBackA: ${stepBackA}`);
        if (operators[i] === "*") {
            result = parseFloat(variables[i - stepBackA]) * parseFloat(variables[i + 1 - stepBackA]);
            console.log(`calculating: ${variables[i - stepBackA]} * ${variables[i + 1 - stepBackA]} = ${result}`);
            variables.splice(i - stepBackA, 1, result);
            variables.splice(i + 1 - stepBackA, 1);
            stepBackA++;
            console.log(`variable array: ${variables}`);
        }
        if (operators[i] === "/") {
            result = parseFloat(variables[i - stepBackA]) / parseFloat(variables[i + 1 - stepBackA]);
            console.log(`calculating: ${variables[i - stepBackA]} / ${variables[i + 1 - stepBackA]} = ${result}`);
            variables.splice(i - stepBackA, 1, result);
            variables.splice(i + 1 - stepBackA, 1);
            stepBackA++;
            console.log(`variable array: ${variables}`);
        }
    }

    for (let i = 0; i < operators.length; i++) {
        if (variables.length === 2) {
            console.log("Last operation!!!");
            if (operators[i] == "+") {
                result = parseFloat(variables[0]) + parseFloat(variables[1]);
                console.log(`calculating: ${variables[0]} + ${variables[1]} = ${result}`);
                break;
            }

            if (operators[i] == "-") {
                result = parseFloat(variables[0]) - parseFloat(variables[1]);
                console.log(`calculating: ${variables[0]} - ${variables[1]} = ${result}`);
                break;
            }
        }
        console.log(`Value of i: ${i}`);
        console.log(`value of stepBackB: ${stepBackB}`);
        if (operators[i] === "+") {
            result = parseFloat(variables[i - stepBackB]) + parseFloat(variables[i + 1 - stepBackB]);
            console.log(`calculating: ${variables[i - stepBackB]} + ${variables[i + 1 - stepBackB]} = ${result}`);
            variables.splice(i - stepBackB, 1, result);
            variables.splice(i - stepBackB + 1, 1);
            stepBackB++;
            console.log(`variable array: ${variables}`);
        }
        if (operators[i] === "-") {
            result = parseFloat(variables[i - stepBackB]) - parseFloat(variables[i + 1 - stepBackB]);
            console.log(`calculating: ${variables[i - stepBackB]} - ${variables[i + 1 - stepBackB]} = ${result}`);
            variables.splice(i - stepBackB, 1, result);
            variables.splice(i - stepBackB + 1, 1);
            stepBackB++;
            console.log(`variable array: ${variables}`);
        }
    }
    return result;
}

function collectVarOps(eqStr) {
    let variables = eqStr.match(/\d+(\.\d+)?/g);
    let operators = eqStr.match(/[+\-*/]/g);
    return { variables, operators };
}

function handleBrackets(equation, currentDepth, nodes) {
    // Limit for recursion
    if (!equation.includes("(") || !equation.includes(")") || equation.length <= 1) {
        nodes[currentDepth] = equation.join("");
        console.log(`finished_nodes: ${nodes}`);
        return { currentDepth, nodes };
    }

    let innerEquation = equation;
    let lastLBracket = 0;
    let lastRBracket = equation.length - 1;

    for (let i = 0; i < lastRBracket; i++) {
        if (equation[i] === "(") {
            for (let j = lastRBracket; j > i; j--) {
                if (equation[j] === ")" && equation[i] === "(") {
                    const beforeBrackets = innerEquation.slice(lastLBracket, i);
                    const afterBrackets = innerEquation.slice(j + 1, lastRBracket);
                    innerEquation = innerEquation.slice(i + 1, j);

                    const outerStr = beforeBrackets.join("") + "?" + afterBrackets.join("");
                    nodes[currentDepth] = outerStr;

                    console.log(`before brackets ${currentDepth}: ${beforeBrackets} `);
                    console.log(`after brackets ${currentDepth}: ${afterBrackets} `);
                    console.log(`inner equation ${currentDepth}: ${innerEquation} `);
                    console.log(`node ${currentDepth} = ${nodes[currentDepth]} `);
                    currentDepth++;
                    return handleBrackets(innerEquation, currentDepth, nodes);
                }
            }
        }
    }
}

function displayPrevAns(prevAns) {
    screenPrevAns.innerText = prevAns;
}

function deleteCurrentEq() {
    currentEq = [];
    screenCurrentEq.innerText = "";
}

function openExtendedOptions() {
    console.log(`Extended Options currently open: ${extendedOptionsOpen} `);
}


// EVENT LISTENERS

// -- MOUSE EVENT LISTENERS
Array.from(buttons).forEach((button) => {
    button.addEventListener('click', () => handleButtons(button));
});


// -- KEYBOARD EVENT LISTENERS

// UTILITY FUNCTIONS

