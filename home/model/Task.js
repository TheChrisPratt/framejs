require("../../framework/date.js");
var Time = require("../../framework/Time.js");
var log = require("log4js").getLogger("task");

exports.Task = Task;

function Task (key,days,time,duration,description) {
  log.trace("Adding Task " + key + " on " + days + " at " + time + " for " + duration + "min - " + description);
  this.key = key;
  this.days = days;
  this.time = time;
  this.duration = duration;
  this.description = description;
  this.next = new Date();
  var d,dow = this.next.getDay();
  for(d = 0;d < 7;d++) {
    log.trace("Checking if " + Time.DAY_OF_WEEK[(dow + d) % 7] + " is in " + this.days);
    log.trace("and if " + this.time + " is after " + this.next.toString("yyyy-MM-dd h:mmt"));
    log.trace("but before " + this.next.clone().addMinutes(this.duration).toString("yyyy-MM-dd h:mmt"));
    if((this.days.indexOf(Time.DAY_OF_WEEK[(dow + d) % 7]) != -1) && this.time.isAfter(this.next) && this.time.isBefore(this.next.clone().addMinutes(this.duration))) {
      break;
    }
  }
  this.next.setHours(this.time.getHours(24));
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
    var d,dow = this.next.getDay();
    for(d = 1;d < 8;d++) {
      if(this.days.indexOf(Time.DAY_OF_WEEK[(dow + d) % 7]) != -1) {
        break;
      }
    }
    this.next.setDate(this.next.getDate() + d);
    log.debug("Task Updated to " + this.next.toString("yyyy-MM-dd h:mmt"));
  }, //update

  setLastTime: function (lastTime) {
    this.lastTime = lastTime;
    return this;
  }, //setLastTime

  getDuration: function () {
    return this.duration;
  }, //getDuration

  getDescription: function () {
    return this.description;
  }, //getDescription

  toString: function () {
    return "Run key: " + this.key + " for " + this.duration + "min on " + this.next.toString("yyyy-MM-dd h:mmt") + " (every " + this.days + " at " + this.time + ')'; 
  } //toString

}; //*Task