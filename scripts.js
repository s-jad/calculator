// HTML ELEMENTS
const root = document.documentElement;
const buttons = document.getElementsByClassName('btn');
const buttonGrid = document.getElementById('button-grid');
const operatorButtonGrid = document.getElementById('operation-grid');
const screenCurrentEq = document.getElementById('current-equation');
const screenPrevAns = document.getElementById('answer');


// GLOBAL VARIABLES
let currentEq = [];
let prevAns = 0;
let extendedOptionsOpen = false;
let infoModalOpen = false;
let postOperatorSpace = false;
let postNumberSpace = false;

// FUNCTIONS 
function handleButtons(button) {
    switch (true) {
        case button.classList.contains("number-btn"):
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
            if (button.id === "dot-btn") {
                currentEq.push(".");
                updateDisplayString(".");
            }
            if (button.id === "result-btn") {
                currentEq.push(prevAns);
                updateDisplayString(" Ans ");
            }
            break;

        case button.classList.contains("operation-btn"):
            updateDisplayOperator(button);

            if (button.id === "equals-btn") {
                handleEquals();
            }
            break;

        case button.classList.contains("control-btn"):
            if (button.id === "info-btn") {
                openInfoModal();
            } else if (button.id === "menu-btn") {
                toggleExtendedOptions();
            } else if (button.id === "cancel-btn") {
                deleteCurrentEq();
            }
            break;
    }
}

