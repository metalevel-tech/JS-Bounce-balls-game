// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// function to generate random number
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

// function to generate random color
function randomRGB() {
    return `rgb(${random(100, 255)},${random(100, 255)},${random(100, 255)})`;
}

// function to format large numbers
function formatNumber(number){
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
 }

// function to play sound
const sound = (function () {
    const path = './sound/';
    const extension = '.mp3';

    const channels = {
        collision: {
            counter: 0,
            limit: 15,
            volume: 0.05,
            file: `${path}long-pop${extension}`
        },
        catch: {
            counter: 0,
            limit: 10,
            volume: 0.4,
            file: `${path}cooking-stopwatch-alert${extension}`
        },
        moved: {
            counter: 0,
            limit: 10,
            volume: 0.3,
            file: `${path}pop-alert${extension}`
        },
        nextStage: {
            counter: 0,
            limit: 10,
            volume: 0.3,
            file: `${path}orchestral-emergency-alarm${extension}`
        },
        changeSize: {
            counter: 0,
            limit: 10,
            volume: 0.3,
            file: `${path}software-interface-remove${extension}`
        },
        soundtrack: {
            counter: 0,
            limit: 1,
            volume: 0.9,
            file: `${path}very80s${extension}`
        },
        shot: {
            counter: 0,
            limit: 10,
            volume: 0.8,
            file: `${path}arcade-mechanical-bling${extension}`
        }
    };

    function play(name, options) {
        if (channels[name].counter < channels[name].limit) {
            if (name === 'soundtrack' && options === 'soundtrack') {
                const soundtrack = new Audio(channels[name].file);
                soundtrack.addEventListener("canplaythrough", event => { 
                    soundtrack.loop = true;
                    soundtrack.volume = channels[name].volume;
                    // soundtrack.autoplay = true;
                    setTimeout(() => { soundtrack.play(); }, 500); 
                });
            } else {
                const audio = new Audio(channels[name].file);
                audio.addEventListener("canplaythrough", event => {
                    audio.volume = channels[name].volume;
                    audio.play();
                });
        
                channels[name].counter++;
                setTimeout(() => { channels[name].counter--; }, 100);
            }
        }
    }

    return function (name, options) {
        if (game.mode === 'demo') return;
        try {
            play(name, options);
        } catch (error) {
            // console.log(error);
        }
    }
})();

class Shape {
    constructor(x, y, velX, velY) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
    }
}

