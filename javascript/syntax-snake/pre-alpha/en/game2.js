const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 30; // Grid cell size and snake segment size
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const margin = 40;

let snake = [{ x: 160, y: 160 }];  // Initial snake with one segment
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
const targetWords = ["I", "you","he", "she", "we", "us", "they","him", "her", "the", "a", "on","under", "off", "out", "in", "an","up", "down","about","over","out","our","your","who","that","when","if","some","many","my","it"];
const distractorWords = ["apple", "run", "happy", "dog", "jump","shear", "sheer", "ale", "thunder", "pout","pin","sin", "ran", "pup","isle","heap","sheep", "shea", "use","ran","cold", "big","fun","crown","gown","clown","cup","tea","hear","bout","doubt","route","hour","tat","is","pour","sour","gown","gout","gin","cup","hit","handsome","may","sit"];
let words = [];
let score = 0;
let targetWordsEaten = 0;
let gameInterval;
let gameStarted = false;
let musicStarted = false;

const backgroundMusic = document.getElementById('backgroundMusic');
const targetSound = document.getElementById('targetSound');
const distractorSound = document.getElementById('distractorSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

const headImg = new Image();
headImg.src = 'snake-head2.png';  // must be the same size as gridSize
const bodyImg = new Image();
bodyImg.src = 'snake-body2.png';  // must be the same size as gridSize

// Start background music when user interacts with the document
function playBackgroundMusic() {
    backgroundMusic.play().catch(error => {
        console.log('Background music play failed:', error);
    });
}

// Stop background music
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function spawnWords() {
    words = [];
    const totalWords = Math.floor(Math.random() * 3) + 10; // Ensure at least 10 words are on the canvas

    let targets = 0;
    let distractors = 0;

    for (let i = 0; i < totalWords; i++) {
        let isTarget;
        if (targets < 2) {
            isTarget = true;
            targets++;
        } else if (distractors < 2) {
            isTarget = false;
            distractors++;
        } else {
            isTarget = Math.random() > 0.5;
        }

        const wordList = isTarget ? targetWords : distractorWords;
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        ctx.font = '20px Arial';
        words.push({
            word: word,
            x: Math.floor(Math.random() * (canvasWidth - margin * 2) / gridSize) * gridSize + margin,
            y: Math.floor(Math.random() * (canvasHeight - margin * 2) / gridSize) * gridSize + margin,
            isTarget: isTarget,
            width: ctx.measureText(word).width,
            height: 20 // Font size
        });
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            drawRotatedImage(headImg, segment.x, segment.y, direction);
        } else {
            const prevSegment = snake[index - 1];
            const bodyDirection = {
                x: prevSegment.x - segment.x,
                y: prevSegment.y - segment.y
            };
            drawRotatedImage(bodyImg, segment.x, segment.y, bodyDirection);
        }
    });
}

function drawRotatedImage(img, x, y, dir) {
    ctx.save();
    ctx.translate(x + gridSize / 2, y + gridSize / 2);
    if (dir.x === 1) {
        ctx.rotate(0);
    } else if (dir.x === -1) {
        ctx.rotate(Math.PI);
    } else if (dir.y === -1) {
        ctx.rotate(-Math.PI/2);
    } else if (dir.y === 1) {
        ctx.rotate(Math.PI/2);
    }
    ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
}

function drawWords() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    words.forEach(wordObj => {
        ctx.fillText(wordObj.word, wordObj.x, wordObj.y + gridSize - 4);
    });
}

function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 < x2 +5 || x2 + w2 < x1 +5 || y1 + h1 < y2 + 5 || y2 + h2 < y1 + 5);
}

function moveSnake() {
    if (!gameStarted) return;

    direction = nextDirection;
    const newHead = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };

    if (newHead.x < 0 || newHead.x >= canvasWidth || newHead.y < 0 || newHead.y >= canvasHeight || snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        clearInterval(gameInterval);
        stopBackgroundMusic();
        loseSound.play();
        loseSound.addEventListener('ended', () => {
            //alert('Game Over! Your score: ' + score);
        });        
        //alert('Game Over! Your score: ' + score);
        return;
    }

    snake.unshift(newHead);

    const wordIndex = words.findIndex(wordObj => rectsOverlap(newHead.x, newHead.y, gridSize, gridSize, wordObj.x, wordObj.y - 12, wordObj.width, wordObj.height));
    if (wordIndex !== -1) {
        const wordObj = words[wordIndex];
        if (wordObj.isTarget) {
            targetWordsEaten++;
            score++;
            targetSound.play();
            // Adding segment (by not removing tail) for growth when eating a target word
            if (score >= 10) {
                clearInterval(gameInterval);
                stopBackgroundMusic();
                winSound.play();
	        loseSound.addEventListener('ended', () => {
	            //alert('You Win! Your score: ' + score);
	        });                
                //alert('You win! Your score: ' + score);
                return;
            }
        } else {
            score -= 1;
            distractorSound.play();
            if (score < 0) {
                clearInterval(gameInterval);
                stopBackgroundMusic();
 		loseSound.play();
 	        loseSound.addEventListener('ended', () => {
        	    //alert('Game Over! Your score: ' + score);
	        });
                //alert('Game Over! Your score: ' + score);

                return;
            }
            // Shrink snake by removing tail segment when eating a distractor word
            if (snake.length > 1) {
                snake.pop(); // Remove the last segment to make the snake smaller
                snake.pop(); // Remove the last segment twice so it looks consistent

            } else {
                clearInterval(gameInterval);
                stopBackgroundMusic();
 		loseSound.play();                
 	        loseSound.addEventListener('ended', () => {
        	    //alert('Game Over! Your score: ' + score);
        	});
                //alert('Game Over! Your score: ' + score);
                return;
            }
        }
        words.splice(wordIndex, 1);

        // Ensure there are always at least 2 target and 1 distractor words
        if (words.filter(word => word.isTarget).length < 2 || words.filter(word => !word.isTarget).length < 1) {
            spawnWords();
        }
    } else {
        snake.pop(); // Regular move: remove the last segment to keep the snake size
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawSnake();
    drawWords();
}

function update() {
    moveSnake();
    draw();
}



function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingRight = direction.x === 1;
    const goingLeft = direction.x === -1;

    if (!musicStarted) {
        playBackgroundMusic();
        musicStarted = true;
    }

    if (keyPressed === LEFT && !goingRight) {
        nextDirection = { x: -1, y: 0 };
        gameStarted = true;
    }
    if (keyPressed === UP && !goingDown) {
        nextDirection = { x: 0, y: -1 };
        gameStarted = true;
    }
    if (keyPressed === RIGHT && !goingLeft) {
        nextDirection = { x: 1, y: 0 };
        gameStarted = true;
    }
    if (keyPressed === DOWN && !goingUp) {
        nextDirection = { x: 0, y: 1 };
        gameStarted = true;
    }
}

document.addEventListener('keydown', changeDirection);



function startGame() {
    snake = [{ x: 160, y: 160 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    targetWordsEaten = 0;
    gameStarted = false;
    words = [];
    spawnWords();
    gameInterval = setInterval(update, 350);
}


startGame();

