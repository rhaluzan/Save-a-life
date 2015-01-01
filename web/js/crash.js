define(['pixi'], function(PIXI) {

    var crash;
    var crashStatus = false;
    var crashSpawned = false;

    return {
        startCrash: function() {
            if (!crashStatus) {
                crashStatus = true;
            }
        },
        spawnCrash: function(stage, environmentSpeed) {
            if (!crashSpawned) {
                crash = new PIXI.Sprite(PIXI.Texture.fromImage('https://haluzan.com/biz/app/GoClick/dars/2/web/img/crash.png'));
                crash.anchor.x = 0.5;
                crash.anchor.y = 0.5;
                crash.setInteractive(true);
                crash.hitArea = new PIXI.Rectangle(70, 234, 148, 234);
                crash.position.x = 100;
                crash.position.y = -150;
                stage.addChild(crash);
                crashSpawned = true;
            } else {
                if (this.getCrashPosition() <= 180) {
                    crash.position.y += environmentSpeed;
                }
            }
        },
        getCrashPosition: function() {
            // console.log(crash.position.y);
            return crash.position.y;
        },
        getCrashStatus: function() {
            return crashStatus;
        }

    }

});
