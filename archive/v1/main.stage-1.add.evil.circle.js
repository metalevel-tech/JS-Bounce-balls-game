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
    constructor(x, y, velLimit) {
        super(x, y, velLimit, velLimit);
        this.color = 'white';
        this.size = 20;
        this.active = false;

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'a':
                    this.x -= this.velX;
                    break;
                case 'd':
                    this.x += this.velX;
                    break;
                case 'w':
                    this.y -= this.velY;
                    break;
                case 's':
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
        for (const ball of balls) {
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
    remove() {
        if (!this.exists) {
            balls.splice(balls.findIndex(ball => ball === this), 1);
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
    }

    static defaults(minRadius, maxRadius, velLimit) {
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.velLimit = velLimit;
    }

    collisionDetect() {
        let collisions = 0;

        for (const ball of balls) {
            if (!(this === ball) && ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                const ballsMaxSize = balls.map(ball => ball.size).reduce((max, size) => (size > max) ? size : max);
                const ballsMinSize = balls.map(ball => ball.size).reduce((min, size) => (size < min) ? size : min);

                const { minRadius, maxRadius, velLimit } = this.constructor;

                if (distance < this.size + ball.size) {
                    // ball.color = this.color = randomRGB();
                    collisions++;

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

                    if (collisions >= 3) {
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
    while (balls.length < number) {
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

        balls.push(ball);
    }
}

function loop(number, minRadius, maxRadius, velLimit) {
    if (balls.length === 0) {
        Ball.defaults(minRadius, maxRadius, velLimit);
        createBalls(number, minRadius, maxRadius, velLimit);

    }

    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, width, height);

    for (const ball of balls) {
        ball.draw();
        ball.update();
        ball.collisionDetect();
        ball.remove();
    }

    if (evilCircle.active) {
        evilCircle.draw();
        evilCircle.checkBounds();
        evilCircle.collisionDetect();
    }

    if (balls.length > 0) {
        window.requestAnimationFrame(loop);
    } else {
        console.log(`Stage ${game.stage++} completed`);
        if (game.stage >= 5) {
            console.log('Game Over!');
            return;
        }

        if (game.minRadius > 0) {
            game.minRadius--;
            game.maxRadius -= 10;
            game.velLimit++;
            game.balls++;
        }
        loop(game.balls, game.minRadius, game.maxRadius, game.velLimit);
    }
}

const balls = [];
const evilCircle = new EvilCircle(width / 2, height / 2, 10);

window.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        if (evilCircle.active === false) evilCircle.active = true;
        else evilCircle.active = false;
    }
});

const initGame = {
    balls: 5,
    minRadius: 10,
    maxRadius: 120,
    velLimit: 5,
    stage: 1
}

loop(game.balls, game.minRadius, game.maxRadius, game.velLimit);