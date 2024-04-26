// Get canvas and setup context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameDuration = 60 * 1000; // adjust time


let startTime ; // Variable to store the start time of the game

canvas.width = 800;
canvas.height = 600;

// Load background image
var backgroundImage = new Image();
backgroundImage.src = 'background.png';


const words = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "et", "ou", "est", "ai", "haie", "hait", "où", "qui", "que", "quoi", "dont", "clair", "par", "pour", "part", "mais", "mes", "sien", "chien", "mont", "mon", "ton", "thon", "leur", "leurre", "voue", "noue", "ailes", "îles", "maison", "ont"];
const gameObjects = [];
const scoreElement = document.getElementById('score');
let score = 0;
let gameActive = false;
let spawnInterval;

// Set the fall duration for words
const fallDuration = 8000;//5000 if no fluttering, 8000 is fluttering is active

const keyStates = {};

// Player details
const player = {
    x: canvas.width / 2 - 25, // Center the player initially
    y: canvas.height - 100,     
    width: 80,
    height: 80,
    bullets: [],
    moveSpeed: 10,
    shooting: false
};


//render the background image
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}


// Load the ship image
const playerImage = new Image();
playerImage.src = 'crayon-ship.png'; 
playerImage.onload = function() {
    console.log("Ship image loaded successfully.");
    drawInitialScreen();
};

// Sound setup
const backgroundMusic = document.getElementById('backgroundMusic');
const spawnSound = document.getElementById('spawnSound');
const hitTargetSound = document.getElementById('hitTargetSound');
const hitDistractorSound = document.getElementById('hitDistractorSound');

function drawInitialScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText("Cliquer pour démarrer", canvas.width / 2, canvas.height / 2);
    //document.getElementById('timer').textContent = "Temps restant: 00:00";
}

canvas.addEventListener('click', startGame, { once: true });

function startGame() {
    backgroundMusic.play().catch(e => console.log("Error playing background music: " + e));
    toggleGame();
    startTime = Date.now(); // Record the start time of the game
    gameActive = true;
    
}

function toggleGame() {
    if (!gameActive) {
        gameActive = true;
        backgroundMusic.play();
        spawnWords();
        requestId = requestAnimationFrame(updateGame);
    } else {
        gameActive = false;
        backgroundMusic.pause();
        clearInterval(spawnInterval);
        cancelAnimationFrame(requestId);
    }
}

function spawnWords() {
    spawnInterval = setInterval(() => {
        if (gameActive) {
            const word = words[Math.floor(Math.random() * words.length)];
            const x = Math.random() * (canvas.width - 50);
            const target = new Set(["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "et", "ou", "où", "qui", "que", "quoi", "dont", "par", "pour", "mais", "mes", "sien", "mon", "ton", "leur"]).has(word);
            gameObjects.push({ word, x, y: 0, startTime: Date.now(), target });
            playSound(spawnSound);
        }
    }, 1200);//adjust timer to spawn words as necessary
}

function playSound(sound) {
    sound.play().catch(e => console.log("Failed to play sound: " + e.message));
}

document.addEventListener('keydown', (e) => {
    keyStates[e.key] = true;
    if (e.key === 'p' || e.key === 'P') {
        toggleGame();
        keyStates[e.key] = false; // Prevent repetitive toggling
    }
});

document.addEventListener('keyup', (e) => {
    keyStates[e.key] = false;
});

//TODO: manage timer display
// Call updateTimer() every second
/*if (gameActive) {
    setInterval(updateTimer, 1000);
}*/



function updateGame() {
    const currentTime = Date.now();
    handleControls();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    updateBullets(currentTime);
    updateWords(currentTime);
    

    // Calculate elapsed time
    const elapsedTime = currentTime - startTime;

    // Check winning condition
    if (score >= 10 && elapsedTime <= gameDuration) {
        console.log("USER WINS GAME");
        endGame("BRAVO!!!");
        playSound(winSound);
    } 
    // Check losing conditions
    else if (score < -2 || elapsedTime > gameDuration) {
        console.log("USER LOSES GAME");    
        endGame("RATÉ!!!");
        playSound(gameOverSound);
        gameActive = false;
        
    } 
    // Continue the game if neither condition is met
    else {
        if (gameActive) {
            console.log("GAME IS ON");
            requestId = requestAnimationFrame(updateGame);
        }
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
    if (player.bullets.length < 2) { // Limit number of bullets: scoring is a little off when multiple bullets are shot
        player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 20 });
        playSound(shootingSound);
    }
}





function updateBullets(currentTime) {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        let bullet = player.bullets[i];
        bullet.y -= bullet.speed;

        if (bullet.y < 0) {
            // Remove bullet if it goes off-screen
            player.bullets.splice(i, 1);
        } else {
            ctx.fillStyle = 'gold';
            ctx.fillRect(bullet.x, bullet.y, 6, 12);

            let bulletRemoved = false; // Flag to check if bullet is removed

            for (let j = gameObjects.length - 1; j >= 0 && !bulletRemoved; j--) {
                let obj = gameObjects[j];

                if (isColliding(bullet, obj)) {
                    // Draw explosion animation at the point of collision
                    drawExplosion(obj.x, obj.y);

                    // Play appropriate sound based on target or distractor
                    playSound(obj.target ? hitTargetSound : hitDistractorSound);

                    // Update score
                    score += obj.target ? 1 : -1; 
                    scoreElement.textContent = `New Score: ${score}`;

                    // Remove the bullet and mark it as removed
                    player.bullets.splice(i, 1);
                    bulletRemoved = true;

                    // Remove the word after a short delay to allow for explosion animation
                    setTimeout(() => {
                        gameObjects.splice(j, 1);
                    }, 50); // Adjust the delay as needed
                }
            }
        }
    }
}




