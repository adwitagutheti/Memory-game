// Game variables
let wordList = [];
let foundWords = [];
let grid = [];
let gridSize = 10;
let difficulty = 'easy';
let selectedCells = [];

// Dictionary of words by category
const wordCategories = {
    animals: ['DOG', 'CAT', 'LION', 'TIGER', 'ELEPHANT', 'ZEBRA', 'GIRAFFE', 'MONKEY', 'BEAR', 'WOLF', 'FOX', 'RABBIT', 'DEER', 'SNAKE', 'EAGLE'],
    fruits: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MANGO', 'PINEAPPLE', 'STRAWBERRY', 'WATERMELON', 'PEACH', 'PEAR', 'LEMON', 'CHERRY', 'KIWI'],
    countries: ['CANADA', 'FRANCE', 'JAPAN', 'BRAZIL', 'INDIA', 'AUSTRALIA', 'MEXICO', 'EGYPT', 'RUSSIA', 'CHINA', 'ITALY', 'GERMANY', 'SPAIN'],
    sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'BASEBALL', 'HOCKEY', 'SWIMMING', 'RUNNING', 'VOLLEYBALL', 'GOLF', 'BOXING', 'CYCLING']
};

// DOM elements
const puzzleGrid = document.getElementById('puzzle-grid');
const wordListElement = document.getElementById('word-list');
const resetBtn = document.getElementById('reset-btn');
const newGameBtn = document.getElementById('new-game-btn');
const backBtn = document.getElementById('back-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const foundCountElement = document.getElementById('found-count');
const totalCountElement = document.getElementById('total-count');

// Initialize the game
function initGame() {
    // Clear variables
    wordList = [];
    foundWords = [];
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    selectedCells = [];

    // Generate word list based on difficulty
    generateWordList();

    // Update word count display
    foundCountElement.textContent = 0;
    totalCountElement.textContent = wordList.length;

    // Generate the puzzle grid
    generatePuzzle();

    // Render the puzzle and word list
    renderPuzzle();
    renderWordList();
}

// Generate a list of words based on difficulty
function generateWordList() {
    // Choose a random category
    const categories = Object.keys(wordCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const allWords = [...wordCategories[randomCategory]];

    // Shuffle words
    shuffleArray(allWords);

    // Select words based on difficulty
    let wordCount;
    switch(difficulty) {
        case 'easy':
            wordCount = 5;
            break;
        case 'medium':
            wordCount = 8;
            break;
        case 'hard':
            wordCount = 12;
            break;
        default:
            wordCount = 5;
    }

    // Select the words
    wordList = allWords.slice(0, wordCount);
}

// Generate the puzzle grid with hidden words
function generatePuzzle() {
    // Initialize empty grid
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));

    // Place each word in the grid
    wordList.forEach(word => {
        placeWord(word);
    });

    // Fill remaining empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = getRandomLetter();
            }
        }
    }
}

// Place a word in the grid
function placeWord(word) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
        // Random orientation (0: horizontal, 1: vertical, 2: diagonal down, 3: diagonal up)
        let orientation;
        if (difficulty === 'easy') {
            // Easy: only horizontal and vertical
            orientation = Math.floor(Math.random() * 2);
        } else if (difficulty === 'medium') {
            // Medium: horizontal, vertical, and diagonal down
            orientation = Math.floor(Math.random() * 3);
        } else {
            // Hard: all directions
            orientation = Math.floor(Math.random() * 4);
        }

        // Random starting position
        let row, col;
        let fits = false;

        switch (orientation) {
            case 0: // Horizontal
                row = Math.floor(Math.random() * gridSize);
                col = Math.floor(Math.random() * (gridSize - word.length + 1));
                fits = checkFit(word, row, col, 0, 1);
                break;
            case 1: // Vertical
                row = Math.floor(Math.random() * (gridSize - word.length + 1));
                col = Math.floor(Math.random() * gridSize);
                fits = checkFit(word, row, col, 1, 0);
                break;
            case 2: // Diagonal down
                row = Math.floor(Math.random() * (gridSize - word.length + 1));
                col = Math.floor(Math.random() * (gridSize - word.length + 1));
                fits = checkFit(word, row, col, 1, 1);
                break;
            case 3: // Diagonal up
                row = Math.floor(Math.random() * (gridSize - word.length + 1)) + word.length - 1;
                col = Math.floor(Math.random() * (gridSize - word.length + 1));
                fits = checkFit(word, row, col, -1, 1);
                break;
        }

        if (fits) {
            // Place the word
            for (let i = 0; i < word.length; i++) {
                const r = row + i * (orientation === 0 ? 0 : orientation === 1 ? 1 : orientation === 2 ? 1 : -1);
                const c = col + i * (orientation === 1 ? 0 : 1);
                grid[r][c] = word[i];
            }
            return true;
        }

        attempts++;
    }

    // If we couldn't place the word after max attempts, try a different approach
    // (This could be improved with better placement algorithms)
    console.warn(`Could not place word: ${word}`);
    return false;
}

// Check if a word fits at a specific position and orientation
function checkFit(word, row, col, rowDelta, colDelta) {
    for (let i = 0; i < word.length; i++) {
        const r = row + i * rowDelta;
        const c = col + i * colDelta;

        // Check bounds
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
            return false;
        }

        // Check if cell is empty or has the same letter
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            return false;
        }
    }

    return true;
}

