require(['pixi', 'jquery', 'player', 'vehicles', 'loader', 'environment', 'canvas', 'crash', 'moment',
        'jquery.timer', 'jquery.foundation'
    ],
    function(PIXI, $, player, vehicles, loader, environment, canvas, crash, moment) {

        // requestAnimationFrame POLYFILL
        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() {
                            callback(currTime + timeToCall);
                        },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());

        // AJAX STUFFz
        var wasAjaxSent = false;

        function addGame(time) {
            console.log("FORMAT", formatTime(time));
            wasAjaxSent = true;
            $.ajax({
                url: '//haluzan.com/biz/app/GoClick/dars/2/web/index.php/api/addGame',
                type: 'POST',
                data: {
                    'time': time,
                },
                dataType: 'json',
                success: function(data) {
                    if (data.status == "OK") {
                        updateRank();
                        console.log('OK: ' + data.msg);
                        // window.location.href = "https://haluzan.com/biz/app/GoClick/dars/1/web/index.php/successf";
                    } else {
                        console.log('Not OK: ' + data.msg);
                    }
                },
                error: function(data) {
                    console.log('error, prislo je do napake', data);
                }
            });
        }

        function updateRank() {
            console.log("updating rank");
            $.ajax({
                url: '//haluzan.com/biz/app/GoClick/dars/2/web/index.php/api/fetchRank',
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data.status == "OK") {
                        console.log('OK: ' + data.data);
                        $('.currentRank').html(data.data);
                    } else {
                        console.log('Not OK: ' + data.data);
                    }
                },
                error: function(data) {
                    console.log('error, prislo je do napake', data);
                }
            });
        }

        function addInvite(invites) {
            $.ajax({
                url: '//haluzan.com/biz/app/GoClick/dars/2/web/index.php/api/addInvite',
                type: 'POST',
                data: {
                    'invites': invites,
                },
                dataType: 'json',
                success: function(data) {
                    if (data.status == "OK") {
                        console.log('OK: ' + data.msg);
                    } else {
                        console.log('Not OK: ' + data.msg);
                    }
                },
                error: function(data) {
                    console.log('error, prislo je do napake', data);
                }
            });
        }

        // // ===========================
        // // GAME SETTINGS
        var crashStatus;
        var distanceCount = 0;
        var lastUpdate = -1;
        var lastSpawn = -1;
        var spawnRateConstant = 3750; // / speed; // TODO: spawn rate has to be proportional with speed (DONE IN ANIMATE()!)


        // // ===========================
        // // ROAD
        var roadTexture = PIXI.Texture.fromImage('https://haluzan.com/biz/app/GoClick/dars/2/web/img/road3.jpg');
        var road = new PIXI.TilingSprite(roadTexture, 490, 1009);
        road.anchor.x = 0;
        road.anchor.y = 0.5;
        road.position.y = 1;
        canvas.bgStage().addChild(road);
        canvas.bgRenderer().render(canvas.bgStage());


        // Stopwatch element on the page
        var $stopwatch;
        var incrementTime = 70;
        window.currentTime = 0;
        $stopwatch = $('.timer');
        var timer = $.timer(updateTimer, incrementTime, false);

        function updateTimer() {
            var timeString = formatTime(window.currentTime);
            $stopwatch.html(timeString);
            window.currentTime += incrementTime;
        }

        // Common functions
        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }

        function formatTime(time) {
            time = time / 10;
            var min = parseInt(time / 6000),
                sec = parseInt(time / 100) - (min * 60),
                hundredths = pad(time - (sec * 100) - (min * 6000), 2);
            return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
        }

        function Start() {

            player.init(canvas.actionStage());

            requestAnimFrame(animate);

            function animate() {

                runAnimation = environment.getGameStatus();

                if (runAnimation) {
                    // timer.play();
                    environmentSpeed = environment.getSpeed();
                    crashStatus = crash.getCrashStatus();

                    if (crashStatus) {
                        // game has ended, stop the timer and start the crash
                        timer.pause();
                        if (!wasAjaxSent) {
                            $('.timer').html(formatTime(window.currentTime));
                            addGame(window.currentTime);
                        }

                        // ALL STUFF CRASH
                        environmentSpeed = 4;
                        vehicles.updateCrash(environmentSpeed);

                        // spawn crash when nr of enemies on canvas reaches 0
                        if (vehicles.getEnemies() == 0) {
                            crash.spawnCrash(canvas.actionStage(), environmentSpeed);
                        }
                        if (vehicles.getEnemies() == 0 && crash.getCrashPosition() >= 180) {
                            if (player.getPosition() >= 250) {
                                player.update(environmentSpeed);
                            } else {
                                // stop the game!
                                road.tilePosition.y += 0;
                                environment.stopGame();
                                updateRank();
                                $('#congrats').reveal({
                                    closeOnBackgroundClick: false
                                });
                            }
                        } else {
                            road.tilePosition.y += environmentSpeed;
                        }

                    } else {
                        timer.play();
                        // ALL STUFF NOT CRASH
                        vehicles.update(environmentSpeed);
                        if (distanceCount >= 13500) {
                            crash.startCrash(canvas.actionStage());
                        }

                        // SPAWN
                        var time = Date.now();
                        spawnRate = spawnRateConstant / environment.getSpeed();
                        if (time > (lastSpawn + spawnRate)) {
                            lastSpawn = time;
                            vehicles.spawn(canvas.actionStage());
                        }


                        freeze = environment.getFreeze();
                        if (freeze) {
                            environment.setSpeed(4);
                        } else {
                            environment.unFreezeWorld();
                            // throttle environment speed
                            if (time > (lastUpdate + 50)) {
                                environment.update();
                                lastUpdate = time;
                            }
                        }

                    road.tilePosition.y += environmentSpeed;

                    }
                    distanceCount += environmentSpeed;
                    window.distance = distanceCount;

                } else {
                    timer.pause();
                }

                // Render
                canvas.bgRenderer().render(canvas.bgStage());
                canvas.actionRenderer().render(canvas.actionStage());
                requestAnimFrame(animate);

            }
        }

        loader.onComplete = Start;
        loader.load()

        // =======================
        // OTHER INTERACTION LOGICS
        $('document').ready(function() {
            $('#start').reveal({
                closeOnBackgroundClick: false
            });
            // $('#congrats').reveal({
            //     closeOnBackgroundClick: false
            // });
            // $('#alert').reveal({
            //     closeOnBackgroundClick: false
            // });

            // URL HANDLING
            $.each($('a:not([target])'), function() {
                $(this).removeAttr("href");
            });

            $('a:not([target])').on('touchstart click', function(event) {
                event.preventDefault();
                var value = $(this).attr('data-url');
                window.location = 'https://haluzan.com/biz/app/GoClick/dars/2/web/index.php/' + value;
            });

            // Click events
            var emailPermissions = false;
            $('.startGame').on('touchstart click', function() {
                ga('send', 'event', 'button', 'click', 'start');
                FB.getLoginStatus(function(response) {
                    if (response.authResponse) {
                        console.log('access token', response.authResponse.accessToken);
                        // $('#accesstoken').html(response.authResponse.accessToken);
                    } else {
                        // do something...maybe show a login prompt
                        console.log('should how login prompt');
                    }
                    if (response.status === 'connected') {
                        // the user is logged in and has authenticated your
                        FB.api('/me/permissions',
                            // access_token: $('#accesstoken').html(),
                            function(response) {
                                $.each(response.data, function(index, val) {
                                    if (val['permission'] === "email") {
                                        if (val['status'] === "granted") {
                                            emailPermissions = true;
                                        }
                                    }
                                });
                                if (emailPermissions) {
                                    console.log('email permissions granted');
                                    $('#start').trigger('reveal:close');
                                    environment.startGame();
                                } else {
                                    console.log('email permissions NOT granted');
                                    FBlogin();
                                    window.location.href = 'https://haluzan.com/biz/app/GoClick/dars/2/web/index.php';
                                }
                            });
                    } else if (response.status === 'not_authorized') {
                        // the user is logged in to Facebook, but has not authenticated your app
                        FBlogin();
                    } else {
                        // the user isn't logged in to Facebook.
                    }
                });
            });

            function FBlogin() {
                FB.login(function(response) {
                    // handle the response
                    if (response.authResponse && response.status === "connected") {
                        console.log('logged in! Time to play.');
                        // window.location.href = 'https://haluzan.com/biz/app/GoClick/dars/2/web/index.php';
                        top.location.href = "https://www.facebook.com/Vozimo.pametno/app_299186130254281";
                        // $('#start').trigger('reveal:close');
                        // environment.startGame();
                    } else {
                        alert('Ne morate igrati, dokler ne sprejmete Facebook dovoljenj.');
                    }
                    // Object {authResponse: null, status: "not_authorized"}
                    // Object {authResponse: Object, status: "connected"}

                    // window.location.href = 'https://haluzan.com/biz/app/GoClick/dars/2/web/index.php';
                }, {
                    scope: 'email'
                });
            }

            $('.continue').on('touchstart click', function() {
                $('#alert').trigger('reveal:close');
                environment.startGame();
            });
            $('.leaveGame').on('touchstart click', function() {
                console.log('LEAVE GAME');
            });

            $('#leaderboard').reveal({
                closeOnBackgroundClick: false
            });

            $('.goNext').on('touchstart click', function(event) {
                // METHOD "FEED" WILL GET DEPRICATED
                FB.ui({
                    method: 'feed',
                    href: 'https://www.facebook.com/Vozimo.pametno/app_299186130254281', // TODO: REDIRECT
                    name: 'Igro REŠI ŽIVLJENJE sem uspešno zaključil/-a v ' + $('.timer:first').html() + '! Me lahko premagaš?',
                    caption: 'Preizkusi se v igri in dokaži, da veš v primeru nesreče na avtocesti ukrepati pravilno!',
                    description: 'Ne pozabi, s pravilno razvrstitvijo vozil lahko povečamo možnost preživetja tudi do 40 odstotkov.',
                    picture: 'https://haluzan.com/biz/app/GoClick/dars/2/web/img/sharePics_1200x630.jpg',
                }, function(response) {
                    console.log('fb.ui share response', response);
                    if (response && response.post_id) {
                        ga('send', 'event', 'social', 'share', 'yes');
                    } else {
                        ga('send', 'event', 'social', 'share', 'no');
                    }
                    window.location = 'https://haluzan.com/biz/app/GoClick/dars/2/web/index.php/leaderboard';
                });
            });

            // Invitebox
            var invitedHaveBeenFetched = false;
            var alreadyInvited = []
            fetchInvited();
            $('.invitebox .img.add').on('touchstart click', function() {
                console.log('invitebox clicked!');
                if (!$(this).hasClass('added')) {
                    if (invitedHaveBeenFetched) {

                        FB.ui({
                            method: 'apprequests',
                            message: 'Preizkusi se v igri »REŠI ŽIVLJENJE« in dokaži, da znaš v primeru nesreče na avtocesti ukrepati pravilno!', // TODO
                            max_recipients: $('.invitebox .img.add').length,
                            exclude_ids: alreadyInvited, // array of fbid's that will be excluded from inviting
                        }, function(response) {
                            if (response.to.length > 0) {
                                ga('send', 'event', 'social', 'invite', 'yes', response.to.length);
                                updateRank();

                                addInvite(response.to);
                                $.each(response.to, function(index, uid) {
                                    /* iterate through array or object */
                                    console.log(uid);
                                    $('.invitebox .img.add').each(function() {
                                        var el = $(this);
                                        el.attr('data-fbid', uid);
                                        alreadyInvited.push(uid);
                                        console.log('currentTime before:', currentTime);
                                        window.currentTime -= 1000;
                                        updateTimer();
                                        console.log('timer -1sec', currentTime);
                                        window.getmedata = alreadyInvited;
                                        if (!el.hasClass('added')) {

                                            el.find('.content').html('');
                                            FB.api('/' + uid, function(response) {
                                                el.parent().find('.text .content').html(response.name);
                                            });
                                            el.css({
                                                'background': 'url(https://graph.facebook.com/' + uid + '/picture)',
                                                'background-size': 'cover',
                                                ' filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="http://graph.facebook.com/' + uid + '/picture", sizingMethod="scale")'
                                            }).removeClass('add');
                                            return false;

                                        }

                                    });

                                });

                            } else {
                                ga('send', 'event', 'social', 'invite', 'no');
                            }


                        });

                    }

                }

            });

            function fetchInvited() {
                $.ajax({
                    url: '//haluzan.com/biz/app/GoClick/dars/2/web/index.php/api/fetchInvited',
                    type: 'POST',
                    dataType: 'json',
                    success: function(data) {
                        if (data.status == "OK") {
                            console.log('OK: ' + data.data);
                            invitedHaveBeenFetched = true;
                            alreadyInvited = data.data;
                            // window.location.href = "https://haluzan.com/biz/app/GoClick/dars/1/web/index.php/successf";
                        } else {
                            console.log('Not OK: ' + data.data);
                        }
                    },
                    error: function(data) {
                        console.log('error, prislo je do napake', data);
                    }
                });
            }

        });

    });
