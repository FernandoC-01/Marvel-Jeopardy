import placeholderQuestions from "./placeholder-questions.js";

// _______________Establishing a place for audio_______________

const correctSound = new Audio("sounds/right-sound.mp3");
correctSound.volume = 1;
const incorrectSound = new Audio("sounds/incorrect-sound.mp3");
incorrectSound.volume = 1;
const thinkingSound = new Audio("sounds/marvel-sound.mp3");
thinkingSound.volume = 0.3;


function playSound(audio) {
    audio.currentTime = 0;
    audio.play();
}
//___________________________________________________________

const cells = document.querySelectorAll('.cell');
const totalCells = cells.length;

const nextButton = document.querySelector('.nextButton');
const playerTurn = document.getElementById('player-turn');
const answerInput = document.getElementById('answer-input');

const guessButton = document.getElementById('guess-button');
const finalGuessButton = document.getElementById('finalGuess-Button');
const passButton = document.getElementById('pass-button');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const BetScoreInput = document.getElementById('betScore');

let currentQuestion = null; // Track the question that needs to be answered
let currentCell = null; // Track the clicked cell
let player1 = localStorage.getItem("player1") || "Player 1"; 
let player2 = localStorage.getItem("player2") || "Player 2";
let player1Score = 0;
let player2Score = 0;
let currentPlayer = player1;
let wrongAttempts = 0;
let clickedCells = 0;
let wagers = [0, 0];

// Gathering player names on the start page
document.addEventListener("DOMContentLoaded", async (event) => {
    if (document.title === "Jeopardy" ) {

        await new Promise(resolve => setTimeout(resolve, 1000)); // delay
        player1 = prompt("Enter name for Player 1:");
        if (!player1 || player1.trim() === "") {
            player1 = "Player 1"; // Default name 
        }
        localStorage.setItem("player1", player1);

        player2 = prompt("Enter name for Player 2:");
        if (!player2 || player2.trim() === "") {
            player2 = "Player 2"; // Default name
        }
        localStorage.setItem("player2", player2);
    }
});
console.log(`player 1: ${player1} and player 2: ${player2}`)

// Making the prompted names available across all pages
if (localStorage.getItem("player1")) {
    player1 = localStorage.getItem("player1");
}
if (localStorage.getItem("player2")) {
    player2 = localStorage.getItem("player2");
}


//loads scores on pages with a display
loadScores();

//using if statement because not every page has the following
if (nextButton) nextButton.disabled = true;

if (passButton) {
    passButton.disabled = true;

    // Handles the pass button click
passButton.addEventListener('click', (event) => {
    event.preventDefault();
    passButton.disabled = true;
    switchTurn();
    alert(`It is now ${currentPlayer}'s turn!`);
});
}


/// Load scores from localStorage if they exist
function loadScores() {
    player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
    player2Score = parseInt(localStorage.getItem('player2Score')) || 0;
    updateScoreDisplay();
}



// Save scores to localStorage
function saveScores() {
    localStorage.setItem('player1Score', player1Score);
    localStorage.setItem('player2Score', player2Score);
}

function updateScoreDisplay() {
    player1ScoreDisplay.textContent = `${player1}: ${player1Score}`;
    player2ScoreDisplay.textContent = `${player2}: ${player2Score}`;
}


// Disable all cells except the one clicked
function disableCells() {
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none'; // Disable clicking on all cells
    });
    alert('The question must be anwered or passed to proceed!')
}

// Re-enable all cells for the next question
function enableCells() {
    cells.forEach(cell => {
        if (cell.style.visibility !== 'hidden') {
            cell.style.pointerEvents = 'auto'; // Re-enable clicking for cells that haven't been hidden
        }
    });
}

function clearAndHideCell(cell) {
    if (cell) {
        cell.textContent = '';  // Clear the question
        cell.style.visibility = 'hidden';  // Hide the cell
    }
}

// Handle cell click to display the question
cells.forEach(cell => {
    cell.addEventListener('click', (event) => {
        event.preventDefault();
        playSound(thinkingSound);
        // Extract category and value from cell id
        const [category, value] = cell.id.split('-');

        // Find the matching question
        const questionObj = placeholderQuestions.find(
            (q) => q.category.toLowerCase() === category && q.value === value
        );

        if (questionObj) {
            currentQuestion = questionObj;
            currentCell = cell; // Store the clicked cell
            cell.textContent = questionObj.question; // Replace cell value with the question
            wrongAttempts = 0
            disableCells();
            
            passButton.disabled = false;
        }

        // If the cell hasn't been clicked before
        if (!cell.classList.contains('clicked')) {
            cell.classList.add('clicked'); // Mark as clicked
            clickedCells++; // Increment the counter

            // Enable the next button if all cells are clicked
            if (clickedCells === totalCells) {
                alert("You can now proceed to the next round")
                nextButton.disabled = false; // Enable the next button
            }
            
        }
    });
});