class EvilCircle extends Shape {
    constructor(x, y, radius, velLimit) {
        super(x, y, velLimit, velLimit);
        this.color = 'white';
        this.radius = radius;
        this.active = false;
        
        // Keyboard AWSD/Enter=begin
        window.addEventListener('keydown', (e) => {
            if (game.mode === 'demo') return;
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

        // Persistent capture mode
        window.addEventListener('keypress', e => {
            if (game.mode === 'demo') return;
            if (e.key === 'Enter') {
                if (this.active === false) {
                    this.active = true;
                    game.mode = 'persistent';
                    gameInterface.changeMode();
                } else {
                    this.active = false;
                    game.mode = 'fire'
                    gameInterface.changeMode();
                }
            }
        });

        // Mouse
        window.addEventListener('mousemove', event => {
            if (game.mode === 'demo') return;
            this.x = event.clientX;
            this.y = event.clientY;
        });
        // Fire capture mode
        window.addEventListener('mousedown' , e => {
            if (game.mode === 'demo') return;
            if (e) {
                if (this.active === false) {
                    this.active = true;
                    sound('shot');
                }
                else this.active = false;
            }
        });
        window.addEventListener('mouseup' , e => {
            if (game.mode === 'demo') return;
            if (e) {
                if (this.active === true) this.active = false;
                else this.active = true;
            }
        });
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    checkBounds() {
        if ((this.x + this.radius) >= width) {
            this.x = width - this.radius;
        }
        if ((this.x - this.radius) <= 0) {
            this.x = this.radius;
        }

        if ((this.y + this.radius) >= height) {
            this.y = height - this.radius;
        }
        if ((this.y - this.radius) <= 0) {
            this.y = this.radius;
        }
    }
    collisionDetect() {
        if (game.mode === 'demo') return;
        for (const ball of game.balls) {
            if (ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance < this.radius + ball.radius) {
                    ball.exists = false;
                    sound('catch');
                }
            }
        }
    }
}

class Ball extends Shape {
    constructor(x, y, velX, velY, color, radius) {
        super(x, y, velX, velY);
        this.color = color;
        this.radius = radius;
        this.exists = true;
        this.removedTime = 0; // not used yet
    }
    draw() {
        if (this.exists) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    countAndRemove() {
        if (!this.exists) {
            game.stageCaughtBalls++;
            game.totalCaughtBalls++;

            let factorBallSize = ((game.maxRadius / this.radius) + 1);
            let factorBallsCount = game.stageBalls / game.balls.length + 1;
            let factorVelocity = Math.sqrt(this.velX ** 2 + this.velY ** 2);
            let factorGameMode = (game.mode.toLocaleLowerCase === 'fire') ? 1.2 : 1;

            game.lastScore = Math.floor(
                game.stageCaughtBalls *
                factorBallSize *
                factorBallsCount *
                factorVelocity *
                factorGameMode
            );
            game.score += game.lastScore;

            game.ballsRemoved.push(
                ...game.balls.splice(game.balls.findIndex(ball => ball === this), 1)
            );
            return;
        }
    }
    update() {
        const { velLimit } = this.constructor;

        if (this.velX === 0) {
            this.velX = random(-velLimit, velLimit);
        }

        if ((this.x + this.radius) >= width - 2) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.radius) <= 0 + 2) {
            this.velX = -(this.velX);
        }

        if (this.velY === 0) {
            this.velY = random(-velLimit, velLimit);
        }
        if ((this.y + this.radius) >= height - 2) {
            this.velY = -(this.velY);
        }
        if ((this.y - this.radius) <= 0 + 2) {
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
        const ballsMaxSize = game.balls.map(ball => ball.radius).reduce((max, radius) => (radius > max) ? radius : max);
        const ballsMinSize = game.balls.map(ball => ball.radius).reduce((min, radius) => (radius < min) ? radius : min);

        for (const ball of game.balls) {
            if (!(this === ball) && ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                const { minRadius, maxRadius, velLimit } = this.constructor;

                if (distance < this.radius + ball.radius) {
                    // ball.color = this.color = randomRGB();
                    collisionsCount++;
                    sound('collision');

                    if (this.radius < ball.radius) {
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

                    if (this.radius === ballsMaxSize || this.radius === ballsMinSize) {
                        this.radius = random(minRadius, maxRadius);
                    }

                    if (collisionsCount >= game.collisionsLimit            ) {
                        sound('moved');

                        if (this.x > width / 2) this.x = random(0 + this.radius, width / 2 - this.radius);
                        else this.x = random(width / 2 + this.radius, width - this.radius);

                        if (this.y > height / 2) this.y = random(0 + this.radius, height / 2 - this.radius);
                        else this.y = random(height / 2 + this.radius, height - this.radius);

                        this.velX *= -1;
                        this.velY *= -1;
                    }
                }
            }
        }
    }
}


function createBalls(number, minRadius, maxRadius, velLimit) {
    while (game.balls.length < number) {
        const radius = random(minRadius, maxRadius);
        const ball = new Ball(
            // ball position always drawn at least one ball width
            // away from the edge of the canvas, to avoid drawing errors
            random(0 + radius, width - radius),
            random(0 + radius, height - radius),
            random(-velLimit, velLimit),
            random(-velLimit, velLimit),
            randomRGB(),
            radius
        );

        game.balls.push(ball);
    }
}

// This is the main loop, it is triggered by the Esc key
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

    gameInterface.update();

    if (game.balls.length > 0) {
        window.requestAnimationFrame(loop);
    } else {
        sound('nextStage'); // console.log(`Stage ${game.stage++} completed`);
        
        game.stage++;
        game.stageCaughtBalls = 0;
        game.ballsRemoved = [];

        if (game.stage > game.maxStages) {
            // console.log('Game Over!');
            gameInterface.gameOver();
            return;
        }

        if (game.collisionsLimit > 2 && game.stage % 2 === 0) {
            game.collisionsLimit--;
        }

        if (evilCircle.radius > 0) {
            evilCircle.radius--;
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

// This is the demo loop that starts at the beginning 
function demoLoop(number, minRadius, maxRadius, velLimit) {
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
  
    if (game.mode === 'demo') window.requestAnimationFrame(demoLoop);
    else return;
}

// Encapsulate the interface interactions,
// some of the function at the beginning must go here
const gameInterface = {
    score: document.querySelector('#score-indicator'),
    scoreWon: document.querySelector('#score-won-indicator'),
    stage: document.querySelector('#stage-indicator'),
    stageBalls: document.querySelector('#stage-balls'),
    stageCaughtBalls: document.querySelector('#stage-caught-balls'),
    totalCaughtBalls: document.querySelector('#total-caught-balls'),
    update() {
        this.score.textContent = formatNumber(game.score);
        this.scoreWon.textContent = formatNumber(game.lastScore);
        this.stage.textContent = game.stage;
        this.stageBalls.textContent = game.stageBalls;
        this.stageCaughtBalls.textContent = game.stageCaughtBalls;
        this.totalCaughtBalls.textContent = game.totalCaughtBalls;
    },
    gameOverBanner: document.querySelector('.message-game-over'),
    gameLegend: document.querySelector('.legend'),
    gameStatistic: document.querySelector('.statistic'),
    gameOver() {
        this.gameOverBanner.querySelector('.total-sore').innerHTML = formatNumber(game.score);
        this.gameOverBanner.style.display = 'block';
    },
    gameStart() {
        this.gameLegend.style.display = 'none';
        this.gameStatistic.style.display = 'block';
        this.changeMode();

        window.addEventListener('click', function playSoundtrack(e) {
            this.window.removeEventListener('click', playSoundtrack);
            sound('soundtrack', 'soundtrack');
        });
    },
    modeIndicator: document.querySelector('#mode-indicator'),
    changeMode() {
        if (game.mode === 'persistent' && game.mode !== 'demo') {
            this.modeIndicator.textContent = 'Persistent mode';
            this.modeIndicator.classList = '';
        } else if (game.mode !== 'demo') {
            this.modeIndicator.textContent = 'Fire mode!';
            this.modeIndicator.classList = 'fire-mode';
        }
    }
}

// Initialize the game circumstances
// This object is changed at the end of the main loop when the balls.length = 0
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
    collisionsLimit: 3,
    score: 0,
    lastScore: 0,
    mode: 'demo',
    maxStages: 2
}

// Evil circle will not eat the balls until game.mode === 'demo'
const evilCircle = new EvilCircle(
    width / 2,
    height / 2,
    game.evilCircleSize,
    game.evilCircleVel
);

// Start the demoLoop when the page is loaded
demoLoop(45, 5, 120, 7);

// Start the game by Esc key
window.addEventListener('keydown', function startGameHandler(e) {
     if (e.key === 'Esc' || e.key === 'Escape') {
        this.window.removeEventListener('keydown', startGameHandler);

        game.mode = 'fire';
        game.balls = [];
        game.collisionsLimit = 5;
        
        gameInterface.gameStart(); // gameInterface.changeMode();

        loop(game.stageBalls, game.minRadius, game.maxRadius, game.velLimit);

        ctx.fillStyle = `rgba(0, 0, 0, 1)`;
        ctx.fillRect(0, 0, width, height);
    }
});