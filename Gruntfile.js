module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'http-server': {
      'dev': {
        // the server root directory
        root: '.',
        // the server port
        port: 5000,
        // the host ip address
        host: '127.0.0.1',
        showDir: true,
        autoIndex: true,
        // server default file extension
        ext: 'html',
        // run in parallel with other tasks
        runInBackground: true,
        // tell grunt task to open the browser
        openBrowser : true,
      }
    },
    less: {
      development: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'assets/css/styles.css': 'less/styles.less'
        }
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'app/*.js', 'app/**/*.js',
        '!**/bower_components/**', '!**/node_modules/**'
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
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('default', ['jshint', 'less']);
  grunt.registerTask('dev', ['jshint', 'less', 'http-server', 'watch']);
};