// Switch turns between players
function switchTurn() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    playerTurn.textContent = `${currentPlayer}'s Turn`;
}

document.addEventListener("DOMContentLoaded", () => {
    playerTurn.textContent = `${currentPlayer}'s Turn`;
});

// Handle guess button click
if (guessButton) {
guessButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentQuestion) {
        const userAnswer = answerInput.value.trim().toLowerCase();

        if (userAnswer === currentQuestion.answer.toLowerCase()) {
            playSound(correctSound);
            alert(`Correct, it is still your turn`);
            updateScore(currentPlayer, parseInt(currentQuestion.value));
            
            clearAndHideCell(currentCell);
            
            currentQuestion = null;
            enableCells();
        } else {
            wrongAttempts++;
            playSound(incorrectSound);
            subtractScore(currentPlayer, parseInt(currentQuestion.value));
            switchTurn();
            alert(`Wrong, ${currentPlayer}'s turn!`);
            
            if (wrongAttempts >= 2) {
                clearAndHideCell(currentCell);
                currentQuestion = null;
                enableCells(); 
            }
        }
        answerInput.value = ''; // Clear the input
    }
});
}

// Adds points for rightfully answered questions
function updateScore(player, points) {
    if (player === player1) {
        player1Score += points;
    } else {
        player2Score += points;
    }
    saveScores();
    updateScoreDisplay();
}

// Removes points from wrongly answered questions
function subtractScore(player, points) {
    if (player === player1) {
        player1Score = Math.max(player1Score - points, 0);
    } else {
        player2Score = Math.max(player2Score - points, 0);
    }
    saveScores();
    updateScoreDisplay();
}

// Reset the game
function resetGame() {
    localStorage.removeItem('player1Score');
    localStorage.removeItem('player2Score');
    window.location.replace('../index.html');
}

function determineWinner() {
    if (player1Score > player2Score) {
        alert(`${player1} wins!`);
    } else if (player2Score > player1Score) {
        alert(`${player2} wins!`);
    } else {
        alert("It's a tie!");
    }
    alert("Game will now restart")
}

// Process the answer and update the score
function processAnswer(betAmount) {
    if (currentQuestion) {
        const answer = answerInput.value.trim().toLowerCase();
        const isCorrect = answer === currentQuestion.answer.toLowerCase();
        processBet(betAmount, isCorrect);

        if (isCorrect) {
            playSound(correctSound);
            alert(`${currentPlayer} that was correct! You gain ${betAmount} points.`);
        } else {
            playSound(incorrectSound)
            alert(`${currentPlayer} that was incorrect! You lose ${betAmount} points.`);
        }

    }
}

// Update score based on correct or incorrect answer
function processBet(betAmount, isCorrect) {
    if (currentPlayer === player1) {
        player1Score = isCorrect ? player1Score + betAmount : Math.max(player1Score - betAmount, 0);
    } else {
        player2Score = isCorrect ? player2Score + betAmount : Math.max(player2Score - betAmount, 0);
    }
    saveScores();
    updateScoreDisplay();
}

// Handle bet and answer submission
if (finalGuessButton) {
    finalGuessButton.addEventListener('click', (event) => {
        event.preventDefault();
        const betAmount = parseInt(BetScoreInput.value);

        const currentScore = currentPlayer === player1 ? player1Score : player2Score;

        if (isNaN(betAmount) || betAmount <= 0) {
            alert("Please enter a valid bet amount.");
            BetScoreInput.value = "";
            return;
        } else if (betAmount > currentScore) {
            alert(`You can't bet more than your current score of ${currentScore} points.`);
            BetScoreInput.value = "";
            return;
        }
        
        wagers.value = betAmount;  // Record the bet amount
        processAnswer(betAmount);  // Check answer and adjust score

        // Move to the next player or determine the winner
        if (currentPlayer === player1) {
            switchTurn();
            BetScoreInput.value = "";
            answerInput.value = "";
            alert(`Now ${currentPlayer}, who do you think it could be?`)
        } else {
            determineWinner();
            resetGame();
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        const finalQuestionElement = document.getElementById("final-q");
        const finalCategory = finalQuestionElement.getAttribute("data-category");
        
        // Find the question object based on the final category
        const questionObj = placeholderQuestions.find(
            (q) => q.category.toLowerCase() === finalCategory
        );
        
        if (questionObj) {
            finalQuestionElement.textContent = questionObj.question; // Set the question text
            currentQuestion = questionObj; // Set currentQuestion to the found question object
        }
    });
}

