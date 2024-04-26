// Get the canvas context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configurations
const GRAVITY = 1;
const ENEMY_SPEED = 20;
const BULLET_SPEED = 2000;
const ENEMY_SPAWN_INTERVAL = 1000; // Spawn interval in milliseconds
const GAME_TIME_LIMIT = 30000; // 30 seconds in milliseconds

// Ship configurations
const SHIP_SPEED_PER_SECOND = 500; // Pixels per second

// Game state
let isGameOver = false;
let score = 0;
let timeLeft = 30; // Initial time left in seconds

// Ship object
let ship = {
    x: canvas.width / 2 - 30, // Initial x position (centered with 60px width)
    y: canvas.height - 70, // Initial y position (with some bottom padding)
    width: 60, // Ship width
    height: 60, // Ship height
    speed: SHIP_SPEED_PER_SECOND // Ship movement speed
};

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

// Load sounds
function loadSounds() {
    backgroundMusic = new Audio('music.mp3'); // Replace with your background music
    shootSound = new Audio('shoot.mp3'); // Replace with your shoot sound
    hitTargetSound = new Audio('success.mp3'); // Replace with your hit target sound
    hitDistractorSound = new Audio('fail.mp3'); // Replace with your hit distractor sound
    winSound = new Audio('win.mp3'); // Replace with your win sound
    loseSound = new Audio('game-over.mp3'); // Replace with your lose sound
    backgroundMusic.loop = true; // Set to loop the music
    
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

// Update bullets movement
bullets.forEach(bullet => {
    bullet.y -= bullet.velocity * deltaTime; // Use deltaTime for consistent movement
});


// Collision detection
/*function collide(enemy, bullet) {
    return enemy.x < bullet.x + 10 && enemy.x + enemy.width > bullet.x && enemy.y < bullet.y + 10 && enemy.y + enemy.height > bullet.y;
}*/

// Collision detection function
function collide(enemy, bullet) {
    const enemyRect = {
        x: enemy.x,
        y: enemy.y,
        width: enemy.width,
        height: enemy.height
    };

    const bulletRect = {
        x: bullet.x,
        y: bullet.y,
        width: 5,
        height: 10
    };

    if (collideRectangles(enemyRect, bulletRect)) {
        if (targetWords.includes(enemy.word)) {
            score++;
            hitTargetSound.play();
            drawExplosion(bullet.x, bullet.y); // Call drawExplosion function for target word
        } else {
            score--;
            hitDistractorSound.play();
            drawExplosion(bullet.x, bullet.y); // Call drawExplosion function for distractor word
        }
        return true;
    }
    return false;
}

// Function to draw explosion animation
function drawExplosion(x, y) {
    const numParticles = 40; // Number of particles in the explosion
    const maxRadius = 30; // Maximum radius of particles
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff']; // Colors for the particles

    for (let i = 0; i < numParticles; i++) {
        const radius = Math.random() * maxRadius;
        const angle = Math.random() * Math.PI * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
}

// Function to detect rectangle collision
function collideRectangles(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check collisions
enemies.forEach((enemy, enemyIndex) => {
    bullets.forEach((bullet, bulletIndex) => {
        if (collide(enemy, bullet)) {
            if (targetWords.includes(enemy.word)) {
                score++;
                hitTargetSound.play();
                drawExplosion(bullet.x, bullet.y); // Call drawExplosion function for target word
            } else {
                score--;
                hitDistractorSound.play();
                drawExplosion(bullet.x, bullet.y); // Call drawExplosion function for distractor word
            }
            enemies.splice(enemyIndex, 1);
            bullets.splice(bulletIndex, 1);
        }
    });
});

// Update game objects
function update(dt) {
    if (!isGameOver) {
        timeLeft -= dt;

        // Spawn enemies randomly
        if (Math.random() < dt * 1000 / ENEMY_SPAWN_INTERVAL) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw ship
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);

    // Draw enemies
    enemies.forEach(enemy => {
        // Update enemy drawing to use transparent fill
        ctx.fillStyle = 'rgba(255, 255, 255, ' + enemy.alpha + ')';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(enemy.word, enemy.x + 10, enemy.y + 15);

/*        ctx.fillStyle = 'rgba(255, 255, 255, ' + enemy.alpha + ')';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(enemy.word, enemy.x + 10, enemy.y + 15);*/
    });

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = 'gold';
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
let then = Date.now();
let deltaTime = 0;

function gameLoop() {
    const now = Date.now();
    deltaTime = Math.min(100, (now - then) / 1000); // Cap delta time at 100 ms
    then = now;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 37) { // Left arrow key
        ship.x -= ship.speed * deltaTime;
        if (ship.x < 0) {
            ship.x = 0;
        }
    } else if (e.keyCode === 39) { // Right arrow key
        ship.x += ship.speed * deltaTime;
        if (ship.x > canvas.width - ship.width) {
            ship.x = canvas.width - ship.width;
        }
    } else if (e.keyCode === 32) { // Space bar
        const bulletX = ship.x + ship.width / 2 - 5; // Shoot from the center of the ship
        const bulletY = ship.y - 10; // Shoot above the ship
        shootBullet(bulletX, bulletY);
        shootSound.play();
    }
});

// Start the game
function startGame() {
    loadSounds();
    backgroundMusic.loop = true;
    backgroundMusic.play();
    gameLoop();
}

startGame();
