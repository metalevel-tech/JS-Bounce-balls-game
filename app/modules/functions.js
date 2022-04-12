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
function soundFX(game) {
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
            volume: 0.5,
            file: `${path}small-crowd-ovation${extension}`
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
}

export {random, randomRGB, formatNumber, soundFX}