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
    return `rgb(${random(100, 255)},${random(100, 255)},${random(100, 255)})`;
}

// function to play sound, fmpeg -i in.mp3 -af "volume=0.25" out.mp3
const sound = (function () {
    const channel = { a: 0, b: 0, c: 0, d: 0, soundtrack: 0 };
    const path = './sound/';
    const extension = '.mp3';

    const files = {
        collision: 'long-pop-q',
        catch: 'cooking-stopwatch-alert',
        moved: 'pop-alert',
        nextStage: 'orchestral-emergency-alarm-q',
        changeSize: 'software-interface-remove-q',
        soundtrack: 'very80s.storyblocks.com'
    };

    function play(name, the_channel) {
        const audio = new Audio(path + files[name] + extension);
        audio.addEventListener("canplaythrough", event => { audio.play(); });

        channel[the_channel]++;
        setTimeout(() => { channel[the_channel]--; }, 250);
    }

    // Play the soundtrack here // play('soundtrack', 'soundtrack');
    const soundtrack = new Audio(path + files.soundtrack + extension);
    soundtrack.loop = true;
    soundtrack.volume = 0.9;
    soundtrack.autoplay = true;
    soundtrack.addEventListener("canplaythrough", event => { soundtrack.play(); });
    channel.soundtrack = 1;
    
    return function (name, priority = 'a') {
        try {
            if (channel[priority] <= 50 && priority === 'a') {
                play(name, priority);
            } else if (channel[priority] < 1 && priority === 'b') {
                play(name, priority);
            } else if (channel[priority] < 1 && priority === 'c') {
                play(name, priority);
            } else if (priority === 'd') {
                play(name, priority);
            }
        } catch (error) {
            // console.log(error);
        }
    }
})();

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

        // Mouse/LeftClick=begin
        window.addEventListener('mousemove', event => {
            this.x = event.clientX;
            this.y = event.clientY;
        });
        window.addEventListener('mouseup', e => {
            if (e) {
                if (this.active === false) this.active = true;
                else this.active = false;
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
                    sound('catch', 'd');
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
        this.removedTime = 0; // not used yet
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

            game.lastScore = Math.floor(
                game.stageCaughtBalls *
                factorBallSize *
                factorBallsCount *
                factorVelocity
            );
            game.score += game.lastScore;

            game.ballsRemoved = game.balls.splice(game.balls.findIndex(ball => ball === this), 1);
            return;
        }
    }
    update() {
        const { velLimit } = this.constructor;

        if (this.velX === 0) {
            this.velX = random(-velLimit, velLimit);
        }
        if ((this.x + this.size) >= width - 2) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.size) <= 0 + 2) {
            this.velX = -(this.velX);
        }

        if (this.velY === 0) {
            this.velY = random(-velLimit, velLimit);
        }
        if ((this.y + this.size) >= height -2) {
            this.velY = -(this.velY);
        }
        if ((this.y - this.size) <= 0 +2) {
            this.velY = -(this.velY);
        }

        this.x += this.velX;
        this.y += this.velY;

        if (
            this.x < 0 - 2 ||
            this.y < 0 - 2 ||
            this.x > width + 2 ||
            this.y > height + 2
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
                    sound('collision', 'a');

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
                        sound('moved', 'c');

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

    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
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
        sound('nextStage', 'b');

        game.stageCaughtBalls = 0;
        game.ballsRemoved = 0;

        if (game.stage > 10) {
            console.log('Game Over!');
            return;
        }

        if (game.collisionsLimit > 2 && game.stage % 2 === 0) {
            game.collisionsLimit--;
        }

        if (evilCircle.size > 0) {
            evilCircle.size--;
            evilCircle.velX = evilCircle.velY--;
        }

        if (game.minRadius > 0) {
            game.minRadius--;
        }

        if (game.maxRadius > 20) {
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
    ballsRemoved: [],
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

loop(game.stageBalls, game.minRadius, game.maxRadius, game.velLimit);