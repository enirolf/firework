/*
 * Create fireworks in your webbrowser.
 * Based on: https://codepen.io/whqet/pen/Auzch.
 * Made by Florine de Geus.
 */

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.onload = window.onresize = function() {
    var canvas = document.querySelector('canvas');

    var c = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    var fireworks = [];
    var particles = [];
    var hue = 120;

    var timerTotal = 80;
    var timerTick = 0;

    /* Return a random value between 'min' and 'max'. */
    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }


    /* Return the distance between two points. */
    function distance(p1, p2) {
        var xDist = p1.x - p2.x;
        var yDist = p1.y - p2.y;

        return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    }

    /* Stores each firework object. A firework unit exists until it reaches its
     * target position. Then, it falls apart into multiple particles which are
     * defined in the Particle class.
     */
    function Firework(startPos, targetPos) {
        this.currPos = startPos;
        this.startPos = startPos;
        this.targetPos = targetPos;
        this.distToTarget = distance(startPos, targetPos);
        this.distTraveled = 0;

        /* Store the previous coordinates so the firework gets a 'tail'.
         * The longer 'coordCount', the longer the tail.
         */
        this.coordinates = [];
        this.coordCount = 3;

        /* Fill the coordinate array with our starting position for now. */
        for (var i = 0; i < this.coordCount; i++) {
            this.coordinates.push(this.currPos);
        }

        this.angle = Math.atan2(targetPos.y - startPos.y, targetPos.x - startPos.x);
        this.velocity = 1.2;
        this.acceleration = 1.05;
        this.colour = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        }
        this.brightness = randomRange(50, 70);
        this.targetRadius = 1;
    }

    /* Update the position of the Firework object. */
    Firework.prototype.update = function(index) {
        this.coordinates.pop();
        this.coordinates.unshift(this.currPos);

        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        this.velocity *= this.acceleration;

        var velocityX = Math.cos(this.angle) * this.velocity;
        var velocityY = Math.sin(this.angle) * this.velocity;

        this.distTraveled = distance(
            this.startPos,
            {
                x: this.currPos.x + velocityX,
                y: this.currPos.y + velocityY
            }
        );

        if (this.distTraveled >= this.distToTarget) {
            createParticles(this.targetPos, this.colour);
            fireworks.splice(index, 1);
        } else {
            this.currPos = {
                x: this.currPos.x + velocityX,
                y: this.currPos.y + velocityY
            };
        }
    };

    /* Draw the Firework object in its current position. */
    Firework.prototype.draw = function() {
        c.beginPath();
        c.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
        c.lineTo(this.currPos.x, this.currPos.y);
        c.strokeStyle = `rgb(${this.colour.r}, ${this.colour.g}, ${this.colour.b})`;
        c.stroke();
    };


    /* Contains all information and functionality for each particle. */
    function Particle(pos, colour) {
        this.pos = pos;

        /* Store the previous coordinates so the firework gets a 'tail'.
         * The longer 'coordCount', the longer the tail.
         */
        this.coordinates = [];
        this.coordCount = 5;

        /* Fill the coordinate array with our starting position for now. */
        for (var i = 0; i < this.coordCount; i++) {
            this.coordinates.push(this.pos);
        }

        this.angle = randomRange(0, Math.PI * 2);
        this.velocity = randomRange(1, 10);
        this.friction = 0.98;
        this.gravity = 1;
        this.colour = colour;
        this.brightness = randomRange(50, 80);
        this.alpha = 1;
        this.decay = randomRange(0.015, 0.06);
    }

    /* Update the position of the particle */
    Particle.prototype.update = function(index) {
        this.coordinates.pop();
        this.coordinates.unshift(this.pos);
        this.velocity *= this.friction;

        this.pos = {
            x: this.pos.x + Math.cos(this.angle) * this.velocity,
            y: this.pos.y + Math.sin(this.angle) * this.velocity * this.gravity
        }

        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    };

    /* Draw the particle in its current position. */
    Particle.prototype.draw = function() {
        c.beginPath();
        c.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
        c.lineTo(this.pos.x, this.pos.y);
        c.strokeStyle = `rgb(${this.colour.r}, ${this.colour.g}, ${this.colour.b})`;
        c.stroke();
    };

    /* Create a new particle. */
    function createParticles(pos, colour) {
        var count = 50;
        while (count--) {
            particles.push(new Particle(pos, colour));
        }
    }

    /* The main loop that draws the actual firework. */
    function main() {
        requestAnimFrame(main);
        hue = randomRange(0, 360);
        timerTotal = Math.round(randomRange(30, 80));

        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = 'rgba(0, 0, 0, 0.5)';
        c.fillRect(0, 0, w, h);
        c.globalCompositeOperation = 'lighter';

        for (var i = 0; i < fireworks.length; i++) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        for (var i = 0; i < particles.length; i++) {
            particles[i].draw();
            particles[i].update(i);
        }

        /* Only fire off new firework after a certain time. */
        if (timerTick >= timerTotal) {
            fireworks.push(new Firework(
                    {
                        x: w / 2,
                        y: h
                    },

                    {
                        x: randomRange(0, w),
                        y: randomRange(0, h / 2)
                    }
                )
            );

            timerTick = 0;
        } else {
            timerTick++;
        }
    }

    main();
}
