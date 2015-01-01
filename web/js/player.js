define(['pixi'], function(PIXI) {

    var carTexture = PIXI.Texture.fromImage('https://haluzan.com/biz/app/GoClick/dars/2/web/img/player.png');
    var car = new PIXI.Sprite(carTexture);

    return {

        init: function(stage) {
            car.anchor.x = 0.5;
            car.anchor.y = 0;
            car.position.x = 89;
            car.position.y = 400;
            car.hitArea = new PIXI.Rectangle(-23, -54, 47, 100);
            stage.addChild(car);
            // var carGraphics = new PIXI.Graphics();
            // carGraphics.beginFill(0x000000);
            // carGraphics.lineStyle(2, 0xFF0000);
            // // carGraphics.drawRect(89 - 23, 450 - 54, 47, 100);
            // carGraphics.drawRect(89, 400, 5, 5);
            // stage.addChild(carGraphics);
        },

        getPosition: function() {
            return car.position.y;
        },
        update: function(environmentSpeed) {
            car.position.y -= environmentSpeed
        }

    }

});
