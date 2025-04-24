document.addEventListener('DOMContentLoaded', () => {
    const pathFinderCanvas = document.getElementById('pathFinderCanvas');
    const pfCtx = pathFinderCanvas.getContext('2d');
    const pathFinderStartButton = document.getElementById('pathFinderStartButton');
    const pathFinderRegenerateButton = document.getElementById('pathFinderRegenerateButton');
    const pathFinderMessageDisplay = document.getElementById('pathFinderMessage');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const PF_CELL_SIZE = 20;
    let pfGridWidth = pathFinderCanvas.width / PF_CELL_SIZE;
    let pfGridHeight = pathFinderCanvas.height / PF_CELL_SIZE;
    let pfMaze = [];
    let pfPlayer = { x: 1, y: 1 };
    let pfGoal = { x: pfGridWidth - 2, y: pfGridHeight - 2 };
    let pfGameRunning = false;

    const PF_WALL = 1;
    const PF_PATH = 0;
    const PF_PLAYER_COLOR = 'green';
    const PF_GOAL_COLOR = 'blue';
    const PF_WALL_COLOR = '#333';
    const PF_PATH_COLOR = '#eee';
    const PF_DIRECTIONS = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];

    // Utility function to shuffle an array in place (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generatePFMaze(width, height) {
        const grid = Array(height).fill(null).map(() => Array(width).fill(PF_WALL));

        function carvePFPath(x, y) {
            grid[y][x] = PF_PATH;
            const shuffledDirections = [...PF_DIRECTIONS]; // Create a copy to shuffle
            shuffleArray(shuffledDirections);

            for (const dir of shuffledDirections) {
                const newX = x + 2 * dir.dx;
                const newY = y + 2 * dir.dy;

                if (newX > 0 && newX < width - 1 && newY > 0 && newY < height - 1 && grid[newY][newX] === PF_WALL) {
                    grid[y + dir.dy][x + dir.dx] = PF_PATH;
                    carvePFPath(newX, newY);
                }
            }
        }

        carvePFPath(1, 1);
        return grid;
    }

    function getRandomPFGoalPosition() {
        const pathCells = [];
        for (let y = 0; y < pfGridHeight; y++) {
            for (let x = 0; x < pfGridWidth; x++) {
                if (pfMaze[y][x] === PF_PATH && !(x === pfPlayer.x && y === pfPlayer.y)) {
                    const distance = Math.abs(pfPlayer.x - x) + Math.abs(pfPlayer.y - y);
                    if (distance > 10) {
                        pathCells.push({ x, y });
                    }
                }
            }
        }
        return pathCells.length > 0 ? pathCells[Math.floor(Math.random() * pathCells.length)] : { x: pfGridWidth - 2, y: pfGridHeight - 2 };
    }

    function drawPFMaze() {
        pfCtx.clearRect(0, 0, pathFinderCanvas.width, pathFinderCanvas.height);
        for (let y = 0; y < pfGridHeight; y++) {
            for (let x = 0; x < pfGridWidth; x++) {
                pfCtx.fillStyle = pfMaze[y][x] === PF_WALL ? PF_WALL_COLOR : PF_PATH_COLOR;
                pfCtx.fillRect(x * PF_CELL_SIZE, y * PF_CELL_SIZE, PF_CELL_SIZE, PF_CELL_SIZE);
            }
        }
        pfCtx.fillStyle = PF_PLAYER_COLOR;
        pfCtx.fillRect(pfPlayer.x * PF_CELL_SIZE, pfPlayer.y * PF_CELL_SIZE, PF_CELL_SIZE, PF_CELL_SIZE);
        pfCtx.fillStyle = PF_GOAL_COLOR;
        pfCtx.fillRect(pfGoal.x * PF_CELL_SIZE, pfGoal.y * PF_CELL_SIZE, PF_CELL_SIZE, PF_CELL_SIZE);
    }

    function handlePFKeyDown(event) {
        if (!pfGameRunning) return;

        let newX = pfPlayer.x;
        let newY = pfPlayer.y;

        switch (event.key) {
            case 'ArrowUp': newY--; break;
            case 'ArrowDown': newY++; break;
            case 'ArrowLeft': newX--; break;
            case 'ArrowRight': newX++; break;
            default: return; // Ignore other keys
        }

        // Check for valid move within bounds and if it's a path
        if (newY >= 0 && newY < pfGridHeight && newX >= 0 && newX < pfGridWidth && pfMaze[newY][newX] === PF_PATH) {
            pfPlayer.x = newX;
            pfPlayer.y = newY;
            drawPFMaze();

            if (pfPlayer.x === pfGoal.x && pfPlayer.y === pfGoal.y) {
                endGame('Path Found! Well Done!');
            }
        }
    }

    function initPathFinderGame() {
        pfGridWidth = Math.floor(pathFinderCanvas.width / PF_CELL_SIZE);
        pfGridHeight = Math.floor(pathFinderCanvas.height / PF_CELL_SIZE);
        pfMaze = generatePFMaze(pfGridWidth, pfGridHeight);
        pfPlayer = { x: 1, y: 1 };
        pfGoal = getRandomPFGoalPosition();
        pfGameRunning = true;
        pathFinderMessageDisplay.textContent = 'Navigate to the Blue!';
        drawPFMaze();
    }

    function endGame(message) {
        pfGameRunning = false;
        pathFinderMessageDisplay.textContent = message;
        startConfetti();
        setTimeout(() => {
            stopConfetti();
            initPathFinderGame();
        }, 3000);
    }

    // Confetti Logic
    let confettiParticles = [];
    const NUM_CONFETTI = 100;
    const CONFETTI_GRAVITY = 0.3;
    const CONFETTI_VELOCITY = 2;
    const CONFETTI_COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    let confettiInterval;

    function createConfetti() {
        confettiParticles = Array.from({ length: NUM_CONFETTI }, () => ({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height / 2,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: Math.random() * 10 + 5,
            velocityX: Math.random() * CONFETTI_VELOCITY - (CONFETTI_VELOCITY / 2),
            velocityY: Math.random() * CONFETTI_VELOCITY / 2 + CONFETTI_VELOCITY / 2,
            opacity: 1,
            decay: 0.03 + Math.random() * 0.02,
        }));
    }

    function drawConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach(p => {
            confettiCtx.beginPath();
            confettiCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            confettiCtx.fillStyle = p.color;
            confettiCtx.globalAlpha = p.opacity;
            confettiCtx.fill();
            confettiCtx.closePath();
        });
    }

    function updateConfetti() {
        confettiParticles = confettiParticles.filter(p => {
            p.y += p.velocityY;
            p.x += p.velocityX;
            p.velocityY += CONFETTI_GRAVITY;
            p.opacity -= p.decay;
            return p.y <= confettiCanvas.height && p.opacity > 0;
        });
    }

    function startConfetti() {
        confettiCanvas.style.display = 'block';
        createConfetti();
        confettiInterval = setInterval(() => {
            drawConfetti();
            updateConfetti();
            if (confettiParticles.length === 0) {
                stopConfetti();
            }
        }, 16);
    }

    function stopConfetti() {
        clearInterval(confettiInterval);
        confettiInterval = null;
        confettiParticles = [];
        confettiCanvas.style.display = 'none';
    }

    // Event Listeners
    pathFinderStartButton.addEventListener('click', initPathFinderGame);
    pathFinderRegenerateButton.addEventListener('click', initPathFinderGame);
    document.addEventListener('keydown', handlePFKeyDown);

    // Initialize the game on page load
    initPathFinderGame();
});