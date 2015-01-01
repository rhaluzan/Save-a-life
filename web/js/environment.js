define(['pixi'], function(PIXI) {

    var environmentSpeed = 5;
    var freeze = false;
    var runAnimation = false; // is game running or not (false = not)

    return {

        // Speed
        setSpeed: function(speed) {
            environmentSpeed = speed;
        },
        getSpeed: function() {
            return environmentSpeed;
        },
        update: function(breaking) {
            var breaking = typeof breaking !== 'undefined' ? breaking : false;
            // if max environmentSpeed (10) is reached
            if (environmentSpeed >= 11.5) {
                environmentSpeed = 11.5;
            } else if (!breaking) {
                // accelerate
                environmentSpeed += (11.5 - environmentSpeed) / 20; // environmentSpeed + (0.027777777 * 1.9); // 0.09;
            } else {
                // brake
                if (environmentSpeed <= 5) {
                    environmentSpeed = 5;
                } else {
                    environmentSpeed -= (11.5 - environmentSpeed) / 13; // environmentSpeed * 0.01;
                }
            }

        },

        // Freezing
        freezeWorld: function() {
            freeze = true;
        },
        unFreezeWorld: function() {
            freeze = false;
        },
        getFreeze: function() {
            return freeze;
        },


        // Stop game
        stopGame: function() {
            runAnimation = false;
        },
        startGame: function() {
            runAnimation = true;
        },
        getGameStatus: function() {
            return runAnimation;
        }

    }

});
