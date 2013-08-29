exports.Task = Task;

function Task (key,days,time,duration) {
  this.key = key;
  this.days = days;
  this.time = time;
  this.duration = duration;
} //Task

Task.prototype = {
  lastTime: null,

  getKey: function () {
    return this.key;
  }, //getKey

  getDays: function () {
    return this.days;
  }, //getDays

  getTime: function () {
    return this.time;
  }, //getTime

  getLastTime: function () {
    return this.lastTime;
  }, //getLastTime

  setLastTime: function (lastTime) {
    this.lastTime = lastTime;
    return this;
  }, //setLastTime

  getDuration: function () {
    return this.duration;
  }, //getDuration

  toString: function () {
    return "Run key: " + this.key + " for " + this.duration + "min at " + this.time + " on " + this.days;
  } //toString

}; //*Task