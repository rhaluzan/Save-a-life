module.exports = function(grunt) {

    //Initializing the configuration object
    grunt.initConfig({

        // Task configuration
        concat: {
            //...
        },

        uglify: {
            //...
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: '.',
                    optimize: 'none',
                    mainConfigFile: 'js/main.js',
                    name: 'js/base',
                    include: ['node_modules/grunt-contrib-requirejs/node_modules/requirejs/require'],
                    out: 'compressed/all.js',
                }
            }
        },

    });


    // Plugin loading
    // grunt.loadNpmTasks('grunt-contrib-sass');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');


    // Task definition


};