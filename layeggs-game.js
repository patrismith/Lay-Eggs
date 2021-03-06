// TODO: I tried to make the game speed control all numerical constants.
// But I'm not doing the math right, or something.
// So this constant should stay at 100 until I fix it.
var gameSpeed = 100;
var ageOfConsent = 1.1;

var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var wrapText = function (context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
};

var Start = function () {
    this.width = 500;
    this.height = 500;
    this.c = new Coquette(this, "canvas", this.width, this.height, "#CFC");
    StartButton(this, {});
};

var Button = function (game, settings) {
    this.c = game.c;
    this.mouseover = false;
    this.color = '#557';
    this.draw = function (ctx) {
        drawButton(ctx, this)
    };
    this.update = function (dt) {
        updateButton(dt, this, true);
    };
    for (var i in settings) {
        this[i] = settings[i];
    }
};

var StartButton = function (game, settings) {
    game.c.entities.create(Button, {
        content: 'Lay Eggs',
        anchor: {x: 250, y: 250},
        mouseover: {x: 220, y: 220, w: 75, h: 45},
        action: function () {
            new Game();
        }
    });
};

var Text = function (game, settings) {
    this.c = game.c;
    this.color = '#557';
    this.draw = function (ctx) {
        drawText(ctx, this)
    };
    for (var i in settings) {
        this[i] = settings[i];
    };
};

var HelpText = function (game, settings) {
    game.c.entities.create(Text, {
        content: settings.content,
        anchor: settings.anchor,
        width: 250,
        lineHeight: 15
    });
};

var drawText = function (ctx, text) {
    ctx.fillStyle = text.color;
    ctx.font = "12pt Sans";
    wrapText(ctx, text.content, text.anchor.x, text.anchor.y, text.width, text.lineHeight);
}

var drawButton = function (ctx, button) {
    ctx.beginPath();
    ctx.rect(button.mouseover.x, button.mouseover.y, button.mouseover.w, button.mouseover.h);
    ctx.strokeStyle = button.color;
    ctx.stroke();
    ctx.fillStyle = button.color;
    ctx.font = "20pt Sans";
    ctx.fillText(button.content, button.anchor.x, button.anchor.y);
};

var gameOver = function (game, text, x) {
    game.c.entities.create(Text, {
        content: text,
        anchor: {x: x, y: 250}
    });
}

var updateButton = function (dt, button, isStartButton) {
    var position = button.c.inputter.getMousePosition();
    if (position
        && position.x > button.mouseover.x
        && position.y > button.mouseover.y
        && position.x < button.mouseover.x + button.mouseover.w
        && position.y < button.mouseover.y + button.mouseover.h) {
        if (isStartButton) {button.color = '#99A';}
        else {button.color = 'B99';}
        this.mouseover = true;
    } else {
        if (isStartButton) {button.color = '#557';}
        else {button.color = '755';}
        this.mouseover = false;
    }
    if (this.mouseover && button.c.inputter.isPressed(button.c.inputter.LEFT_MOUSE)) {
        if (isStartButton) {
            button.c = null;
        }
        button.action();
    }
};

var Game = function () {
    this.width = 500;
    this.height = 500;
    this.c = new Coquette(this, "canvas", this.width, this.height, "#CFC");
    this.c.lastBug = 'whatever';
    this.c.player = true;
    this.c.reproduce = false;
    FemBug(this, {
        center: {x: 50, y: 50},
        dest: {x: 40, y: 40},
        player: true
    });
    MalBug(this, {
        center: {x: 150, y: 150},
        dest: {x: 160, y: 160},
        player: false
    });
    FemBug(this, {
        center: {x: 50, y: 300},
        dest: {x: 40, y: 310},
        player: false
    });
    MalBug(this, {
        center: {x: 400, y: 25},
        dest: {x: 390, y: 35},
        player: false
    });
    this.c.entities.create(EggButton, {});
    this.c.entities.create(SquareSpawner, {});
    this.c.entities.create(BugCounter, {});
};

