// from stackoverflow
var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// from html5canvastutorials
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
    HelpText(this, {
        anchor: {x: 20, y: 20},
        content: 'You are the Circle species. Your goal is to wipe out the Square species.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 80},
        content: 'To move, click anywhere on this canvas.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 120},
        content: 'To lay eggs or perform a mating call, press the space bar.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 160},
        content: 'The female only gets five eggs. You must be fertilized to lay eggs. Collide with a male Circle performing the mating call to become fertilized.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 250},
        content: 'The male only gets one mating call. Collide with a female Circle to fertilize.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 300},
        content: 'Collide with a Square to destroy it. This will also destroy you.'
    });
    HelpText(this, {
        anchor: {x: 20, y: 300},
        content: 'When you die, control will switch to the youngest member of the Circle species.'
    });
};

var Button = function (game, settings) {
    this.c = game.c;
    this.mouseover = false;
    this.color = '#224';
    this.draw = function (ctx) {
        drawButton(ctx, this)
    };
    this.update = function (dt) {
        updateButton(dt, this);
    };
    for (var i in settings) {
        this[i] = settings[i];
    }
};

var StartButton = function (game, settings) {
    game.c.entities.create(Button, {
        content: 'Start',
        anchor: {x: 400, y: 400},
        mouseover: {x: 390, y: 370, w: 75, h: 45}
    });
};

var Text = function (game, settings) {
    this.c = game.c;
    this.color = '#224';
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
    //ctx.beginPath();
    //ctx.rect(button.mouseover.x, button.mouseover.y, button.mouseover.w, button.mouseover.h);
    //ctx.stroke();
    ctx.fillStyle = button.color;
    ctx.font = "20pt Sans";
    ctx.fillText(button.content, button.anchor.x, button.anchor.y);
};

var updateButton = function (dt, button) {
    var position = button.c.inputter.getMousePosition();
    if (position
        && position.x > button.mouseover.x
        && position.y > button.mouseover.y
        && position.x < button.mouseover.x + button.mouseover.w
        && position.y < button.mouseover.y + button.mouseover.h) {
        button.color = '#557';
        this.mouseover = true;
    } else {
        button.color = '#224';
        this.mouseover = false;
    }
    if (this.mouseover) {
        button.c = null;
        new Game(false);
    }
};

var Game = function () {
    this.width = 500;
    this.height = 500;
    this.c = new Coquette(this, "canvas", this.width, this.height, "#CFC");
    this.c.lastBug = 0;

    FemBug(this, {
        center: {x: 50, y: 50},
        dest: {x: 40, y: 40},
        player: true
    });
    MalBug(this, {
        center: {x: 150, y: 150},
        dest: {x: 150, y: 160},
        player: false
    });

    //this.c.entities.create(Counter, {});

};

var Bug = function (game, settings) {
    this.c = game.c;
    this.c.lastbug = this;
    this.player = false;
    //this.center = { x: 0, y: 0 };
    this.moveTimer = 0;
    this.dest = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    //this.size = { x: 0, y: 0 };
    this.sizeMax = 0;
    this.speed = 0;
    this.acc = 0;
    this.age = 1;
    this.ageMax = 0;
    this.friction = 0.5;
    this.fem = true;
    this.color = '#FFF';
    this.draw = function (ctx) {
        drawBug(ctx, this);
    };
    this.collision = function (other, type) {
        collideBug(this, other, type);
    };
    //this.uncollision = function () {};
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
        ageMax: 10,
        eggTimer: 0,
        laidFem: false,
        growthFactor: 0.001
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
        ageMax: 7,
        matingTimer: 0,
        growthFactor: 0.005
    });
};

/* let's draw the number of bugs on the canvas
var Counter = function (game, settings) {
    this.c = game.c;
    //this.location = { x:
    this.draw = function (ctx) {};
    this.update = function (dt) {};
};
*/

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

var updateBug = function (dt, bug) {
    if (bug.player) { playerControl(dt, bug); }
    else { aiControl(dt, bug); }
    bugGrowth(dt, bug);
    bugMovement(dt, bug);
};

var collideBug = function (bug, other, type) {
    if (type === bug.c.collider.INITIAL) {
        if (bug.fem && bug.age > 2 && other.mating) {
            bug.fertilized = true;
        }
    }
};

var playerControl = function (dt, bug) {
    if (bug.c.inputter.isDown(bug.c.inputter.LEFT_MOUSE)) {
        bug.dest = bug.c.inputter.getMousePosition();
    }
    if (bug.c.inputter.isPressed(bug.c.inputter.SPACE)) {
        if (bug.fem) { layEgg(bug); }
        else { matingCall(bug); }
    }
};

var aiControl = function (dt, bug) {
    bug.moveTimer += dt/2000;
    if (bug.moveTimer > 2) {
        bug.dest = { x: getRandomInt(0, 500), y: getRandomInt(0, 500) };
        bug.moveTimer = 0;
    }
    if (bug.fem) {
        if (bug.fertilized && bug.eggs > 0) {
            bug.eggTimer += dt/2000;
            if (bug.eggTimer > 10) {
                layEgg(bug);
                bug.eggTimer = 0;
            }
        }
    } else {
        if (bug.mating) {
            bug.matingTimer += dt/2000;
            if (bug.matingTimer > 10) {
                bug.mating = false;
                bug.matingTimer = 0;
            }
        }
        if (bug.age > 2 && bug.shouts > 0 && !bug.mating) {
            matingCall(bug);
        }
    }
};

var layEgg = function (bug) {
    if (bug.age > 2 && bug.fertilized && bug.eggs > 0) {
        bug.eggs -= 1;
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
    if (bug.age > 4 && bug.shouts > 0) {
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
    if (bug.age > 2 && intcolor > 548) {
        intcolor -= 128;
        if (intcolor < 548) {intcolor = 548;}
        bug.color = '#' + intcolor.toString(16);
    } else if (bug.age >= bug.ageMax) {
        // shrink the bug until it's no more
        // switch player if necessary, and delete the bug
        bug.dying = true;
        bug.size.x -= 1;
        bug.size.y -= 1;
        if (bug.dying && bug.size.x < 1) {
            if (bug.player) {
                bug.player = false;
                bug.c.lastbug.player = true;
            }
            bug.c.entities.destroy(bug);
        }
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
