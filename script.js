// Define the name to display as obstacles
let gameName = "Jime"; // Default name, can be changed via input

// Get HTML elements
const nameInputContainer = document.getElementById('nameInputContainer');
const nameInput = document.getElementById('nameInput');
const startButton = document.getElementById('startButton');

// Add event listener to the start button
startButton.addEventListener('click', () => {
    const input = nameInput.value.trim();
    if (input) {
        gameName = input;
        resetGame();
        // Hide the input container
        nameInputContainer.style.display = 'none';
    } else {
        alert("Please enter a valid name.");
    }
});

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Define the size of each grid cell
const gridSize = 20;

// Initialize snake
let snake = [
    { x: 9 * gridSize, y: 9 * gridSize },
    { x: 8 * gridSize, y: 9 * gridSize },
    { x: 7 * gridSize, y: 9 * gridSize }
];

// Initialize direction
let dx = gridSize; // Moving right initially
let dy = 0;

// Initialize obstacles
let obstacles = generateObstacles();

// Initialize food
let food = generateFood();

// Initialize score
let score = 0;

// Initialize high score
let highScore = localStorage.getItem('highScore') || 0;
updateScore();

// Initialize obstacle color
let obstacleColor = getRandomColor(); // Initial random color

// Game speed (milliseconds)
let gameSpeed = 200;
let gameInterval;

// Listen for keyboard events
document.addEventListener('keydown', changeDirection);

// Start the game
startGame();

// Letter Patterns
const LETTER_PATTERNS = {
    A: {
        standard: [
            [1,0],
            [0,1], [2,1],
            [0,2], [1,2], [2,2],
            [0,3], [2,3]
        ],
        bold: [
            [0,0], [1,0], [2,0],
            [0,1], [2,1],
            [0,2], [1,2], [2,2],
            [0,3], [2,3]
        ]
    },
    B: {
        standard: [
            [0,0], [0,1], [0,2], [0,3],
            [1,0], [1,2],
            [2,1], [2,3]
        ],
        bold: [
            [0,0], [1,0], [2,0],
            [0,1], [2,1],
            [0,2], [1,2], [2,2],
            [0,3], [2,3]
        ]
    },
    // ... Define patterns for other letters
    J: {
        standard: [
            [0,0], [1,0], [2,0],
            [2,1], [2,2], [1,2], [0,2]
        ],
        bold: [
            [0,0], [1,0], [2,0],
            [0,1], [2,1],
            [0,2], [1,2], [2,2]
        ]
    },
    i: {
        standard: [
            [0,0],
            [0,1],
            [0,2]
        ],
        bold: [
            [0,0], [0,1], [0,2], [0,3]
        ]
    },
    m: {
        standard: [
            [0,0], [0,1], [0,2],
            [1,1],
            [2,0], [2,1], [2,2]
        ],
        bold: [
            [0,0], [0,1], [0,2], [0,3],
            [1,1], [1,2],
            [2,0], [2,1], [2,2], [2,3]
        ]
    },
    e: {
        standard: [
            [0,0], [1,0], [2,0],
            [0,1], [0,2], [1,1], [2,1]
        ],
        bold: [
            [0,0], [1,0], [2,0],
            [0,1], [0,2], [1,1], [2,1],
            [0,3], [1,3], [2,3]
        ]
    },
    // Add more letters as needed
};

/**
 * Generates a random hex color.
 * @returns {string} - Hex color string.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Generates obstacle positions to form a letter with a random style.
 * @param {string} letter - The letter to form ('A', 'B', 'J', 'i', 'm', 'e', etc.).
 * @param {number} startX - The starting x-coordinate on the grid.
 * @param {number} startY - The starting y-coordinate on the grid.
 * @returns {Array} - Array of obstacle positions.
 */
function generateLetterObstacles(letter, startX, startY) {
    const styles = Object.keys(LETTER_PATTERNS[letter]);
    const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
    const pattern = LETTER_PATTERNS[letter][selectedStyle];
    const obstacles = [];

    pattern.forEach(coord => {
        const [x, y] = coord;
        obstacles.push({
            x: startX + x * gridSize,
            y: startY + y * gridSize
        });
    });

    return obstacles;
}

/**
 * Generates obstacle positions to form the gameName in different styles.
 * @returns {Array} - Array of obstacle positions.
 */
