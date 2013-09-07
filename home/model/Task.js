require("../../framework/date.js");
exports.Task = Task;

var DAY_OF_WEEK = ["sun","mon","tue","wed","thu","fri","sat"];

function Task (key,days,time,duration) {
  this.key = key;
  this.days = days;
  this.time = time;
  this.duration = duration;
  this.next = new Date();
  var d,dow = this.next.getDay();
  for(d = 0;d < 7;d++) {
    if(this.days.indexOf(DAY_OF_WEEK[(dow + d) % 7]) != -1) {
      break;
    }
  }
  this.next.setHours(this.time.getHours());
  this.next.setMinutes(this.time.getMinutes());
  this.next.setSeconds(this.time.getSeconds());
  this.next.setMilliseconds(this.time.getMilliseconds());
  this.next.setDate(this.next.getDate() + d);
} //Task

Task.prototype = {

  getKey: function () {
    return this.key;
  }, //getKey

  getDays: function () {
    return this.days;
  }, //getDays

  getTime: function () {
    return this.time;
  }, //getTime

  getNext: function () {
    return this.next;
  }, //getNext

  update: function () {
    var d,dow = this.next.getDay() + 1;
    for(d = 0;d < 7;d++) {
      if(this.days.indexOf(DAY_OF_WEEK[(dow + d) % 7]) != -1) {
        break;
      }
    }
    this.next.setDate(this.next.getDate() + d);
    console.log("Task Updated to " + this.next.toString("yyyy-MM-dd h:mmt"));
  }, //update

  setLastTime: function (lastTime) {
    this.lastTime = lastTime;
    return this;
  }, //setLastTime

  getDuration: function () {
    return this.duration;
  }, //getDuration

  toString: function () {
//    return "Run key: " + this.key + " for " + this.duration + "min at " + this.time + " on " + this.days;
    return "Run key: " + this.key + " for " + this.duration + "min on " + this.next.toString("yyyy-MM-dd h:mmt") + " (every " + this.days + " at " + this.time + ')'; 
  } //toString

}; //*Task