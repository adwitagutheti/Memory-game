const sequenceDisplay = document.getElementById('sequence-display');
const draggableArea = document.getElementById('draggable-area');
const dropArea = document.getElementById('drop-area');
const startButton = document.getElementById('start-button');
const okButton = document.getElementById('ok-button');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const difficultySelect = document.getElementById('difficulty');
const backBtn = document.getElementById('back-btn');
const correctPopup = document.getElementById('correct-popup');
const incorrectPopup = document.getElementById('incorrect-popup');
const nextRoundButton = document.getElementById('next-round-button');
const tryAgainButton = document.getElementById('try-again-button');
const restartButton = document.getElementById('restart-game-button');
const exitButton = document.getElementById('exit-game-button');
const restartFromIncorrectButton = document.getElementById('restart-from-incorrect-button');

let sequence = [];
let currentLevel = 'easy';
let score = 0;
let displayTimeout;
const foodEmojis = ['🥕', '🥦', '🌶️', '🌽', '🍄', '🧅', '🥔', '🥐', '🍞', '🧀', '🥚', '🍗', '🍝', '🍣', '🍤', '🍦', '🍧', '🍩', '🍪', '🍫', '🍬', '🍭' ];
const sequenceLength = {
    easy: 4,
    medium: 6,
    hard: foodEmojis.length
};
let displayedEmojis = [];
let draggedEmojis = [];

function resetGameDisplay() {
    startButton.classList.remove('hidden');
    okButton.classList.add('hidden');
    draggableArea.classList.add('hidden');
    sequenceDisplay.innerHTML = '';
    dropArea.innerHTML = '<span>Drag food here</span>';
    messageDisplay.textContent = '';
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = score;
    messageDisplay.textContent = '';
    startButton.classList.add('hidden');
    okButton.classList.add('hidden');
    draggableArea.classList.add('hidden');
    sequence = generateSequence();
    displayedEmojis = [...foodEmojis];
    shuffleArray(displayedEmojis);
    draggedEmojis = [];
    dropArea.innerHTML = '<span>Drag food here</span>';
    playSequence();
    console.log("Game started. Sequence:", sequence);
}

function generateSequence() {
    const length = sequenceLength[currentLevel];
    const newSequence = [];
    for (let i = 0; i < length; i++) {
        newSequence.push(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
    }
    return newSequence;
}

function playSequence() {
    sequenceDisplay.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
        const emojiSpan = document.createElement('span');
        emojiSpan.classList.add('sequence-item');
        emojiSpan.textContent = sequence[i];
        sequenceDisplay.appendChild(emojiSpan);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            setTimeout(prepareDragArea, 4000);
        }
    }, 1000);
}

function prepareDragArea() {
    sequenceDisplay.innerHTML = '';
    draggableArea.innerHTML = '';
    displayedEmojis.forEach(emoji => {
        const dragEmoji = document.createElement('span');
        dragEmoji.classList.add('draggable-emoji');
        dragEmoji.textContent = emoji;
        dragEmoji.draggable = true;
        dragEmoji.dataset.emoji = emoji;
        dragEmoji.addEventListener('dragstart', dragStart);
        draggableArea.appendChild(dragEmoji);
    });
    draggableArea.classList.remove('hidden');
    dropArea.addEventListener('dragover', dragOver);
    dropArea.addEventListener('drop', drop);
    okButton.classList.remove('hidden');
    messageDisplay.textContent = 'Drag the food in the correct sequence and click OK.';
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.emoji);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const emoji = event.dataTransfer.getData('text/plain');
    const droppedEmojiSpan = document.createElement('span');
    droppedEmojiSpan.classList.add('dropped-emoji');
    droppedEmojiSpan.textContent = emoji;

    if (dropArea.children.length === 1 && dropArea.children[0].textContent === 'Drag food here') {
        dropArea.innerHTML = '';
    }

    dropArea.appendChild(droppedEmojiSpan);
    draggedEmojis.push(emoji);

    console.log("DROPPED:", emoji, "DRAGGED ARRAY:", draggedEmojis);
}

function checkSequence() {
    console.log("CHECK SEQUENCE: Sequence:", sequence, "Dragged Emojis:", draggedEmojis);
    if (draggedEmojis.length !== sequence.length) {
        messageDisplay.textContent = 'Incorrect length!';
        return;
    }
    let correct = true;
    for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== draggedEmojis[i]) {
            correct = false;
            break;
        }
    }
    if (correct) {
        score++;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'Correct!';
        confetti();
        correctPopup.classList.remove('hidden');
    } else {
        messageDisplay.textContent = 'Incorrect sequence. Try again!';
        incorrectPopup.classList.remove('hidden');
    }
}

function resetGame() {
    correctPopup.classList.add('hidden');
    incorrectPopup.classList.add('hidden');
    resetGameDisplay(); // Use the new function
    sequence = [];
    draggedEmojis = [];
}

function nextRound() {
    correctPopup.classList.add('hidden');
    startGame();
}

function tryAgain() {
    incorrectPopup.classList.add('hidden');
    draggedEmojis = [];
    dropArea.innerHTML = '<span>Drag food here</span>';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

difficultySelect.addEventListener('change', (event) => {
    currentLevel = event.target.value;
    console.log("Difficulty changed to:", currentLevel);
});

startButton.addEventListener('click', startGame);
okButton.addEventListener('click', checkSequence);
nextRoundButton.addEventListener('click', nextRound);
tryAgainButton.addEventListener('click', tryAgain);
restartButton.addEventListener('click', resetGameDisplay); // Use resetGameDisplay
restartFromIncorrectButton.addEventListener('click', resetGameDisplay); // Use resetGameDisplay
exitButton.addEventListener('click', () => {
    // You can implement your exit logic here.
    // For a standalone web page, this might simply close the tab/window
    // or navigate to a different page.
    alert('Exit Game functionality would go here.');
    // Example: window.close(); or window.location.href = 'homepage.html';
});
backBtn.addEventListener('click', () => {
    if (window.parent.location !== window.location) {
        window.parent.postMessage('backToHome', '*');
    } else {
        alert('Back to home functionality would go here.');
    }
});

// Initialize
resetGameDisplay(); // Call on page load to show start button and level select