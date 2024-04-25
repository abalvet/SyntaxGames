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
let spawnInterval;

// Set the fall duration for words
const fallDuration = 10000;
const keyStates = {};

// Player details with cooldown for shooting
const player = {
    x: canvas.width / 2 - 25, // Center the player initially
    y: canvas.height - 70,     // Positioned towards the bottom of the canvas
    width: 50,
    height: 50,
    bullets: [],
    moveSpeed: 5,
    shooting: false,
    shootCooldown: 0,  // Cooldown in frames (e.g., 20 frames between shots)
    cooldownRate: 20   // Frames to wait before next shot
};

// Load the ship image
const playerImage = new Image();
playerImage.src = 'ship.png'; // Ensure this path is correct
playerImage.onload = function() {
    requestId = requestAnimationFrame(updateGame); // Start the game when the image is loaded
};

// Sound setup
const backgroundMusic = document.getElementById('backgroundMusic');
const spawnSound = document.getElementById('spawnSound');
const hitTargetSound = document.getElementById('hitTargetSound');
const hitDistractorSound = document.getElementById('hitDistractorSound');

document.addEventListener('keydown', (e) => {
    keyStates[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyStates[e.key] = false;
});

function updateGame() {
    const currentTime = Date.now();
    handleControls();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateBullets(currentTime);
    updateWords(currentTime);
    manageCooldown();
    if (gameActive) {
        requestId = requestAnimationFrame(updateGame);
    }
}

function handleControls() {
    if (keyStates['ArrowLeft']) {
        player.x = Math.max(0, player.x - player.moveSpeed);
    }
    if (keyStates['ArrowRight']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.moveSpeed);
    }
    if (keyStates[' '] && gameActive && !player.shooting && player.shootCooldown <= 0) {
        shoot();
        player.shooting = true; // Prevent continuous shooting without key release
        player.shootCooldown = player.cooldownRate; // Reset cooldown
    } else if (!keyStates[' ']) {
        player.shooting = false;
    }
}

function manageCooldown() {
    if (player.shootCooldown > 0) {
        player.shootCooldown--; // Decrease cooldown by one each frame
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function shoot() {
    if (player.bullets.length < 5) { // Limit number of bullets
        player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 10 });
    }
}