function isColliding(bullet, obj) {
    // Check if the bullet is within the horizontal bounds of the word
    let objWidth = ctx.measureText(obj.word).width;
    if (bullet.x + 5 >= obj.x && bullet.x <= obj.x + objWidth) {
        // Check if the bullet is within the vertical bounds of the word
        if (bullet.y <= obj.y + 5 && bullet.y + 5 >= obj.y) {
            return true;
        }
    }
    return false;
}



function drawExplosion(x, y) {
    const numParticles = 50; // Number of particles in the explosion
    const maxRadius = 30; // Maximum radius of particles
    const scatterRadius = 20; // Radius within which the centers of the particles will be scattered
    const colors = ['#ff0000', '#ff4500', '#ffa500', '#ffff00', '#ffffff', '#333333', "pink","purple"]; // Updated colors for the particles

    for (let i = 0; i < numParticles; i++) {
        const radius = Math.random() * maxRadius;
        const angle = Math.random() * Math.PI * 2; // Random angle for scattering
        const color = colors[Math.floor(Math.random() * colors.length)];
        const scatterX = x + scatterRadius * Math.cos(angle) * Math.random(); // Scattering X
        const scatterY = y + scatterRadius * Math.sin(angle) * Math.random(); // Scattering Y

        ctx.beginPath();
        ctx.arc(scatterX, scatterY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
}






/*function updateWords(currentTime) {
    gameObjects.forEach(obj => {
        const elapsedTime = currentTime - obj.startTime;
        const fallProgress = elapsedTime / fallDuration;

        // Calculate new y position
        obj.y = fallProgress * canvas.height;

        // Flutter effect: Adjust x position with a combination of sine wave and randomness
        const flutterAmplitude = 2; // Max distance the word can move left/right
        const flutterFrequency = 0.0005; // Adjusts the frequency of the flutter
        obj.x += flutterAmplitude * Math.sin(currentTime * flutterFrequency) + (Math.random() * 2 - 1); // Adding random variation

        if (fallProgress < 1) {
            ctx.font = '30px Arial';
            //ctx.fillStyle = `rgba(${obj.target ? 255 : 128}, ${obj.target ? 255 : 128}, ${obj.target ? 255 : 128}, ${1 - fallProgress})`;
            
            ctx.fillText(obj.word, obj.x, obj.y);
        }
    });
}*/

function updateWords(currentTime) {
    gameObjects.forEach(obj => {
        const elapsedTime = currentTime - obj.startTime;
        const fallProgress = elapsedTime / fallDuration;

        // Calculate new y position
        obj.y = fallProgress * canvas.height;

        // Flutter effect: Adjust x position with a combination of sine wave and randomness
        const flutterAmplitude = 2; // Max distance the word can move left/right
        const flutterFrequency = 0.01; // Adjusts the frequency of the flutter: 
        //5 for flutterAmplitude and 0.01 for flutterFrequency is already a bit challenging
        obj.x += flutterAmplitude * Math.sin(currentTime * flutterFrequency) + (Math.random() * 2 - 1); // Adding random variation

        if (fallProgress < 1) {
            ctx.font = '30px Arial';
            // Adjust the alpha based on fallProgress to make text fade out as it falls
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - fallProgress})`; // Fading white color
            ctx.fillText(obj.word, obj.x, obj.y);
        }
    });
}


// Function to calculate remaining time
function updateTimer() {
//    if(gameactive){
        // Calculate elapsed time since the start of the game
        const elapsedTime = Date.now() - startTime;
        elapsedTime = Date.now() - startTime;

        // Calculate remaining time in milliseconds
        const remainingTime = gameDuration - elapsedTime;

        // Convert remaining time to minutes and seconds
        const minutes = Math.floor(remainingTime / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        // Format remaining time as "MM:SS"
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;


        // Update the timer element's content
        document.getElementById('timer').textContent = `Temps restant: ${formattedTime}`;
//    }
}



function endGame(message) {
    gameActive = false;
    clearInterval(spawnInterval);
    backgroundMusic.pause();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '50px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}
