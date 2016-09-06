module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concurrent: {
      tasks: ['watch', 'run:server'],
      options: {
        logConcurrentOutput: true
      }
    },
    run: {
      server: {
        cmd: 'node',
        args: ['server.js']
      }
    },
    less: {
      development: {
        options: {
          paths: ['public/assets/css']
        },
        files: {
          'public/assets/css/styles.css': 'less/styles.less'
        }
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'public/*.js', 'public/**/*.js',
        '!**/bower_components/**', '!**/node_modules/**',
        '!public/assets/js/jsmediatags.min.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      files: ['less/*'],
      tasks: ['less']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', ['jshint', 'less', 'concurrent:tasks']);
};
