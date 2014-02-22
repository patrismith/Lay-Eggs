var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var Game = function() {
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
        dest: {x: 150, y: 160}
    });

    //this.c.entities.create(Counter, {});

};

var Bug = function (game, settings) {
    this.c = game.c;
    this.c.lastbug = this;
    this.player = false;
    //this.center = { x: 0, y: 0 };
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
    this.collision = function () {};
    this.uncollision = function () {};
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
        ageMax: 10
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
        speed: 1,
        acc: 1,
        ageMax: 5
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
    ctx.lineWidth = 3;
    ctx.stroke();
};

var drawBug = function (ctx, bug) {
    ctx.beginPath();
    ctx.arc(bug.center.x, bug.center.y, bug.size.x, 0, 2 * Math.PI, false);
    ctx.fillStyle = bug.color;
    ctx.fill();
    if (bug.player) { drawPlayerHalo(ctx, bug); }
};

var updateBug = function (dt, bug) {
    if (bug.player) { playerControl(dt, bug); }
    else { aiControl(dt, bug); }
    bugGrowth(dt, bug);
    bugMovement(dt, bug);
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

var aiControl = function (dt, bug) {};

var layEgg = function (bug) {
    if (bug.age > 2 && bug.eggs > 0) {
        bug.eggs -= 1;
        FemBug(bug, {
            center: { x: bug.center.x, y: bug.center.y },
            dest: {x: bug.center.x, y: bug.center.y }
        });
    }
};

var matingCall = function (bug) {};

var bugGrowth = function (dt, bug) {
    bug.age += dt/1000;
    if (bug.size.x < bug.sizeMax && !bug.dying ) {
        bug.size.x = bug.age * 2;
        bug.size.y = bug.age * 2;
    }
    if (bug.size.x > bug.sizeMax) {
        bug.size.x = bug.sizeMax;
        bug.size.y = bug.sizeMax;
    }
    var intcolor = parseInt(bug.color.substr(1), 16);
    if (bug.age > 2 && intcolor > 548) {
        intcolor -= 128;
        if (intcolor < 548) {intcolor = 548;}
        bug.color = '#' + intcolor.toString(16);
    } else if (bug.age >= bug.ageMax) {
        bug.dying = true;
        bug.size.x -= 1;
        bug.size.y -= 1;
        if (bug.dying && bug.size.x < 1) {
            console.log('selecting new bug');
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
