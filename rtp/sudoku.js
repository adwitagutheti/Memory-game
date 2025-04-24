document.addEventListener('DOMContentLoaded', () => {
    const sudokuBoard = document.getElementById('sudoku-board');
    const startSudokuBtn = document.querySelector('.start-sudoku-btn');
    const solveSudokuBtn = document.querySelector('.solve-sudoku-btn');
    const checkSudokuBtn = document.querySelector('.check-sudoku-btn');
    const gridSize = 9;
    let currentBoard = [];
    let solutionBoard = [];

    function generateSudoku() {
        currentBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
        fillDiagonalBoxes();
        fillRemaining(0, 0);
        solutionBoard = currentBoard.map(row => [...row]); // Store the solution
        removeCells(40);
        return currentBoard;
    }

    function fillDiagonalBoxes() {
        for (let i = 0; i < gridSize; i += 3) {
            fillBox(i, i);
        }
    }

    function fillBox(rowStart, colStart) {
        let nums = [...Array(9).keys()].map(i => i + 1);
        shuffleArray(nums);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                currentBoard[rowStart + i][colStart + j] = nums.pop();
            }
        }
    }

    function isSafe(row, col, num, board) {
        board = board || currentBoard;
        // Check row
        if (board[row].includes(num)) return false;
        // Check column
        for (let i = 0; i < gridSize; i++) {
            if (board[i][col] === num) return false;
        }
        // Check 3x3 box
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRowStart + i][boxColStart + j] === num) return false;
            }
        }
        return true;
    }

    function fillRemaining(row, col, board) {
        board = board || currentBoard;
        if (col >= gridSize) {
            col = 0;
            row++;
        }
        if (row >= gridSize) return true;

        if (board[row][col] !== 0) {
            return fillRemaining(row, col + 1, board);
        }

        let nums = [...Array(9).keys()].map(i => i + 1);
        shuffleArray(nums);

        for (const num of nums) {
            if (isSafe(row, col, num, board)) {
                board[row][col] = num;
                if (fillRemaining(row, col + 1, board)) {
                    return true;
                }
                board[row][col] = 0; // Backtrack
            }
        }
        return false;
    }

    function removeCells(count) {
        let removed = 0;
        const cells = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                cells.push({ row: i, col: j });
            }
        }
        shuffleArray(cells);

        for (let i = 0; i < count && i < cells.length; i++) {
            const { row, col } = cells[i];
            currentBoard[row][col] = 0;
        }
    }

    function displaySudoku() {
        sudokuBoard.innerHTML = '';
        for (let i = 0; i < gridSize; i++) {
            const row = document.createElement('div');
            row.classList.add('sudoku-row');
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('input');
                cell.type = 'number';
                cell.min = '1';
                cell.max = '9';
                cell.classList.add('sudoku-cell');
                cell.value = currentBoard[i][j] === 0 ? '' : currentBoard[i][j];
                if (currentBoard[i][j] !== 0) {
                    cell.readOnly = true;
                    cell.classList.add('original');
                }
                if ((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0) {
                    cell.classList.add('shaded');
                }
                cell.addEventListener('input', () => validateInput(i, j, cell.value));
                row.appendChild(cell);
            }
            sudokuBoard.appendChild(row);
        }
    }

    function validateInput(row, col, value) {
        const cell = sudokuBoard.querySelector(`.sudoku-row:nth-child(${row + 1}) .sudoku-cell:nth-child(${col + 1})`);
        if (value && (parseInt(value) < 1 || parseInt(value) > 9 || isNaN(parseInt(value)))) {
            cell.value = '';
            return;
        }
        currentBoard[row][col] = parseInt(value) || 0;
        cell.classList.remove('incorrect'); // Clear any previous incorrect marking
    }

    function solveSudoku() {
        currentBoard = solutionBoard.map(row => [...row]);
        displaySudoku();
    }

    function checkSudoku() {
        const inputs = sudokuBoard.querySelectorAll('.sudoku-cell:not(.original)');
        let isCorrect = true;
        inputs.forEach((input, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const inputValue = parseInt(input.value) || 0;
            if (inputValue !== solutionBoard[row][col]) {
                isCorrect = false;
                input.classList.add('incorrect');
            } else {
                input.classList.remove('incorrect');
            }
        });
        if (isCorrect) {
            alert("Congratulations! You solved the Sudoku!");
        } else {
            alert("Keep trying! Some cells are incorrect.");
        }
    }

    function startNewSudoku() {
        generateSudoku();
        displaySudoku();
    }

    if (startSudokuBtn) {
        startSudokuBtn.addEventListener('click', startNewSudoku);
    }

    if (solveSudokuBtn) {
        solveSudokuBtn.addEventListener('click', solveSudoku);
    }

    if (checkSudokuBtn) {
        checkSudokuBtn.addEventListener('click', checkSudoku);
    }

    // Initial load
    startNewSudoku();
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
