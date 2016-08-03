var method = Dj.prototype;

function Dj() {
  this._time = 0;
}

method.getTime = function() {
  return this._time;
};

module.exports = Dj;
