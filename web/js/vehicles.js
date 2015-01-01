define(['pixi', 'player', 'environment'], function(PIXI, player, environment) {

    var vehicles =
        [{
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle1.png',
            'x': -33,
            'y': -120,
            'width': 67,
            'height': 120 // done 0
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle2.png',
            'x': -27,
            'y': -103,
            'width': 57,
            'height': 103 // done 1
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle3.png',
            'x': -35,
            'y': -222,
            'width': 75,
            'height': 222 // done 2
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle4.png',
            'x': -29,
            'y': -108,
            'width': 62,
            'height': 108 // done 3
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle5.png',
            'x': -29,
            'y': -120,
            'width': 62,
            'height': 120 // done 4
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle6.png',
            'x': -29,
            'y': -110,
            'width': 62,
            'height': 110 // done 5
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle7.png',
            'x': -30,
            'y': -110,
            'width': 62,
            'height': 110 // done 6
        }, {
            'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle8.png',
            'x': -29,
            'y': -120,
            'width': 62,
            'height': 120 // done 7
        }, {
        'image': 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/vehicle9.png',
            'x': -29,
            'y': -113,
            'width': 61,
            'height': 113 // done 8
        }];
    var enemies = [];
    var animatingEnemies = []
    var rectTest = []
    var graphicsAr = []

    function checkOffScreenEnemies() {
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].position.y >= 700) {
                enemies.splice(enemies.indexOf(enemies[i]), 1);
            }
        }
        for (var i = 0; i < animatingEnemies.length; i++) {
            if (animatingEnemies[i].position.y >= 700) {
                animatingEnemies.splice(animatingEnemies.indexOf(animatingEnemies[i]), 1);
            }
        }
    }

    function makeAnimations() {
        if (animatingEnemies.length > 0) {
            for (var i = 0; i < animatingEnemies.length; i++) {
                // speed when moving the vehicle

                if (animatingEnemies[i].positioning === 'left') {
                    // move to left
                    if (animatingEnemies[i].position.x >= 26) {
                        animatingEnemies[i].position.x -= 2;
                        animatingEnemies[i].position.y -= 1.5;
                    }
                } else {
                    // move right
                    if (!animatingEnemies[i].doubleClick && animatingEnemies[i].position.x <= 145) {
                        // one click
                        animatingEnemies[i].position.x += 2;
                        animatingEnemies[i].position.y -= 1.5;

                    }
                    if (animatingEnemies[i].doubleClick && animatingEnemies[i].position.x <= 185) {
                        // double click
                        animatingEnemies[i].position.x += 1.5;
                        animatingEnemies[i].position.y -= 1;
                    }
                }

            }
        }
    }

    return {

        spawn: function(stage) {
            // Create an enemy object
            var vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
            var enemy = new PIXI.Sprite(PIXI.Texture.fromImage(vehicle.image));
            enemy.anchor.x = 0.5;
            enemy.anchor.y = 1;
            enemy.setInteractive(true);
            enemy.hitArea = new PIXI.Rectangle(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
            // custom attribute
            enemy.hasMoved = false;
            enemy.doubleClick = false;

            // enemy onmouseover style
            enemy.mouseover = function(mouseData) {
                document.body.style.cursor = 'pointer';
            }
            enemy.mouseout = function(mouseData) {
                document.body.style.cursor = 'default';
            }

            // enemy on click
            var alreadyclicked = false;
            enemy.click = function(mouseData) {
                if (alreadyclicked) {
                    alreadyclicked = false;
                    clearTimeout(alreadyclickedTimeout);
                    this.hasMoved = true;
                    if (this.positioning === 'right') {
                        this.doubleClick = true;
                        // reveal(done) & +time & paust the game(done)
                        window.currentTime += 1000;
                        $('#alert').reveal({
                            closeOnBackgroundClick: false
                        });
                        ga('send', 'event', 'game', 'doubleClick');
                        environment.stopGame();
                    }
                } else {
                    alreadyclicked = true;
                    alreadyclickedTimeout = setTimeout(function() {
                        alreadyclicked = false;
                        this.doubleClick = false;
                        this.hasMoved = true;
                    }, 650);
                }

                animatingEnemies.push(this);
                this.hasMoved = true;
                environment.unFreezeWorld();
                window.testni = animatingEnemies;
            }

            // enemy x coordinate
            xPositioningRand = Math.floor(Math.random() * 2) + 1;
            if (xPositioningRand === 2) {
                enemy.position.x = 50;
                enemy.positioning = 'left';
            } else {
                enemy.position.x = 125;
                enemy.positioning = 'right';
            }

            // enemy y coordinate
            enemy.position.y = -100;
            var hasCollided = false;
            if (enemies.length > 0) {
                $.each(enemies, function(i, value) {
                    if (hitTest(enemies[i].position.x + enemies[i].hitArea.x, enemies[i].position.y + enemies[i].hitArea.y,
                        enemies[i].hitArea.width, enemies[i].hitArea.height,
                        enemy.position.x + enemy.hitArea.x, enemy.position.y + enemy.hitArea.y,
                        enemy.hitArea.width, enemy.hitArea.height)) {
                        // objects are colliding, stop the loop!
                        hasCollided = true;
                        return false;
                    }
                });
            }

            // Add enemy to list & stage
            if (!hasCollided) {
                enemies.push(enemy);
                enemy.collission = hasCollided;
                stage.addChild(enemy);

                // GRAPHICS
                // var graphics = new PIXI.Graphics();
                // graphics.beginFill(0x0000FF);
                // graphics.lineStyle(2, 0xFF0000);
                // // graphics.drawRect(enemy.position.x + enemy.hitArea.x, enemy.position.y + enemy.hitArea.y, enemy.hitArea.width, enemy.hitArea.height);
                // graphics.drawRect(enemy.position.x, enemy.position.y, 5, 5);
                // stage.addChild(graphics);
                // graphicsAr.push(graphics);
                // window.test = enemies;
            }

        },

        update: function(environmentSpeed) {
            makeAnimations();
            checkOffScreenEnemies();
            $.each(enemies, function(i, value) {
                // breaking system aka. ABS
                if (environmentSpeed >= 8.5) {
                    distanceBeforeBreaking = 160;
                } else if (environmentSpeed >= 7 && environmentSpeed < 8.5) {
                    distanceBeforeBreaking = 120;
                } else {
                    distanceBeforeBreaking = 100;
                }
                if (enemies[i].position.y >= (player.getPosition() - distanceBeforeBreaking) &&
                    enemies[i].hasMoved == false) {
                    environment.update(true);
                }
                // check if enemy is near a player, if enemy is very near, put game in the "freeze" mode
                if (enemies[i].position.y >= (player.getPosition() - 20) &&
                    enemies[i].hasMoved == false) {
                    environment.freezeWorld();
                }
                if (environmentSpeed >= 4) {
                    enemies[i].position.y += environmentSpeed - 4;
                } else {
                    enemies[i].position.y += environmentSpeed;
                }

            });
            // GRAPHICS
            // $.each(graphicsAr, function(i, value) {
            //     // check if enemy is near a player, if enemy is very near, put game in the "freeze" mode
            //     if (graphicsAr[i].position.y >= (player.getPosition() - 150) &&
            //         graphicsAr[i].position.y <= (player.getPosition() + 21) &&
            //         graphicsAr[i].hasMoved == false) {
            //         environment.update(true);
            //     }
            //     if (graphicsAr[i].position.y >= (player.getPosition() - 20) &&
            //         graphicsAr[i].hasMoved == false) {
            //         environment.freezeWorld();
            //     }
            //     if (environmentSpeed >= 4) {
            //         graphicsAr[i].position.y += environmentSpeed - 4;
            //     } else {
            //         graphicsAr[i].position.y += environmentSpeed;
            //     }

            // });
        },


        // stuff for crash
        updateCrash: function(environmentSpeed) {
            checkOffScreenEnemies();
            $.each(enemies, function(i, value) {
                if (enemies[i].positioning === 'left') {
                    // move to left
                    if (enemies[i].position.x >= 26) {
                        enemies[i].position.x -= 2;
                    }
                    enemies[i].position.y += environmentSpeed;
                } else {
                    // move to right
                    if (enemies[i].position.x <= 145) {
                        enemies[i].position.x += 2;
                    }
                    enemies[i].position.y += environmentSpeed;
                }
            });
        },
        getEnemies: function() {
            return enemies.length;
        }

    }

    function hitTest(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x1 + w1 > x2)
            if (x1 < x2 + w2)
                if (y1 + h1 > y2)
                    if (y1 < y2 + h2)
                        return true;
        return false;
    }

});
