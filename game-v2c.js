// Get canvas and setup context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Loading images
const backgroundImage = new Image();
backgroundImage.src = 'background.png';  // Ensure this path is correct

const playerImage = new Image();
playerImage.src = 'ship3.png';  // Ensure this path is correct

// Sound setup
const backgroundMusic = document.getElementById('backgroundMusic');
const spawnSound = document.getElementById('spawnSound');
const hitTargetSound = document.getElementById('hitTargetSound');
const hitDistractorSound = document.getElementById('hitDistractorSound');

// Game elements
const words = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "et", "ou", "est", "ai", "haie", "hait", "où", "qui", "que", "quoi", "dont", "clair", "par", "pour", "part", "mais", "mes", "sien", "chien", "mont", "mon", "ton", "thon", "leur", "leurre", "voue", "noue", "ailes", "îles", "maison", "ont"];
const gameObjects = [];
const scoreElement = document.getElementById('score');
let score = 0;
let gameActive = false;
let spawnInterval;
let requestId;

// Player details
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    bullets: [],
    moveSpeed: 5,
    shooting: false
};

// Initialize game elements once all resources are loaded
backgroundImage.onload = () => {
    playerImage.onload = drawInitialScreen;
};

function drawInitialScreen() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.font = '28px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText("Click to Start Game", canvas.width / 2, canvas.height / 2);
    canvas.addEventListener('click', startGame, { once: true });
}

function startGame() {
    gameActive = true;
    backgroundMusic.play().catch(e => console.log("Error playing background music: " + e));
    spawnWords();
    requestId = requestAnimationFrame(updateGame);
}

function updateGame() {
    const currentTime = Date.now();
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Redraw background each frame
    handleControls();
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
    if (keyStates[' '] && gameActive && !player.shooting) {
        shoot();
        player.shooting = true;
    } else {
        player.shooting = false;
    }
}

function shoot() {
    if (player.bullets.length < 5) {
        player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 10 });
        playSound(spawnSound);
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
                if (isColliding(bullet, obj)) {
                    player.bullets.splice(bulletIndex, 1);
                    gameObjects.splice(objIndex, 1);
                    score += obj.grammatical ? 1 : -1;
                    scoreElement.textContent = `Score: ${score}`;
                    playSound(obj.grammatical ? hitTargetSound : hitDistractorSound);
                }
            });
        }
    });
}

function isColliding(bullet, obj) {
    let objWidth = ctx.measureText(obj.word).width;
    if (bullet.x + 5 >= obj.x && bullet.x <= obj.x + objWidth && bullet.y <= obj.y + 20 && bullet.y + 10 >= obj.y) {
        return true;
    }
    return false;
}

function updateWords(currentTime) {
    gameObjects.forEach(obj => {
        const elapsedTime = currentTime - obj.startTime;
        const fallProgress = elapsedTime / fallDuration;
        obj.y = fallProgress * canvas.height;
        if (fallProgress < 1) {
            ctx.font = '30px Arial';
            ctx.fillStyle = `rgba(${obj.grammatical ? 255 : 128}, ${obj.grammatical ? 255 : 128}, ${obj.grammatical ? 255 : 128}, ${1 - fallProgress})`;
            ctx.fillText(obj.word, obj.x, obj.y);
        }
    });
}

function playSound(sound) {
    sound.play().catch(e => console.log("Failed to play sound: " + e.message));
}

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    keyStates[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyStates[e.key] = false;
});