function generateNameObstacles() {
    const obstacles = [];
    const nameLength = gameName.length;
    const letterSpacing = gridSize * 2; // Adjust spacing as needed
    const startY = gridSize * 5; // Starting Y position

    // Calculate total width of the name to center it
    // Assuming each letter occupies up to 4 grid cells in width
    let maxLetterWidth = 0;
    for (let char of gameName) {
        const upperChar = char.toUpperCase();
        if (LETTER_PATTERNS[upperChar]) {
            const styles = Object.keys(LETTER_PATTERNS[upperChar]);
            styles.forEach(style => {
                const pattern = LETTER_PATTERNS[upperChar][style];
                const width = Math.max(...pattern.map(coord => coord[0])) + 1;
                if (width > maxLetterWidth) {
                    maxLetterWidth = width;
                }
            });
        }
    }
    
    const totalWidth = (gameName.length * maxLetterWidth * gridSize) + ((gameName.length - 1) * letterSpacing);
    let currentX = (canvasWidth - totalWidth) / 2;
    
    for (let char of gameName) {
        const upperChar = char.toUpperCase();
        if (LETTER_PATTERNS[upperChar]) {
            const letterObstacles = generateLetterObstacles(upperChar, currentX, startY);
            obstacles.push(...letterObstacles);
            currentX += maxLetterWidth * gridSize + letterSpacing; // Move to next letter position
        } else {
            console.warn(`Pattern for letter "${char}" is not defined.`);
            // Optionally, skip the letter or handle it differently
            // For example, skip:
            currentX += maxLetterWidth * gridSize + letterSpacing;
        }
    }

    // Add random gaps to ensure navigable paths
    // For simplicity, we'll remove some obstacles randomly
    // Alternatively, design the letter patterns with inherent gaps

    // Example: Remove 10% of obstacles randomly
    const obstacleCount = obstacles.length;
    const gapsToCreate = Math.floor(obstacleCount * 0.1);
    for (let i = 0; i < gapsToCreate; i++) {
        if (obstacles.length === 0) break; // Prevent errors
        const indexToRemove = Math.floor(Math.random() * obstacles.length);
        obstacles.splice(indexToRemove, 1);
    }

    return obstacles;
}

/**
 * Generates obstacles to form the gameName in different styles.
 * @returns {Array} - Array of obstacle positions.
 */
function generateObstacles() {
    return generateNameObstacles();
}

/**
 * Generates food position ensuring it doesn't collide with snake or obstacles.
 * @returns {Object|null} - Food position or null if not found.
 */
function generateFood() {
    let newFood;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        newFood = {
            x: Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize
        };
        if (!isOccupied(newFood, snake) && !isOccupied(newFood, obstacles)) {
            return newFood;
        }
        attempts++;
    }
    // If unable to place food, return null
    return null;
}

/**
 * Checks if a position is occupied by any segment in the given list.
 * @param {Object} position - The position to check.
 * @param {Array} segments - Array of segments (snake or obstacles).
 * @returns {boolean} - True if occupied, else false.
 */
function isOccupied(position, segments) {
    for (let segment of segments) {
        if (segment.x === position.x && segment.y === position.y) {
            return true;
        }
    }
    return false;
}

/**
 * Starts the game by initializing the game loop.
 */
function startGame() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

/**
 * The main game loop handling movement, collision, and rendering.
 */
function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    if (checkFoodCollision()) {
        score++;
        updateScore();
        food = generateFood();
        // Increase speed every 5 points
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop(); // Remove the tail
    }
    drawEverything();
}

/**
 * Moves the snake in the current direction.
 */
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Screen wrapping
    if (head.x >= canvasWidth) {
        head.x = 0;
    } else if (head.x < 0) {
        head.x = canvasWidth - gridSize;
    }

    if (head.y >= canvasHeight) {
        head.y = 0;
    } else if (head.y < 0) {
        head.y = canvasHeight - gridSize;
    }

    snake.unshift(head);
}

/**
 * Changes the direction of the snake based on key presses.
 * @param {KeyboardEvent} event 
 */
function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // Prevent the snake from reversing
    if (keyPressed === LEFT && dx === 0) {
        dx = -gridSize;
        dy = 0;
    }
    if (keyPressed === UP && dy === 0) {
        dx = 0;
        dy = -gridSize;
    }
    if (keyPressed === RIGHT && dx === 0) {
        dx = gridSize;
        dy = 0;
    }
    if (keyPressed === DOWN && dy === 0) {
        dx = 0;
        dy = gridSize;
    }
}

/**
 * Checks for collisions with self or obstacles.
 * @returns {boolean} - True if collision detected, else false.
 */
function checkCollision() {
    // Check collision with self
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    // Check collision with obstacles
    for (let obstacle of obstacles) {
        if (snake[0].x === obstacle.x && snake[0].y === obstacle.y) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if the snake has eaten the food.
 * @returns {boolean} - True if food is eaten, else false.
 */
function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        return true;
    }
    return false;
}

/**
 * Draws the game elements on the canvas.
 */
function drawEverything() {
    // Clear the canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the snake
    ctx.fillStyle = '#28a745';
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
    }

    // Draw the food
    if (food) {
        ctx.fillStyle = '#dc3545';
        ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
    }

    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacleColor;
        ctx.fillRect(obstacle.x, obstacle.y, gridSize - 2, gridSize - 2);
    });
}

/**
 * Updates the score display and high score.
 */
function updateScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('score').innerText = `Score: ${score} | High Score: ${highScore}`;
}

/**
 * Resets the game to initial state.
 */
function resetGame() {
    // Reset variables
    snake = [
        { x: 9 * gridSize, y: 9 * gridSize },
        { x: 8 * gridSize, y: 9 * gridSize },
        { x: 7 * gridSize, y: 9 * gridSize }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    updateScore();
    food = generateFood();
    obstacles = generateObstacles();

    // Randomize obstacle color
    obstacleColor = getRandomColor();

    // Show the name input container again if it's hidden
    nameInputContainer.style.display = 'block';

    if (!food) {
        alert("You Win! No more space.");
        return;
    }
    drawEverything();
    startGame();
}

/**
 * Ends the game, records the score, and resets the game.
 */
function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! Your final score was: ${score}`);
    resetGame();
}