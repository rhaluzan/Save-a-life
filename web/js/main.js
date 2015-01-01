require.config({
    paths: {
        'jquery': 'bower_components/jQuery/dist/jquery',
        'jquery.timer': 'js/lib/jquery.timer',
        'pixi': 'js/lib/pixi-dev',
        'moment': 'js/lib/moment',
        'player': 'js/player',
        'vehicles': 'js/vehicles',
        'loader': 'js/loader',
        'environment': 'js/environment',
        'canvas': 'js/canvas',
        'crash': 'js/crash',
        'jquery.foundation': 'js/lib/foundation.min'

    },

    shim: {
        'jquery': {
            deps: [],
            exports: '$'
        },
        'jquery.timer': {
            deps: ['jquery']
        },
        'jquery.foundation': {
            deps: ['jquery']
        },
        'pixi': {
            exports: 'PIXI'
        },
        'moment': {
            exports: 'moment'
        },

        enforceDefine: true,
    },
});
