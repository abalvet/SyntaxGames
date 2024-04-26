// Get the canvas context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configurations
const GRAVITY = 0.5;
const ENEMY_SPEED = 0.01;
const BULLET_SPEED = 5;
const ENEMY_SPAWN_INTERVAL = 1500; // Spawn interval in milliseconds
const GAME_TIME_LIMIT = 30000; // 30 seconds in milliseconds

// Game state
let isGameOver = false;
let score = 0;
let timeLeft = 30; // Initial time left in seconds

// Images
let shipImage = new Image();
shipImage.src = 'crayon-ship.png'; // Replace with your ship image
let backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Replace with your background image

// Sounds
let backgroundMusic;
let shootSound;
let hitTargetSound;
let hitDistractorSound;
let winSound;
let loseSound;

// Ship object
let ship = {
    x: canvas.width / 2 - 30, // Initial x position (centered with 60px width)
    y: canvas.height - 70, // Initial y position (with some bottom padding)
    width: 60, // Ship width
    height: 60, // Ship height
    speed: 10 // Ship movement speed
};

// Event listener for arrow keys
document.addEventListener('keydown', (e) => { // Attach to the document instead of the canvas
    if (e.keyCode === 37) { // Left arrow key
        ship.x -= ship.speed;
        if (ship.x < 0) {
            ship.x = 0; // Prevent ship from moving off the left edge
        }
    } else if (e.keyCode === 39) { // Right arrow key
        ship.x += ship.speed;
        if (ship.x > canvas.width - ship.width) {
            ship.x = canvas.width - ship.width; // Prevent ship from moving off the right edge
        }
    }
});

// Event listener for space bar
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) { // Space bar
        const bulletX = ship.x + ship.width / 2 - 5; // Shoot from the center of the ship
        const bulletY = ship.y - 10; // Shoot above the ship
        shootBullet(bulletX, bulletY);
        shootSound.play();
    }
});

// Load sounds
function loadSounds() {
    backgroundMusic = new Audio('syntax-invaders-v2.mp3'); // Replace with your background music
    shootSound = new Audio('shoot.mp3'); // Replace with your shoot sound
    hitTargetSound = new Audio('laser1.mp3'); // Replace with your hit target sound
    hitDistractorSound = new Audio('error.mp3'); // Replace with your hit distractor sound
    winSound = new Audio('win.mp3'); // Replace with your win sound
    loseSound = new Audio('game-over.mp3'); // Replace with your lose sound
}

// Words
const targetWords = ['the', 'a', 'and', 'to', 'of', 'in', 'for', 'with', 'on', 'but']; // Example target words
const distractorWords = ['cat', 'jump', 'happy', 'running', 'green', 'talk', 'laugh', 'sing', 'dance', 'walk']; // Example distractor words

// Enemies
const enemies = [];

function spawnEnemy() {
    const word = Math.random() < 0.5 ? targetWords[Math.floor(Math.random() * targetWords.length)] : distractorWords[Math.floor(Math.random() * distractorWords.length)];
    const x = Math.random() * (canvas.width - 50);
    const y = 0; // Spawn at the top
    const enemy = { word, x, y, width: 50, height: 20, velocity: ENEMY_SPEED, alpha: 1 };
    enemies.push(enemy);
}

// Bullets
const bullets = [];

function shootBullet(x, y) {
    const bullet = { x, y, velocity: BULLET_SPEED };
    bullets.push(bullet);
}

// Collision detection
function collide(enemy, bullet) {
    return enemy.x < bullet.x + 10 && enemy.x + enemy.width > bullet.x && enemy.y < bullet.y + 10 && enemy.y + enemy.height > bullet.y;
}

// Update game objects
function update(dt) {
    if (!isGameOver) {
        timeLeft -= dt / 1000; // Decrease time left

        // Spawn enemies randomly
        if (Math.random() < dt / ENEMY_SPAWN_INTERVAL) {
            spawnEnemy();
        }

        // Update enemies
        enemies.forEach(enemy => {
            enemy.y += enemy.velocity * dt;
            enemy.y += GRAVITY * dt; // Simulate gravity
            enemy.alpha -= 0.001; // Fade out while falling
        });

        // Remove enemies that fall off the screen
        enemies.forEach((enemy, index) => {
            if (enemy.y > canvas.height) {
                enemies.splice(index, 1);
            }
        });

        // Update bullets
        bullets.forEach(bullet => {
            bullet.y -= bullet.velocity * dt;
        });

        // Remove bullets that go off the screen
        bullets.forEach((bullet, index) => {
            if (bullet.y < 0) {
                bullets.splice(index, 1);
            }
        });

        // Check collisions
        enemies.forEach((enemy, enemyIndex) => {
            bullets.forEach((bullet, bulletIndex) => {
                if (collide(enemy, bullet)) {
                    if (targetWords.includes(enemy.word)) {
                        score++;
                        hitTargetSound.play();
                    } else {
                        score--;
                        hitDistractorSound.play();
                    }
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                }
            });
        });

        // Game win condition
        if (score >= 10) {
            isGameOver = true;
            winSound.play();
        }

        // Game lose condition
        if (score <= -2 || timeLeft <= 0) {
            isGameOver = true;
            loseSound.play();
        }
    }
}

// Draw game objects
function draw() {
    if (!ctx) {
        console.error("Canvas context is null. Unable to draw on the canvas.");
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Drawing background...");

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw ship
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);




    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + enemy.alpha + ')';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(enemy.word, enemy.x + 10, enemy.y + 15);
    });

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });

    // Draw score and time left
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Time left: ${timeLeft.toFixed(1)}s`, canvas.width - 150, 30);

    // Draw game over message if game is over
    if (isGameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText(score >= 10 ? 'You Won!' : 'Game Over', canvas.width / 2 - 200, canvas.height / 2);
    }
}



// Game loop
function gameLoop() {
    const now = Date.now();
    console.log("Game loop running...");
    const dt = now - then;
    then = now;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}
let then = Date.now();
gameLoop();

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shootBullet(x, y);
    shootSound.play();
});

// Start the game
function startGame() {
    loadSounds();
    backgroundMusic.loop = true;
    backgroundMusic.play();
}
startGame();
