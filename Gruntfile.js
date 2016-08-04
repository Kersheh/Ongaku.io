module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['jshint', 'less', 'watch']);
};