var Bug = function (game, settings) {
    this.c = game.c;
    this.c.lastbug = this;
    this.player = false;
    this.moveTimer = 0;
    this.dest = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.sizeMax = 0;
    this.speed = 0;
    this.acc = 0;
    this.age = 1;
    this.ageMax = 0;
    this.friction = 0.5;
    this.isBug = true;
    this.color = '#FFF';
    this.boundingBox = this.c.collider.CIRCLE;
    this.draw = function (ctx) {
        drawBug(ctx, this);
    };
    this.collision = function (other, type) {
        collideBug(this, other, type);
    };
    this.update = function (dt) {
        updateBug(dt, this);
    };

    for (var i in settings) {
        this[i] = settings[i];
    }
};

var FemBug = function (game, settings) {
    game.c.entities.create(Bug, {
        player: settings.player,
        center: settings.center,
        dest: settings.dest,
        size: {x: 2, y: 2},
        sizeMax: 10,
        fem: true,
        eggs: 5,
        fertilized: false,
        speed: 5,
        acc: 2,
        ageMax: 4,
        eggTimer: 0,
        laidFem: false,
        growthFactor: 0.01
    });
};

var MalBug = function (game, settings) {
    game.c.entities.create(Bug, {
        player: settings.player,
        center: settings.center,
        dest: settings.dest,
        size: {x: 2, y: 2},
        sizeMax: 20,
        fem: false,
        shouts: 1,
        mating: false,
        halosize: 1,
        speed: 1,
        acc: 1,
        ageMax: 3.5,
        matingTimer: 0,
        growthFactor: 0.05
    });
};

var EggButton = function (game, settings) {
    this.c = game.c;
    this.mouseover = {x: 440, y: 450, w: 50, h: 50};
    this.color = "#755"
    this.zindex = 1;
    this.center = {x: 455, y:470};
    this.radius = 20;
    this.action = function () {
        this.c.reproduce = true;
    };
    this.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.mouseover.x, this.mouseover.y);
        ctx.lineTo(this.mouseover.x-5,500);
        ctx.lineTo(500,500);
        ctx.lineTo(500,this.mouseover.y-5);
        ctx.lineTo(this.mouseover.x,this.mouseover.y);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    this.update = function (dt) {
        updateButton(dt, this, false);
    };

};

var BugCounter = function (game, settings) {
    this.c = game.c;
    this.zindex = 2;
    this.content = 2;
    this.color = '#FFF';
    this.anchor = {x: 450, y: 480};
    this.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.font = "20pt Sans";
        ctx.fillText(this.content, this.anchor.x, this.anchor.y);
    };
    this.update = function (dt) {
        this.content = this.c.entities.all(Bug).length;
        if (this.content == 0 && !this.c.won) {
            gameOver(game, 'You have lost. Reload to restart.', 250);
        };
        if (this.content > 100) {
            this.c.won = true
            for (i = 0; i < this.c.entities.all(Bug).length; i++) {
                this.c.entities.all(Bug)[i].dying = true;
            }
            gameOver(game, 'You reached 100.', 50);
        };
    };
};

var SquareSpawner = function (game, settings) {
    this.c = game.c;
    this.interval = 2000;
    this.multiplier = 0.5;
    this.spawnTimer = this.interval;
    this.update = function (dt) {
        this.spawnTimer -= 1;
        if (this.spawnTimer < 0) {
            if (this.interval > 150) {
                this.interval *= this.multiplier;
            } else { this.interval = 150; }
            this.spawnTimer = this.interval;
            spawnSquare(this);
        }
    };
};

var spawnSquare = function (spawner) {
    var x;
    var y;
    x = getRandomInt(-50, 550);
    y = getRandomInt(-50, 550);
    if (x > -10 && x < 510) {
        if (y < 250) {
            y = -50;
        } else {
            y = 550;
        }
    }
    var size = getRandomInt(10, 20);
    spawner.c.entities.create(Square, {
        center: { x: x, y: y },
        size: { x: size, y: size },
        dest: { x: getRandomInt(0, 500) , y: getRandomInt(0, 500) }
    });
};