function updateDisplayString(str) {
    screenCurrentEq.innerText = screenCurrentEq.innerText + `${str}`;
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
            screenCurrentEq.innerText = screenCurrentEq.innerText + " √";
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

function handleEquals() {
    // Handle single number inputs => Example: "6 ="
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

    let total = 0.0;
    for (let i = nodes.length - 1; i >= 0; i--) {

        // If this is NOT the innermost sub-equation
        // Will never be true in the first loop
        if (nodes[i].includes("?")) {
            let index = nodes[i].indexOf("?");
            console.log("RECOGNIZED ?;");

            // Handle implied multiplication via () positioning: 
            // Example => 12(6 - 2) = 48
            if (!isNaN(nodes[i][index - 1]) && !isNaN(nodes[i][index + 1])) {
                console.log("both index + 1 / - 1 are numbers!");
                nodes[i] = nodes[i].substring(0, index) + "*?*" + nodes[i].substring(index - 2 + "*?*".length);
                console.log(`nodes[i] => ${nodes[i]}`);
            } else if (!isNaN(nodes[i][index + 1])) {
                console.log("only index + 1 is a number!");
                nodes[i] = nodes[i].substring(0, index) + "?*" + nodes[i].substring(index - 1 + "?*".length);
                console.log(`nodes[i] => ${nodes[i]}`);
            } else if (!isNaN(nodes[i][index - 1])) {
                console.log("only index - 1 is a number!");
                nodes[i] = nodes[i].substring(0, index) + "*?" + nodes[i].substring(index - 1 + "*?".length);
                console.log(`nodes[i] => ${nodes[i]}`);
            }

            // Replace ? with total from within bracketed equation
            nodes[i] = nodes[i].replace("?", total);
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

    result = parseEquation({ variables, operators });

    return parseFloat(result);
}

function handleFactorialExponentialSqrt({ variables, operators }) {
    let result = 0;
    let stepBackA = 0;

    for (let i = 0; i < operators.length; i++) {
        if (variables.length <= 2) {
            console.log("Last operation!!!");
            if (operators[i] == "!") {
                result = parseFloat(factorial(variables[0]));
                console.log(`calculating: ${variables[0]}! = ${result}`);
                break;
            }

            if (operators[i] == "^") {
                result = parseFloat(power(variables[0], variables[1]));
                console.log(`calculating: ${variables[0]}^${variables[1]} = ${result}`);
                break;
            }

            if (operators[i] == "√") {
                result = parseFloat(Math.sqrt(variables[0]));
                console.log(`calculating: √${variables[0]} = ${result}`);
                break;
            }
        }

        if (operators[i] === "!") {
            result = parseFloat(factorial(variables[i - stepBackA]));
            console.log(`calculating: ${variables[i - stepBackA]}! = ${result}`);
            variables.splice(i - stepBackA, 1, result);
            stepBackA++;
            console.log(`variable array: ${variables}`);
        }
        if (operators[i] === "√") {
            result = parseFloat(Math.sqrt(variables[i - stepBackA]));
            console.log(`calculating: √${variables[i - stepBackA]} = ${result}`);
            variables.splice(i - stepBackA, 1, result);
            stepBackA++;
            console.log(`variable array: ${variables}`);
        }
        if (operators[i] === "^") {
            result = parseFloat(power(variables[i - stepBackA], variables[i + 1 - stepBackA]));
            console.log(`calculating: ${variables[i - stepBackA]}^${variables[i + 1 - stepBackA]} = ${result}`);
            variables.splice(i - stepBackA, 1, result);
            variables.splice(i + 1 - stepBackA, 1);
            stepBackA++;
            console.log(`variable array: ${variables}`);
        }
    }
    // Clear the used operators
    operators = operators.filter(function(operator) {
        return operator !== "^" && operator !== "!" && operator !== "√";
    });

    return { result, operators };
}

function handleMultiplyDivide(variables, operators) {
    let result = 0;
    let stepBackA = 0;
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
    // Clear the used operators
    operators = operators.filter(function(operator) {
        return operator !== "/" && operator !== "*";
    });

    return { result, operators };
}

function handleAddSubtract(variables, operators) {
    let result = 0;
    let stepBackB = 0;

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
    // Clear the used operators
    operators = operators.filter(function(operator) {
        return operator !== "-" && operator !== "+";
    });

    return { result, operators };
}

function parseEquation({ variables, operators }) {
    let data = { result: 0, operators: operators };

    if (operators.includes("!") || operators.includes("^") || operators.includes("√")) {
        console.log(`PARSE_EQ preFE: variables, operators => [${variables}], [${operators}]`);
        data = handleFactorialExponentialSqrt({ variables, operators });
        console.log(`PARSE_EQ postFE: variables, operators => [${variables}], [${data.operators}]`);
        console.log(`FE PARSE_EQ: result => ${data.result}`);
    }
    if (operators.includes("*") || operators.includes("/")) {
        console.log(`PARSE_EQ preMD: variables, operators => [${variables}], [${data.operators}]`);
        data = handleMultiplyDivide(variables, data.operators);
        console.log(`PARSE_EQ postMD: variables, operators => [${variables}], [${data.operators}]`);
        console.log(`MD PARSE_EQ: result => ${data.result}`);
    }
    if (operators.includes("+") || operators.includes("-")) {
        console.log(`PARSE_EQ preAS: variables, operators => [${variables}], [${data.operators}]`);
        data = handleAddSubtract(variables, data.operators);
        console.log(`PARSE_EQ postAS: variables, operators => [${variables}], [${data.operators}]`);
        console.log(`AS PARSE_EQ: result => ${data.result}`);
    }
    return data.result;
}

function collectVarOps(eqStr) {
    // Matches 123456890 and . for floats
    let variables = eqStr.match(/\d+(\.\d+)?/g);
    // Matches +-*/!^ - all current operators
    let operators = eqStr.match(/[+\-*/!^√]/g);
    return { variables, operators };
}

function factorial(num) {
    for (let i = num - 1; i > 1; i--) {
        num *= i;
    }
    return num;
}

function power(num, exp) {
    if (exp === "0") {
        return 1;
    }

    if (exp === "1") {
        return num;
    } else {
        let originalNum = num
        for (let i = 0; i < exp; i++) {
            num *= originalNum;
        }
        return num;
    }
}

function handleBrackets(equation, currentDepth, nodes) {
    // Limit for recursion and stop for equations without brackets
    if (!equation.includes("(") || !equation.includes(")") || equation.length <= 1) {
        nodes[currentDepth] = equation.join("");
        console.log(`finished_nodes: ${nodes}`);
        return { currentDepth, nodes };
    }

    let innerEquation = equation;
    let lastLBracket = 0;
    let lastRBracket = equation.length;

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


const logBtn = document.createElement("button");
logBtn.classList.add("btn");
logBtn.classList.add("operation-btn");
logBtn.innerText = "log";

const lnBtn = document.createElement("button");
lnBtn.classList.add("btn");
lnBtn.classList.add("operation-btn");
lnBtn.innerText = "ln";

const sinBtn = document.createElement("button");
sinBtn.classList.add("btn");
sinBtn.classList.add("operation-btn");
sinBtn.innerText = "sin";

const cosBtn = document.createElement("button");
cosBtn.classList.add("btn");
cosBtn.classList.add("operation-btn");
cosBtn.innerText = "cos";

const tanBtn = document.createElement("button");
tanBtn.classList.add("btn");
tanBtn.classList.add("operation-btn");
tanBtn.innerText = "tan";

const piBtn = document.createElement("button");
piBtn.classList.add("btn");
piBtn.classList.add("operation-btn");
piBtn.innerText = "π";

const eBtn = document.createElement("button");
eBtn.classList.add("btn");
eBtn.classList.add("operation-btn");
eBtn.innerText = "e";

const modBtn = document.createElement("button");
modBtn.classList.add("btn");
modBtn.classList.add("operation-btn");
modBtn.innerText = "mod";

const invBtn = document.createElement("button");
invBtn.classList.add("btn");
invBtn.classList.add("operation-btn");
invBtn.innerText = "Inv";

const radDegBtn = document.createElement("button");
radDegBtn.classList.add("btn");
radDegBtn.classList.add("operation-btn");
radDegBtn.innerText = "Rad";

function toggleExtendedOptions() {
    if (!extendedOptionsOpen) {
        buttonGrid.classList.toggle('expanded');
        operatorButtonGrid.classList.toggle('extended');
        extendedOptionsOpen = true;
        operatorButtonGrid.appendChild(logBtn);
        operatorButtonGrid.appendChild(lnBtn);
        operatorButtonGrid.appendChild(sinBtn);
        operatorButtonGrid.appendChild(cosBtn);
        operatorButtonGrid.appendChild(tanBtn);
        operatorButtonGrid.appendChild(piBtn);
        operatorButtonGrid.appendChild(eBtn);
        operatorButtonGrid.appendChild(invBtn);
        operatorButtonGrid.appendChild(modBtn);
        operatorButtonGrid.appendChild(radDegBtn);
    } else if (extendedOptionsOpen) {
        operatorButtonGrid.removeChild(logBtn);
        operatorButtonGrid.removeChild(lnBtn);
        operatorButtonGrid.removeChild(sinBtn);
        operatorButtonGrid.removeChild(cosBtn);
        operatorButtonGrid.removeChild(tanBtn);
        operatorButtonGrid.removeChild(piBtn);
        operatorButtonGrid.removeChild(eBtn);
        operatorButtonGrid.removeChild(invBtn);
        operatorButtonGrid.removeChild(modBtn);
        operatorButtonGrid.removeChild(radDegBtn);

        buttonGrid.classList.toggle('expanded');
        operatorButtonGrid.classList.toggle('extended');
        extendedOptionsOpen = false;
    }
}

function openInfoModal() {
    if (infoModalOpen) {
        console.log(`Info modal currently open: ${infoModalOpen} `);
        infoModalOpen = false;
    } else {
        console.log(`Info modal currently open: ${infoModalOpen} `);
        infoModalOpen = true;
    }
}


// EVENT LISTENERS

// -- MOUSE EVENT LISTENERS
Array.from(buttons).forEach((button) => {
    button.addEventListener('click', () => handleButtons(button));
});


// -- KEYBOARD EVENT LISTENERS

// UTILITY FUNCTIONS


