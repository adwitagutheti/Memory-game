document.addEventListener('DOMContentLoaded', () => {
    const movesCount = document.getElementById('moves-count');
    const timeDisplay = document.getElementById('time');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const gameContainer = document.querySelector('.memory-game');
    const restartBtn = document.querySelector('.restart-btn');
    const playAgainBtn = document.querySelector('.play-again-btn');
    const congratsScreen = document.querySelector('.congrats-screen');
    const gameScreen = document.querySelector('.game-screen');

    let moves = 0;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let timer;
    let seconds = 0;
    let matchedPairs = 0;
    const cardIcons = ['🌸', '🌹', '🌷', '🌻', '🌼', '🌺', '🏵️', '💐'];
    let cards = [...cardIcons, ...cardIcons];

    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
    function formatTime(totalSeconds) { const minutes = Math.floor(totalSeconds / 60); const remainingSeconds = totalSeconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }
    function resetGame() { moves = 0; seconds = 0; matchedPairs = 0; hasFlippedCard = false; lockBoard = false; firstCard = null; secondCard = null; movesCount.textContent = moves; timeDisplay.textContent = formatTime(seconds); clearInterval(timer); gameContainer.innerHTML = ''; }
    function createCards() { if (!gameContainer) return; cards.forEach(icon => { const card = document.createElement('div'); card.classList.add('memory-card'); card.dataset.icon = icon; const frontFace = document.createElement('div'); frontFace.classList.add('front-face'); frontFace.textContent = icon; const backFace = document.createElement('div'); backFace.classList.add('back-face'); backFace.textContent = '?'; card.appendChild(frontFace); card.appendChild(backFace); card.addEventListener('click', flipCard); gameContainer.appendChild(card); }); }
    function flipCard() { if (lockBoard || this === firstCard || this.classList.contains('flip')) return; this.classList.add('flip'); if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; } secondCard = this; checkForMatch(); updateMoves(); }
    function checkForMatch() { lockBoard = true; if (firstCard.dataset.icon === secondCard.dataset.icon) { handleMatch(); } else { handleMismatch(); } }
    function handleMatch() { firstCard.removeEventListener('click', flipCard); secondCard.removeEventListener('click', flipCard); setTimeout(() => { firstCard.classList.add('matched'); secondCard.classList.add('matched'); resetBoard(); matchedPairs++; if (matchedPairs === cardIcons.length) { endGame(); } }, 700); }
    function handleMismatch() { setTimeout(() => { firstCard.classList.remove('flip', 'shake'); secondCard.classList.remove('flip', 'shake'); resetBoard(); }, 1000); firstCard.classList.add('shake'); secondCard.classList.add('shake'); }
    function resetBoard() { [hasFlippedCard, lockBoard, firstCard, secondCard] = [false, false, null, null]; }
    function updateMoves() { moves++; movesCount.textContent = moves; }
    function startTimer() { clearInterval(timer); timer = setInterval(() => { seconds++; timeDisplay.textContent = formatTime(seconds); }, 1000); }
    function stopTimer() { clearInterval(timer); }
    function endGame() { stopTimer(); finalMoves.textContent = moves; finalTime.textContent = formatTime(seconds); setTimeout(() => { gameScreen.style.display = 'none'; congratsScreen.style.display = 'flex'; createConfetti(); }, 1000); }
    function createConfetti() { const colors = ['#f0f', '#0ff', '#ff0', '#0f0', '#00f', '#f00']; const duration = 3000; const particles = 150; for (let i = 0; i < particles; i++) { const confetti = document.createElement('div'); confetti.classList.add('confetti'); const size = Math.random() * 10 + 5; const x = Math.random() * window.innerWidth; const y = Math.random() * window.innerHeight; const color = colors[Math.floor(Math.random() * colors.length)]; const rotation = Math.random() * 360; const animationDuration = Math.random() * 2 + 2; confetti.style.width = `${size}px`; confetti.style.height = `${size}px`; confetti.style.backgroundColor = color; confetti.style.left = `${x}px`; confetti.style.top = `${y - window.innerHeight}px`; confetti.style.transform = `rotate(${rotation}deg)`; confetti.style.animation = `confetti-fall ${animationDuration}s ease-out forwards`; document.body.appendChild(confetti); setTimeout(() => { confetti.remove(); }, duration + animationDuration * 1000); } }

    resetGame();
    shuffleArray(cards);
    createCards();
    startTimer();

    if (restartBtn) {
        restartBtn.addEventListener('click', resetGame);
    }

    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            congratsScreen.style.display = 'none';
            gameScreen.style.display = 'flex';
            resetGame();
            shuffleArray(cards);
            createCards();
            startTimer();
        });
    }
});