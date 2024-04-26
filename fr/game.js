// Get canvas and setup context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const words = ["he", "as", "with", "can", "dog", "cat", "beautiful", "swiftly"];
const gameObjects = [];
const scoreElement = document.getElementById('score');
let score = 0;
let gameActive = false;

// Set the fall duration for words
const fallDuration = 10000;
const keyStates = {};

// Player details
const player = {
    x: canvas.width / 2 - 25, // Center the player initially
    y: canvas.height - 70,     // Positioned towards the bottom of the canvas
    width: 50,
    height: 50,
    bullets: [],
    moveSpeed: 5,
    shooting: false
};

// Load the ship image
const playerImage = new Image();
playerImage.onload = function() {
    if (!requestId) { // Only start the game loop if it hasn't started yet
        requestId = requestAnimationFrame(updateGame);
    }
};
playerImage.src = 'ship.png'; // Ensure this path is correct

// Sound setup and game control
const backgroundMusic = document.getElementById('backgroundMusic');
const startPauseButton = document.getElementById('startPauseButton');
let requestId; // To hold the requestAnimationFrame ID for managing the game loop

startPauseButton.addEventListener('click', function() {
    toggleGame();
});

function toggleGame() {
    if (!gameActive) {
        gameActive = true;
        backgroundMusic.play();
        startPauseButton.textContent = 'Pause';
        spawnWords(); // Start spawning words
        requestId = requestAnimationFrame(updateGame); // Start or resume the game loop
    } else {
        gameActive = false;
        backgroundMusic.pause();
        clearInterval(spawnInterval);
        startPauseButton.textContent = 'Start';
        cancelAnimationFrame(requestId); // Pause the game loop
    }
}

function spawnWords() {
    spawnInterval = setInterval(() => {
        if (gameActive) {
            const word = words[Math.floor(Math.random() * words.length)];
            const x = Math.random() * (canvas.width - 50);
            const grammatical = new Set(["he", "as", "with", "can", "swiftly"]).has(word);
            gameObjects.push({ word, x, y: 0, startTime: Date.now(), grammatical });
        }
    }, 2000);
}

function updateGame() {
    const currentTime = Date.now();
    handleControls();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateBullets(currentTime);
    updateWords(currentTime);
    if (gameActive) {
        requestId = requestAnimationFrame(updateGame);
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function handleControls() {
    if (keyStates['ArrowLeft']) {
        player.x = Math.max(0, player.x - player.moveSpeed);
    }
    if (keyStates['ArrowRight']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.moveSpeed);
    }
    if (keyStates[' '] && gameActive) {
        if (!player.shooting) {
            shoot();
            player.shooting = true; // Prevent continuous shooting without key release
        }
    } else {
        player.shooting = false;
    }
}

document.addEventListener('keydown', (e) => {
    keyStates[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyStates[e.key] = false;
});

function shoot() {
    if (player.bullets.length < 5) { // Limit number of bullets
        player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 10 });
    }
}

function updateBullets(currentTime) {
    player.bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            player.bullets.splice(bulletIndex, 1);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(bullet.x, bullet.y, 5, 10);
            gameObjects.forEach((obj, objIndex) => {
                if (bullet.y <= obj.y + 20 && bullet.y + 10 >= obj.y && bullet.x >= obj.x && bullet.x <= obj.x + ctx.measureText(obj.word).width) {
                    player.bullets.splice(bulletIndex, 1);
                    gameObjects.splice(objIndex, 1);
                    score += obj.grammatical ? 1 : -1;
                    scoreElement.textContent = `Score: ${score}`;
                }
            });
        }
    });
}

function updateWords(currentTime) {
    gameObjects.forEach(obj => {
        const elapsedTime = currentTime - obj.startTime;
        const fallProgress = elapsedTime / fallDuration;
        obj.y = fallProgress * canvas.height;
        if (fallProgress < 1) {
            ctx.font = '20px Arial';
            ctx.fillStyle = `rgba(${obj.grammatical ? 255 : 128}, ${obj.grammatical ? 255 : 128}, ${obj.grammatical ? 255 : 128}, ${1 - fallProgress})`;
            ctx.fillText(obj.word, obj.x, obj.y);
        }
    });
}

