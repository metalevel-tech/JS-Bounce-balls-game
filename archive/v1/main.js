// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

// function to generate random color
function randomRGB() {
    return `rgb(${random(50, 255)},${random(50, 255)},${random(50, 255)})`;
}

class Shape {
    constructor(x, y, velX, velY, color, size) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
    }
}

class EvilCircle extends Shape {
    constructor(x, y, size, velLimit) {
        super(x, y, velLimit, velLimit);
        this.color = 'white';
        this.size = size;
        this.active = false;

        window.addEventListener('keydown', (e) => {
            switch (true) {
                case (e.key === 'a' || e.key === 'ArrowLeft'):
                    this.x -= this.velX;
                    break;
                case (e.key === 'd' || e.key === 'ArrowRight'):
                    this.x += this.velX;
                    break;
                case (e.key === 'w' || e.key === 'ArrowUp'):
                    this.y -= this.velY;
                    break;
                case (e.key === 's' || e.key === 'ArrowDown'):
                    this.y += this.velY;
                    break;
            }
        });
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
    }
    checkBounds() {
        if ((this.x + this.size) >= width) {
            this.x = width - this.size;
        }
        if ((this.x - this.size) <= 0) {
            this.x = this.size;
        }

        if ((this.y + this.size) >= height) {
            this.y = height - this.size;
        }
        if ((this.y - this.size) <= 0) {
            this.y = this.size;
        }
    }
    collisionDetect() {
        for (const ball of game.balls) {
            if (ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance < this.size + ball.size) {
                    ball.exists = false;
                }
            }
        }
    }
}

class Ball extends Shape {
    constructor(x, y, velX, velY, color, size) {
        super(x, y, velX, velY);
        this.color = color;
        this.size = size;
        this.exists = true;
    }
    draw() {
        if (this.exists) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    countAndRemove() {
        if (!this.exists) {
            game.stageCaughtBalls++;
            game.totalCaughtBalls++;

            let factorBallSize = ((game.maxRadius / this.size) + 1);
            let factorBallsCount = game.stageBalls / game.balls.length + 1;
            let factorVelocity = Math.sqrt(this.velX ** 2 + this.velY ** 2);
            console.log(
                Math.floor(game.stageCaughtBalls),
                Math.floor(factorBallSize),
                Math.floor(factorBallsCount),
                Math.floor(factorVelocity)
            );

            game.lastScore = Math.floor(
                game.stageCaughtBalls *
                factorBallSize *
                factorBallsCount *
                factorVelocity
            );
            game.score += game.lastScore;

            game.balls.splice(game.balls.findIndex(ball => ball === this), 1);
            return;
        }
    }
    update() {
        const { velLimit } = this.constructor;

        
        if (this.velX === 0) {
            this.velX = random(-velLimit, velLimit);
        }
        if ((this.x + this.size) >= width) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }
        
        if (this.velY === 0) {
            this.velY = random(-velLimit, velLimit);
        }
        if ((this.y + this.size) >= height) {
            this.velY = -(this.velY);
        }
        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }

        this.x += this.velX;
        this.y += this.velY;

        if (
            this.x < 0 ||
            this.y < 0 ||
            this.x > width ||
            this.y > height
        ) {
            this.x = width / 2;
            this.y = height / 2;
        }
    }

    static defaults(minRadius, maxRadius, velLimit) {
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.velLimit = velLimit;
    }

    collisionDetect() {
        let collisionsCount = 0;
        const ballsMaxSize = game.balls.map(ball => ball.size).reduce((max, size) => (size > max) ? size : max);
        const ballsMinSize = game.balls.map(ball => ball.size).reduce((min, size) => (size < min) ? size : min);

        for (const ball of game.balls) {
            if (!(this === ball) && ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                const { minRadius, maxRadius, velLimit } = this.constructor;

                if (distance < this.size + ball.size) {
                    // ball.color = this.color = randomRGB();
                    collisionsCount++;

                    if (this.size < ball.size) {
                        this.color = randomRGB();
                        if (this.velX < velLimit) this.velX++;
                        else this.velX = random(-velLimit, velLimit);

                        if (this.velY < velLimit) this.velY++;
                        else this.velY = random(-velLimit, velLimit);
                    } else {
                        ball.color = randomRGB();
                        if (ball.velX < velLimit) ball.velX++;
                        else ball.velX = random(-velLimit, velLimit);

                        if (ball.velY < velLimit) ball.velY++;
                        else ball.velY = random(-velLimit, velLimit);
                    }


                    if (this.size === ballsMaxSize || this.size === ballsMinSize) {
                        this.size = random(minRadius, maxRadius);
                    }

                    if (collisionsCount >= game.collisionsLimit) {
                        if (this.x > width / 2) this.x = random(0 + this.size, width / 2 - this.size);
                        else this.x = random(width / 2 + this.size, width - this.size);

                        if (this.y > height / 2) this.y = random(0 + this.size, height / 2 - this.size);
                        else this.y = random(height / 2 + this.size, height - this.size);

                        this.velX = random(-velLimit, velLimit);
                        this.velY = random(-velLimit, velLimit);
                    }
                }
            }
        }
    }
}


