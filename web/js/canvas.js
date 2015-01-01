define(['pixi'], function(PIXI) {

    // bg
    var bgStage = new PIXI.Stage();
    var bgCanvas = document.getElementById('backgroundCanvas');
    var bgRenderer = PIXI.autoDetectRenderer(490, 500, bgCanvas);

    // action
    var actionStage = new PIXI.Stage();
    var actionCanvas = document.getElementById('actionCanvas');
    var actionRenderer = PIXI.autoDetectRenderer(220, 500, actionCanvas, true);

    // test
    // var testStage = new PIXI.Stage();
    // var testCanvas = document.getElementById('testCanvas');
    // var testRenderer = PIXI.autoDetectRenderer(500, 500, testCanvas, true);

    return {
        actionStage: function() {
            return actionStage
        },
        bgStage: function() {
            return bgStage
        },
        actionRenderer: function() {
            return actionRenderer
        },
        bgRenderer: function() {
            return bgRenderer
        },

        // test
        // testRenderer: function() {
        //     return testRenderer
        // },
        // testStage: function() {
        //     return testStage
        // },
    }

});
