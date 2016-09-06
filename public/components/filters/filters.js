angular.module('ongaku.filters', [])
// convert seconds to hh:mm:ss string
.filter('formatSeconds', function($rootScope) {
  return function(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds - (h * 3600)) / 60);
    var s = seconds - (h * 3600) - (m * 60);
    s = Math.floor(Math.round(s * 100) / 100);
    var result = '';
    if(h > 0) {
      result = (h < 10 ? '0' + h + ':' : h + ':');
    }
    result += (m < 10 ? '0' + m : m);
    result += ':' + (s  < 10 ? '0' + s : s);
    return result;
  };
});
