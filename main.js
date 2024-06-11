


// script.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 20;
const WIDTH = 500;  // Adjusted for the larger maze size
const HEIGHT = 620;
const FPS = 30;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const COLORS = {
    BACKGROUND: 'black',
    WALL: 'green',
    PACMAN: 'yellow',
    GHOST1: 'red',
    GHOST2: 'pink',
    GHOST3: 'cyan',
    GHOST4: 'orange',
    DOT: 'white'
};

const maze = [
    "1111111111111111111111111",
    "1000001000000001000000001",
    "1011101110111111101111101",
    "1010101000100010001000101",
    "1010111110101011111011101",
    "1000000000100010000000001",
    "1011110111110111110111101",
    "1000000100000000000000001",
    "1111110101011110101011111",
    "1000000101010010101000001",
    "1011111101111111101111101",
    "1001000000000000000000101",
    "1011011111110111111101101",
    "1000010000010000010000001",
    "1111011100000000011011111",
    "1000000000000000000000001",
    "1111011111111111111011111",
    "1000000000010000010000001",
    "1011011111110111111101101",
    "1001000000000000000000101",
    "1011111101111111101111101",
    "1000000101000010101000001",
    "1111110101011110101011111",
    "1000000100000000000000001",
    "1011110111110111110111101",
    "1000000000100010000000001",
    "1010111110101011111011101",
    "1010101000100010001000101",
    "1011101110111111101111101",
    "1000001000000001000000001",
    "1111111111111111111111111"
];

class Entity {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
    }

    move() {
        // Check if the next direction is valid
        if (!collideWithWalls(this.x + this.nextDirection.x, this.y + this.nextDirection.y)) {
            this.direction = this.nextDirection;
        }

        // Calculate the next position
        let nextX = this.x + this.direction.x;
        let nextY = this.y + this.direction.y;

        // Move if the next position is not a wall
        if (!collideWithWalls(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x * CELL_SIZE + CELL_SIZE / 2, this.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class PacMan extends Entity {
    constructor(x, y) {
        super(x, y, COLORS.PACMAN);
    }
}

class Ghost extends Entity {
    constructor(color) {
        // Find a random valid starting position for the ghost
        let x, y;
        do {
            x = Math.floor(Math.random() * (WIDTH / CELL_SIZE));
            y = Math.floor(Math.random() * (HEIGHT / CELL_SIZE));
        } while (maze[y][x] === '1');  // Ensure the position is not a wall

        // Initialize the ghost at the valid position with its specific color
        super(x, y, color);
        this.setRandomDirection();
    }

    setRandomDirection() {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        this.nextDirection = directions[Math.floor(Math.random() * directions.length)];
    }

    move() {
        // Increase the chance of continuing in the same direction
        if (Math.random() < 0.7) {
            this.nextDirection = this.direction;
        } else {
            this.setRandomDirection();
        }
        let nextX = this.x + this.direction.x;
        let nextY = this.y + this.direction.y;
        if (collideWithWalls(nextX, nextY)) {
            this.setRandomDirection();
        } else {
            super.move();
        }
    }

    draw() {
        super.draw();
    }
}



function collideWithWalls(x, y) {
    return maze[y] && maze[y][x] === '1';
}

function checkForDot(x, y) {
    if (maze[y][x] === '0') {
        maze[y] = maze[y].substring(0, x) + ' ' + maze[y].substring(x + 1);
        return true;
    }
    return false;
}

// New function to send coordinates to the server using POST
async function sendCoordinates() {
    const coordinates = {
        pacman: { x: pacman.x, y: pacman.y },
        ghosts: ghosts.map(ghost => ({ x: ghost.x, y: ghost.y }))
    };
    console.log('Sending coordinates:', coordinates);  // Print coordinates being sent
    try {
        const response = await fetch('http://127.0.0.1:5000/get_moves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(coordinates)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Received response:', data);  // Print the response
        updatePacManMove(data.pacmanMove);
        updateGhostsMove(data.ghostMoves);
    } catch (error) {
        console.error('Error fetching move instructions:', error);
    }
}

// Function to update Pac-Man's move
function updatePacManMove(pacmanMove) {
    const directions = {
        1: { x: 1, y: 0 },
        2: { x: -1, y: 0 },
        3: { x: 0, y: -1 },
        4: { x: 0, y: 1 }
    };
    pacman.nextDirection = directions[pacmanMove];
    console.log('Updated Pac-Man move:', pacmanMove, pacman.nextDirection);
}

// Function to update ghosts' moves
function updateGhostsMove(ghostMoves) {
    const directions = {
        1: { x: 1, y: 0 },
        2: { x: -1, y: 0 },
        3: { x: 0, y: -1 },
        4: { x: 0, y: 1 }
    };
    ghosts.forEach((ghost, index) => {
        ghost.nextDirection = directions[ghostMoves[index]];
        console.log(`Updated Ghost ${index + 1} move:`, ghostMoves[index], ghost.nextDirection);
    });
}

const pacman = new PacMan(1, 1);  // Adjusted starting position away from the ghosts
const ghosts = [
    new Ghost(COLORS.GHOST1),  // Ghost 1 starting position
    new Ghost(COLORS.GHOST2),  // Ghost 2 starting position
    new Ghost(COLORS.GHOST3),  // Ghost 3 starting position
    new Ghost(COLORS.GHOST4)   // Ghost 4 starting position
];

let score = 0;

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === '1') {
                ctx.fillStyle = COLORS.WALL;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (maze[y][x] === '0') {
                ctx.fillStyle = COLORS.DOT;
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function update() {
    pacman.move();
    if (checkForDot(pacman.x, pacman.y)) {
        score++;
        if (score === 125) {  // All dots collected
            alert("You Win!");
            document.location.reload();
        }
    }
    ghosts.forEach(ghost => ghost.move());
    if (ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y)) {
        alert("Game Over!");
        document.location.reload();
    }
}

function draw() {
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMaze();
    pacman.draw();
    ghosts.forEach(ghost => ghost.draw());
}

async function gameLoop() {
    await sendCoordinates();
    update();
    draw();
    setTimeout(gameLoop, 1000 / FPS);
}

document.addEventListener('keydown', event => {
    const directions = {
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }
    };
    if (directions[event.key]) {
        pacman.nextDirection = directions[event.key];
    }
});

gameLoop();
