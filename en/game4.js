const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let deltaTime = 0;  // Define deltaTime here to make it globally accessible

// Game configurations
const GRAVITY = 1;
const ENEMY_SPEED = 100;
const BULLET_SPEED = 1000;
const ENEMY_SPAWN_INTERVAL = 1000;
const GAME_TIME_LIMIT = 30000;

// Ship configurations
const SHIP_SPEED_PER_SECOND = 500;

let isGameOver = false;
let score = 0;
let timeLeft = 30;

let ship = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 70,
    width: 60,
    height: 60,
    speed: SHIP_SPEED_PER_SECOND
};

let shipImage = new Image();
shipImage.src = 'crayon-ship.png';
let backgroundImage = new Image();
backgroundImage.src = 'background.png';

let backgroundMusic, shootSound, hitTargetSound, hitDistractorSound, winSound, loseSound, spawnSound;

function loadSounds() {
    backgroundMusic = new Audio('music.mp3');
    shootSound = new Audio('shoot.mp3');
    hitTargetSound = new Audio('success.mp3');
    hitDistractorSound = new Audio('fail.mp3');
    spawnSound = new Audio('spawn.mp3');
    winSound = new Audio('win.mp3');
    loseSound = new Audio('game-over.mp3');

    backgroundMusic.loop = true;
}

const targetWords = ['the', 'a', 'and', 'to', 'of', 'in', 'for', 'with', 'on', 'but'];
const distractorWords = ['cat', 'jump', 'happy', 'running', 'green', 'talk', 'laugh', 'sing', 'dance', 'walk'];

const enemies = [];
const bullets = [];

function spawnEnemy() {
    const word = Math.random() < 0.5 ? targetWords[Math.floor(Math.random() * targetWords.length)] : distractorWords[Math.floor(Math.random() * distractorWords.length)];
    const x = Math.random() * (canvas.width - 50);
    const y = 0;
    const enemy = { word, x, y, width: 50, height: 20, velocity: ENEMY_SPEED, alpha: 1 };
    enemies.push(enemy);
}

function shootBullet(x, y) {
    const bullet = { x, y, velocity: BULLET_SPEED };
    bullets.push(bullet);
}

function collideRectangles(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawExplosion(x, y) {
    const numParticles = 40;
    const maxRadius = 30;
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff'];

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

function update(dt) {
    if (!isGameOver) {
        timeLeft -= dt;

        if (Math.random() < dt * 1000 / ENEMY_SPAWN_INTERVAL) {
            spawnEnemy();
            spawnSound.play();
        }

        // Update enemies
        enemies.forEach(enemy => {
            enemy.y += enemy.velocity * dt;
            enemy.y += GRAVITY * dt; // Simulate gravity
            enemy.alpha -= 0.001; // Fade out while falling
        });

        // Remove enemies that fall off the screen
        enemies = enemies.filter(enemy => enemy.y <= canvas.height);

        // Update bullets
        bullets.forEach(bullet => {
            bullet.y -= bullet.velocity * dt;
        });

        // Remove bullets that go off the screen
        bullets = bullets.filter(bullet => bullet.y >= 0);

        // Check for collisions and handle them
        for (let i = enemies.length - 1; i >= 0; i--) {
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (collideRectangles(enemies[i], bullets[j])) {
                    if (targetWords.includes(enemies[i].word)) {
                        score++;
                        hitTargetSound.play();
                    } else {
                        score--;
                        hitDistractorSound.play();
                    }
                    drawExplosion(bullets[j].x, bullets[j].y);
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    break; // Exit the inner loop after a collision to prevent double handling
                }
            }
        }

        if (score >= 10) {
            isGameOver = true;
            winSound.play();
        }

        if (score <= -2 || timeLeft <= 0) {
            isGameOver = true;
            loseSound.play();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);

    enemies.forEach(enemy => {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + enemy.alpha + ')';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(enemy.word, enemy.x + 10, enemy.y + 15);
    });

    bullets.forEach(bullet => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Time left: ${timeLeft.toFixed(1)}s`, canvas.width - 150, 30);

    if (isGameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText(score >= 10 ? 'You Won!' : 'Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }
}

let then = Date.now();

function gameLoop() {
    const now = Date.now();
    deltaTime = Math.min(100, (now - then) / 1000); // Update deltaTime at each frame
    then = now;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

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
        const bulletX = ship.x + ship.width / 2 - 5; // Center of the ship
        const bulletY = ship.y - 10; // Just above the ship
        shootBullet(bulletX, bulletY);
        shootSound.play();
    }
});

function startGame() {
    loadSounds();
    document.addEventListener('click', () => {
        backgroundMusic.play();
    });
    gameLoop();
}

startGame();

