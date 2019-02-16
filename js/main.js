/*----------------------------------------------------------------
// File Name：main.js
// author：陈浩瑞
// Time：2019.02.16
//----------------------------------------------------------------*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var medal_bronze = new Image();
medal_bronze.src = "assets/medal_bronze.png";

var medal_gold = new Image();
medal_gold.src = "assets/medal_gold.png";

var medal_platinum = new Image();
medal_platinum.src = "assets/medal_platinum.png";

var medal_silver = new Image();
medal_silver.src = "assets/medal_silver.png";

var replay = new Image();
replay.src = "assets/replay.png";

var copyright = new Image();
copyright.src = "assets/splash.png";

var pause_Img = new Image();
pause_Img.src = "assets/pause.png";

var scb = new Image();
scb.src = "assets/scoreboard.png";

var bg = new Image();
bg.src = "assets/background.png";

var pipeUp = new Image();
pipeUp.src = "assets/pipe-up.png";

var pipeDown = new Image();
pipeDown.src = "assets/pipe-down.png";

var pipe = new Image();
pipe.src = "assets/pipe.png";

var sfx_swooshing = new Audio();
sfx_swooshing.src = "assets/sounds/sfx_swooshing.ogg";

var sfx_die = new Audio();
sfx_die.src = "assets/sounds/sfx_die.ogg";

var sfx_point = new Audio();
sfx_point.src = "assets/sounds/sfx_point.ogg";

var sfx_wing = new Audio();
sfx_wing.src = "assets/sounds/sfx_wing.ogg";

var font_Big = [];
for (var i = 0; i <= 9; i++) {
    font_Big[i] = new Image();
    font_Big[i].src = "assets/font_big_" + i + ".png";
}

var font_Small = [];
for (var j = 0; j <= 9; j++) {
    font_Small[j] = new Image();
    font_Small[j].src = "assets/font_small_" + j + ".png";
}

var birds = [];
birds[0] = new Image();
birds[0].src = "assets/bird_01.png";
birds[1] = new Image();
birds[1].src = "assets/bird_02.png";
birds[2] = new Image();
birds[2].src = "assets/bird_03.png";
birds[3] = new Image();
birds[3].src = "assets/bird_04.png";

var RUNNING = 0;
var PAUSE = 1;
var WAITING = 2;
var GAME_OVER = 3;

var cop = new Icon(100, 135, 188, 170, copyright, 0);
var rep = new Icon(149, 376, 115, 70, replay, 0);
var pause = new Icon(1160, 115, 121, 124, pause_Img, 0);
var scoreBoard = new Icon(85, 175, 236, 280, scb, 0);
var background = new Sky(0, 0, 1280, 720, bg, 100);
var bird = new Bird(70, 250, 34, 24, birds, 50, 0.8, 8, 1, 4);

var control = new Control();

var STATE;
var lastTime;
var score;
var obs = [];
var firstRunning;
var skyCanMove;
var mouseCanControl;

window.onload = function () {
    setup();
    control.start();
};

function Control() {
    this.start = function () {
        sfx_swooshing.play();
        var ctrl = setInterval(function () {
            switch (STATE) {
                case RUNNING:
                    background.paint(ctx);
                    if (skyCanMove) background.step();

                    bird.paint(ctx);
                    bird.stepDown();
                    bird.outOfBounds();

                    obstacleEnter(3000, 280);
                    paintObstacle();
                    stepObstacle();
                    checkHit();
                    checkScore();
                    writeDown(score, true, 135, 150, 160, 150);
                    deleteObstacle();
                    break;

                case WAITING:
                    background.paint(ctx);
                    background.step();

                    cop.paint(ctx);
                    bird.paint(ctx);
                    lastTime = new Date().getTime();
                    break;

                case PAUSE:
                    background.paint(ctx);
                    paintObstacle();
                    bird.paint(ctx);
                    pause.paint(ctx);
                    writeDown(score, true, 135, 150, 160, 150);
                    break;

                case GAME_OVER:
                    sfx_die.play();
                    clearInterval(ctrl);
                    background.paint(ctx);
                    bird.paint(ctx);

                    setTimeout(function () {
                        sfx_swooshing.play();
                        scoreBoard.paint(ctx);

                        writeDown(score, false, 265, 280, 275, 280);

                        drawMedal(score);

                        rep.paint(ctx);
                    }, 1500);

            }

        }, 1);
    }
}

function imageLocation(img, x, y) {
    this.img = img;
    this.x = x;
    this.y = y;
}

function Object(x, y, width, height, img, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;

    if (speed == 0) {
        this.interval = 0;
    }
    else {
        this.interval = 1000 / speed;
    }

    this.lastTime = 0;

    this.hit = function (component) {
        var c = component;
        return c.x > this.x - c.width && c.x < this.x + this.width && c.y > this.y - c.height && c.y < this.y + this.height;
    }
}

function Icon(x, y, width, height, img, speed) {
    Object.call(this, x, y, width, height, img, speed);

    this.paint = function (ctx) {
        ctx.drawImage(this.img, this.x, this.y);
    }
}

function Sky(x, y, width, height, img, speed) {
    Object.call(this, x, y, width, height, img, speed);

    this.x2 = this.width;
    this.y2 = 0;

    this.paint = function (ctx) {
        ctx.drawImage(this.img, this.x, this.y);
        ctx.drawImage(this.img, this.x2, this.y2);
    };

    this.step = function () {
        if (!isActionTime(this.lastTime, this.interval)) {
            return;
        }
        this.lastTime = new Date().getTime();
        this.x--;
        this.x2--;
        if (this.x < -this.width) {
            this.x = this.width;
        }
        if (this.x2 < -this.width) {
            this.x2 = this.width;
        }
    };
}

function Bird(x, y, width, height, img, speedUp, speedDown, speedFly, life, frameCount) {
    Object.call(this, x, y, width, height, img, speedFly);

    var i = 0;
    this.frameCount = frameCount;
    this.speedUp = speedUp;
    this.speedDown = speedDown;
    this.life = life;


    this.paint = function (ctx) {
        if (!isActionTime(this.lastTime, this.interval)) {
            ctx.drawImage(this.img[i], this.x, this.y);
            return;
        }
        this.lastTime = new Date().getTime();
        i++;
        i %= this.frameCount;
        ctx.drawImage(this.img[i], this.x, this.y);
    };

    this.stepUp = function () {
        this.y -= this.speedUp;
    };

    this.stepDown = function () {
        this.y += this.speedDown;
    };

    this.outOfBounds = function () {
        if (this.height + this.y >= 575) {
            this.life--;
        }

        if (this.y <= 100) {
            this.y = 100;
        }

        if (this.life == 0) {
            STATE = GAME_OVER;
        }
    };

    this.down = function () {
        mouseCanControl = false;
        skyCanMove = false;
        this.speedDown = 2;
        this.stepDown();
    };

    this.overObstacle = function (component) {
        var c = component;
        return c.x + c.width <= this.x;
    }

}

function Obstacle(x, y, width, height, img, speed, state, length) {
    Object.call(this, x, y, width, height, img, speed);

    var obstacles = [];
    this.canAddScore = true;
    this.state = state;
    this.length = length;
    this.height = 26 + this.length;

    this.paint = function (ctx) {
        var tmp = this.y;
        if (this.state == 0)//Up
        {
            for (var i = 0; i < this.length; i++) {
                obstacles[i] = new imageLocation(this.img, this.x, this.y);
                this.y++;
            }

            obstacles[this.length] = new imageLocation(pipeDown, this.x, this.y);
            this.y = tmp;
            this.realY = this.y;
        }

        if (this.state == 1)//Down
        {
            for (var j = 0; j < this.length; j++) {
                obstacles[j] = new imageLocation(this.img, this.x, this.y);
                this.y--;
            }

            obstacles[this.length] = new imageLocation(pipeUp, this.x, this.y);
            this.y = tmp;
            this.realY = this.y - this.height;
        }

        for (var i = 0; i < obstacles.length; i++) {
            ctx.drawImage(obstacles[i].img, obstacles[i].x, obstacles[i].y);
        }

    };

    this.step = function () {
        if (!isActionTime(this.lastTime, this.interval)) {
            return;
        }
        this.lastTime = new Date().getTime();
        this.x--;
    };

    this.outOfBounds = function () {
        return this.x <= -this.width;
    };

    this.hit = function (component) {
        var c = component;
        return c.x > this.x - c.width && c.x < this.x + this.width && c.y > this.realY - c.height && c.y < this.realY + this.height;
    }
}

function isActionTime(lastTime, interval) {
    if (lastTime == 0) {
        return true;
    }

    var currentTime = new Date().getTime();
    return currentTime - lastTime >= interval;
}

function obstacleEnter(firstAppearTime, interval) {
    var check = random(0, 1);
    if (firstRunning) {
        if (!isActionTime(lastTime, firstAppearTime)) {
            return;
        }
        lastTime = new Date().getTime();
        firstRunning = false;

        obs[obs.length] = new Obstacle(764, 100, 52, 26, pipe, 100, 0, check ? random(100, 230)
            : random(100, 140));
        obs[obs.length] = new Obstacle(764, 575, 52, 26, pipe, 100, 1, check ? random(100, 140)
            : random(100, 230));
    }

    if (obs[obs.length - 1].x <= 764 - interval)
    {
        obs[obs.length] = new Obstacle(764, 100, 52, 26, pipe, 100, 0, check ? random(100, 230)
            : random(100, 140));
        obs[obs.length] = new Obstacle(764, 575, 52, 26, pipe, 100, 1, check ? random(100, 140)
            : random(100, 230));
    }

}

function paintObstacle() {
    for (var i = 0; i < obs.length; i++) {
        obs[i].paint(ctx);
    }

}

function stepObstacle() {
    for (var i = 0; i < obs.length; i++) {
        obs[i].step();
    }

}

function deleteObstacle() {
    var ary = [];
    for (var i = 0; i < obs.length; i++) {
        if (!obs[i].outOfBounds()) {
            ary[ary.length] = obs[i];
        }
    }
    obs = ary;
}

function checkHit() {
    for (var i = 0; i < obs.length; i++) {
        var obs_ = obs[i];
        if (obs_.hit(bird)) {
            console.log(obs_.hit(bird));
            bird.down();
        }
    }
}

function checkScore() {
    for (var i = 0; i < obs.length; i++) {
        if (obs[i].canAddScore && bird.overObstacle(obs[i]) && i % 2 == 0) {
            sfx_point.play();
            score++;
            obs[i].canAddScore = false;
        }
    }
}

function random(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min);
}

function digitNumber(number) {
    var i = 10;
    var count = 1;
    while (i <= number) {
        i *= 10;
        count++;
    }
    return count;
}

function writeDown(number, bigOrSmall, x1, y1, x2, y2) {
    var digit = digitNumber(number);

    if (digit == 1) {
        _numberWrite(number, x1, y1, false, bigOrSmall);
    }
    else if (digit == 2) {
        _numberWrite(number, x1, y1, true, bigOrSmall);
        _numberWrite(number, x2, y2, false, bigOrSmall);
    }
}

function _numberWrite(number, x, y, tenthDigit, bigOrSmall) {
    var num = split(number, tenthDigit);
    if (bigOrSmall) {
        switch (num) {
            case 0:
                ctx.drawImage(font_Big[0], x, y);
                break;
            case 1:
                ctx.drawImage(font_Big[1], x, y);
                break;
            case 2:
                ctx.drawImage(font_Big[2], x, y);
                break;
            case 3:
                ctx.drawImage(font_Big[3], x, y);
                break;
            case 4:
                ctx.drawImage(font_Big[4], x, y);
                break;
            case 5:
                ctx.drawImage(font_Big[5], x, y);
                break;
            case 6:
                ctx.drawImage(font_Big[6], x, y);
                break;
            case 7:
                ctx.drawImage(font_Big[7], x, y);
                break;
            case 8:
                ctx.drawImage(font_Big[8], x, y);
                break;
            case 9:
                ctx.drawImage(font_Big[9], x, y);
                break;
        }
    }
    else {
        switch (num) {
            case 0:
                ctx.drawImage(font_Small[0], x, y);
                break;
            case 1:
                ctx.drawImage(font_Small[1], x, y);
                break;
            case 2:
                ctx.drawImage(font_Small[2], x, y);
                break;
            case 3:
                ctx.drawImage(font_Small[3], x, y);
                break;
            case 4:
                ctx.drawImage(font_Small[4], x, y);
                break;
            case 5:
                ctx.drawImage(font_Small[5], x, y);
                break;
            case 6:
                ctx.drawImage(font_Small[6], x, y);
                break;
            case 7:
                ctx.drawImage(font_Small[7], x, y);
                break;
            case 8:
                ctx.drawImage(font_Small[8], x, y);
                break;
            case 9:
                ctx.drawImage(font_Small[9], x, y);
                break;
        }
    }
}

function split(number, tenthDigit) {
    if (tenthDigit) tmp = parseInt(number / 10);
    else tmp = number % 10;
    return tmp;
}

function drawMedal(score) {
    if (score <= 3) {
        ctx.drawImage(medal_bronze, 120, 291);
    } else if (score > 3 && score <= 6) {
        ctx.drawImage(medal_silver, 120, 291);
    } else if (score > 6 && score <= 9) {
        ctx.drawImage(medal_gold, 120, 291);
    } else if (score > 9) {
        ctx.drawImage(medal_platinum, 120, 291);
    }
}

function getPointOnCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
        x : x - bbox.left * (canvas.width / bbox.width),
        y : y - bbox.top * (canvas.height / bbox.height)
    };
}

function setup() {
    STATE = WAITING;

    bird.life = 1;
    bird.x = 70;
    bird.y = 250;
    bird.speedDown = 0.8;

    firstRunning = true;
    skyCanMove = true;
    mouseCanControl = true;

    lastTime = new Date().getTime();
    score = 0;
    obs = [];
}

canvas.onmousedown = function (ev) {

    if (mouseCanControl) {
        bird.stepUp();
        sfx_wing.pause();
        sfx_wing.load();

        sfx_wing.play();
    }

    if (firstRunning) {
        STATE = RUNNING;
    }

    var e = ev ? ev : window.event;
    var mpoint = getPointOnCanvas(e.x, e.y);

    if (mpoint.x > rep.x && mpoint.x <= rep.x + rep.width && mpoint.y >= rep.y && mpoint.y <= rep.y + rep.height && STATE == GAME_OVER)
    {
        setup();
        control.start();
    }
};

document.onkeydown = function (ev) {
    if (ev.keyCode == 32 && STATE == PAUSE) {
        STATE = RUNNING;
        mouseCanControl = true;
    }
    else if (ev.keyCode == 32 && STATE == RUNNING) {
        STATE = PAUSE;
        mouseCanControl = false;
    }
};