// Get a random uppercase letter
function getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
}

// Render the puzzle grid
function renderPuzzle() {
    puzzleGrid.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('puzzle-cell');
            cell.textContent = grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Check if this cell is part of a found word
            const isHighlighted = isPartOfFoundWord(row, col);
            if (isHighlighted) {
                cell.classList.add('highlighted');
            }

            // Add event listeners
            cell.addEventListener('mousedown', startSelection);
            cell.addEventListener('mouseover', continueSelection);

            puzzleGrid.appendChild(cell);
        }
    }

    // Add mouseup event to document
    document.addEventListener('mouseup', endSelection);
}

// Check if a cell is part of a found word
function isPartOfFoundWord(row, col) {
    for (const word of foundWords) {
        for (const cell of word.cells) {
            if (cell.row === row && cell.col === col) {
                return true;
            }
        }
    }
    return false;
}

// Render the word list
function renderWordList() {
    wordListElement.innerHTML = '';

    wordList.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.classList.add('word-item');

        if (foundWords.some(found => found.word === word)) {
            wordItem.classList.add('found');
        }

        wordItem.textContent = word;
        wordListElement.appendChild(wordItem);
    });
}

// Start selecting cells
function startSelection(event) {
    const cell = event.target;
    if (!cell.classList.contains('puzzle-cell')) return;

    // Clear previous selection
    clearSelection();

    // Start new selection
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    selectedCells.push({ element: cell, row, col });
    cell.classList.add('selected');
}

// Continue selection
function continueSelection(event) {
    if (selectedCells.length === 0) return;

    const cell = event.target;
    if (!cell.classList.contains('puzzle-cell')) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Check if this is a valid next cell (adjacent to last selected cell)
    const lastCell = selectedCells[selectedCells.length - 1];

    // Check if cell is already selected
    if (selectedCells.some(c => c.row === row && c.col === col)) {
        // If it's the first cell, deselect all cells in between
        if (row === selectedCells[0].row && col === selectedCells[0].col && selectedCells.length > 1) {
            checkForWord();
        }
        return;
    }

    // Determine direction
    let rowDelta = 0;
    let colDelta = 0;

    if (selectedCells.length === 1) {
        // First movement determines direction
        rowDelta = row - lastCell.row;
        colDelta = col - lastCell.col;

        // Only allow straight lines
        if (rowDelta !== 0 && colDelta !== 0) {
            // Diagonal - check if it's a 45-degree angle
            if (Math.abs(rowDelta) !== Math.abs(colDelta)) {
                return;
            }
        }
    } else {
        // Continue in same direction
        const prevCell = selectedCells[selectedCells.length - 2];
        rowDelta = lastCell.row - prevCell.row;
        colDelta = lastCell.col - prevCell.col;

        // Check if new cell continues the line
        if (row - lastCell.row !== rowDelta || col - lastCell.col !== colDelta) {
            return;
        }
    }

    // Add new cell to selection
    selectedCells.push({ element: cell, row, col });
    cell.classList.add('selected');
}

// End selection and check for word
function endSelection() {
    if (selectedCells.length === 0) return;

    checkForWord();
}

// Check if the selected cells form a word
function checkForWord() {
    if (selectedCells.length < 2) {
        clearSelection();
        return;
    }

    // Extract the word from selected cells
    let word = '';
    selectedCells.forEach(cell => {
        word += grid[cell.row][cell.col];
    });

    // Check if word is in our list
    const wordIndex = wordList.indexOf(word);

    if (wordIndex !== -1) {
        // Word found!
        if (!foundWords.some(found => found.word === word)) {
            foundWords.push({ word, cells: [...selectedCells] });

            // Update display
            foundCountElement.textContent = foundWords.length;

            // Highlight cells as found
            selectedCells.forEach(cell => {
                cell.element.classList.add('highlighted');
            });

            // Update word list
            renderWordList();

            // Check if all words are found
            if (foundWords.length === wordList.length) {
                setTimeout(() => {
                    alert('Congratulations! You found all the words!');
                }, 300);
            }
        }
    }

    // Clear selection
    clearSelection();
}

// Clear the current selection
function clearSelection() {
    selectedCells.forEach(cell => {
        if (!isPartOfFoundWord(cell.row, cell.col)) {
            cell.element.classList.remove('selected');
        }
    });

    selectedCells = [];
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Difficulty buttons
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.level;
        initGame();
    });
});

// Reset button
resetBtn.addEventListener('click', () => {
    // Clear found words but keep the same puzzle
    foundWords = [];
    foundCountElement.textContent = 0;
    renderWordList();
    renderPuzzle();
});

// New game button
newGameBtn.addEventListener('click', initGame);

// Back button
backBtn.addEventListener('click', () => {
    if (window.parent.location !== window.location) {
        // If in an iframe, try to communicate with parent
        window.parent.postMessage('backToHome', '*');
    } else {
        // Fallback - could redirect to a homepage
        alert('Back to home functionality would go here.');
        // If you have a home page, you can uncomment the line below and replace the URL
        // window.location.href = 'home.html';
    }
});

// Initialize the game on load
window.addEventListener('load', initGame);