function createBalls(number, minRadius, maxRadius, velLimit) {
    while (game.balls.length < number) {
        const size = random(minRadius, maxRadius);
        const ball = new Ball(
            // ball position always drawn at least one ball width
            // away from the edge of the canvas, to avoid drawing errors
            random(0 + size, width - size),
            random(0 + size, height - size),
            random(-velLimit, velLimit),
            random(-velLimit, velLimit),
            randomRGB(),
            size
        );

        game.balls.push(ball);
    }
}

function loop(number, minRadius, maxRadius, velLimit) {
    if (game.balls.length === 0) {
        Ball.defaults(minRadius, maxRadius, velLimit);
        createBalls(number, minRadius, maxRadius, velLimit);

    }

    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, width, height);

    for (const ball of game.balls) {
        ball.draw();
        ball.update();
        ball.collisionDetect();
        ball.countAndRemove();
    }

    if (evilCircle.active) {
        evilCircle.draw();
        evilCircle.checkBounds();
        evilCircle.collisionDetect();
    }

    interface.update();

    if (game.balls.length > 0) {
        window.requestAnimationFrame(loop);
    } else {
        console.log(`Stage ${game.stage++} completed`);

        game.stageCaughtBalls = 0;

        if (game.stage > 10) {
            console.log('Game Over!');
            return;
        }

        if (game.collisionsLimit > 1 && game.stage % 2 === 0) {
            game.collisionsLimit--;
        }

        if (evilCircle.size > 0) {
            evilCircle.size--;
            evilCircle.velX = evilCircle.velY++;
        }

        if (game.minRadius > 0) {
            game.minRadius--;
        }

        if (game.maxRadius > 0) {
            game.maxRadius -= 10;
        }

        game.velLimit++;
        game.stageBalls = game.stageBalls + game.stage * 2;

        Ball.defaults(game.minRadius, game.maxRadius, game.velLimit);
        loop(game.stageBalls, game.minRadius, game.maxRadius, game.velLimit);
    }
}


const interface = {
    score: document.querySelector('#score-indicator'),
    scoreWon: document.querySelector('#score-won-indicator'),
    stage: document.querySelector('#stage-indicator'),
    stageBalls: document.querySelector('#stage-balls'),
    stageCaughtBalls: document.querySelector('#stage-caught-balls'),
    totalCaughtBalls: document.querySelector('#total-caught-balls'),
    update() {
        this.score.textContent = game.score;
        this.scoreWon.textContent = game.lastScore;
        this.stage.textContent = game.stage;
        this.stageBalls.textContent = game.stageBalls;
        this.stageCaughtBalls.textContent = game.stageCaughtBalls;
        this.totalCaughtBalls.textContent = game.totalCaughtBalls;
    }
}

const game = {
    balls: [],
    stageBalls: 5,
    stageCaughtBalls: 0,
    totalCaughtBalls: 0,
    minRadius: 10,
    maxRadius: 120,
    lastScore: 0,
    velLimit: 5,
    stage: 1,
    evilCircleSize: 20,
    evilCircleVel: 20,
    collisionsLimit: 5,
    score: 0,
    lastScore: 0
}

const evilCircle = new EvilCircle(
    width / 2,
    height / 2,
    game.evilCircleSize,
    game.evilCircleVel
);

window.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        if (evilCircle.active === false) evilCircle.active = true;
        else evilCircle.active = false;
    }
});


loop(game.stageBalls, game.minRadius, game.maxRadius, game.velLimit);