var Square = function (game, settings) {
    this.c = game.c;
    this.dest = { x: 0, y: 0};
    this.vel = { x: 0, y: 0};
    this.speed = 0.5;
    this.acc = 0.25;
    this.friction = 0.5;
    this.color = '#D01';
    this.isSquare = true;
    this.boundingBox = this.c.collider.RECTANGLE;
    this.draw = function (ctx) {
        drawSquare(ctx, this);
    };
    this.collision = function (other, type) {
        collideSquare(this, other, type);
    };
    this.update = function (dt) {
        updateSquare(dt, this);
    };
    for (var i in settings) {
        this[i] = settings[i];
    }
};

var drawPlayerHalo = function (ctx, bug) {
    ctx.beginPath();
    ctx.arc(bug.center.x, bug.center.y, bug.size.x + 3, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#FF8';
    ctx.lineWidth = 5;
    ctx.stroke();
};

var drawMatingHalo = function (ctx, bug) {
    bug.halosize += .25;
    if (bug.halosize > 10) {bug.halosize = 1;}
    ctx.beginPath();
    ctx.arc(bug.center.x, bug.center.y, bug.size.x + bug.halosize, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#F99';
    ctx.lineWidth = 3;
    ctx.stroke();
};

var drawBug = function (ctx, bug) {
    ctx.beginPath();
    ctx.arc(bug.center.x, bug.center.y, bug.size.x, 0, 2 * Math.PI, false);
    ctx.fillStyle = bug.color;
    ctx.fill();
    if (bug.player) { drawPlayerHalo(ctx, bug); }
    if (bug.mating) { drawMatingHalo(ctx, bug); }
};

var drawSquare = function (ctx, square) {
    ctx.beginPath();
    ctx.rect(square.center.x-square.size.x/2, square.center.y-square.size.y/2, square.size.x, square.size.y);
    ctx.fillStyle = square.color;
    ctx.fill();
};

var updateBug = function (dt, bug) {
    if (bug.player) { playerControl(dt, bug); }
    else { aiControl(dt, bug); }
    if (!bug.fem && bug.mating) {
        bug.matingTimer += dt/(gameSpeed*20);
        if (bug.matingTimer > (gameSpeed/10)) {
            bug.mating = false;
            bug.matingTimer = 0;
        }
    }
    bugGrowth(dt, bug);
    bugMovement(dt, bug);
};

var updateSquare = function (dt, square) {
    if (square.dying) { bugDeath(square); }
    bugMovement(dt, square);
};

var collideBug = function (bug, other, type) {
    if (bug.fem && bug.age > ageOfConsent && other.mating) {
        bug.fertilized = true;
    }
};

var collideSquare = function (square, other, type) {
    if (other.isBug) {
        square.dying = true;
        other.dying = true;
    }
};

var playerControl = function (dt, bug) {
    if (bug.c.inputter.isDown(bug.c.inputter.LEFT_MOUSE)) {
        bug.dest = bug.c.inputter.getMousePosition();
    }
    if (bug.c.inputter.isPressed(bug.c.inputter.SPACE) || bug.c.reproduce) {
        if (bug.fem) { layEgg(bug); }
        else { matingCall(bug); }
        bug.c.reproduce = false;
    }
};

var aiControl = function (dt, bug) {
    bug.moveTimer += dt/(gameSpeed*20);
    if (bug.moveTimer > (gameSpeed / 50)) {
        bug.dest = { x: getRandomInt(0, 500), y: getRandomInt(0, 500) };
        bug.moveTimer = 0;
    }
    if (bug.fem) {
        if (bug.fertilized && bug.eggs > 0) {
            bug.eggTimer += dt/500;
            if (bug.eggTimer > (gameSpeed/10)) {
                layEgg(bug);
                bug.eggTimer = 0;
            }
        }
    } else {
        if (bug.age > ageOfConsent*2 && bug.shouts > 0 && !bug.mating) {
            matingCall(bug);
        }
    }
};

var layEgg = function (bug) {
    if (bug.age > ageOfConsent && bug.fertilized && bug.eggs > 0) {
        bug.eggs -= 1;
        bug.c.bugCount += 1;
        if (bug.laidFem) {
            MalBug(bug, {
            center: { x: bug.center.x, y: bug.center.y },
            dest: {x: bug.center.x, y: bug.center.y }
        });
            bug.laidFem = false;
        } else {
            FemBug(bug, {
                center: { x: bug.center.x, y: bug.center.y },
                dest: {x: bug.center.x, y: bug.center.y }
            });
            bug.laidFem = true;
        }
    }
};

var matingCall = function (bug) {
    if (bug.age > ageOfConsent && bug.shouts > 0) {
        bug.shouts -= 1;
        bug.mating = true;
    }
};

var bugGrowth = function (dt, bug) {
    // dividing by 200 is very quick
    // dividing by 200000 is very slow
    bug.age += dt/20000;
    // grow the bug
    if (bug.size.x < bug.sizeMax && !bug.dying ) {
        // change this if changing the bug.age dt divisor above.
        // need to use proper constants!!
        bug.size.x += bug.growthFactor;
        bug.size.y += bug.growthFactor;
    } else if (bug.size.x > bug.sizeMax) {
        // prevent the bug from growing larger
        bug.size.x = bug.sizeMax;
        bug.size.y = bug.sizeMax;
    }
    // age the bug
    var intcolor = parseInt(bug.color.substr(1), 16);
    // change color at certain age
    if (bug.age > ageOfConsent && intcolor > 1367) {
        intcolor -= 128;
        if (intcolor < 1367) {intcolor = 1367;}
        bug.color = '#' + intcolor.toString(16);
    } else if (bug.age >= bug.ageMax) {
        // shrink the bug until it's no more
        // switch player if necessary, and delete the bug
        bug.dying = true;
    }
    if (bug.dying) { bugDeath(bug); }
};

var bugDeath = function(bug) {
    bug.size.x -= 1;
    bug.size.y -= 1;
    if (bug.dying && bug.size.x < 1) {
        if (bug.player) {
            bug.player = false;
            /*
            bug.c.player = false;
            if (bug.c.lastbug.age) {
                console.log('got a player!');
                bug.c.lastbug.player = true;
                bug.c.player = true;
            } else {
                var buglist = bug.c.entities.all(Bug);
                for (i = 0; i < buglist.length; i++) {
                    console.log('got a player');
                    buglist[i].player = true;
                    buglist[i].c.player = true;
                    if (i != 0) {
                        buglist[i].c.lastbug = buglist[i-1].player;
                        buglist[i-1].player = false;
                    }
                }
            }
            */
            if (bug.c.entities.all(Bug)[1]) {
                bug.c.entities.all(Bug)[1].player = true;
            }
        }
        bug.c.entities.destroy(bug);
    }
};

var bugMovement = function (dt, bug) {
    bug.vel = getVel(bug);
    bug.center.x += bug.vel.x * dt;
    bug.center.y += bug.vel.y * dt;
};

var getVel = function (bug) {
    var x = bindValue(bug.vel.x + (bug.dest.x - bug.center.x) * 0.0001,
                      -bug.speed, bug.speed);
    var y = bindValue(bug.vel.y + (bug.dest.y - bug.center.y) * 0.0001,
                      -bug.speed, bug.speed);
    x *= 0.9;
    y *= 0.9;
    return { x: x, y: y };
};

var bindValue = function (value, lower, upper) {
    if (value < lower) { return lower; }
    else if(value > upper) { return upper; }
    else { return value; }
}
