require("../../framework/date.js");
var Time = require("../../framework/Time.js");
var log = require("log4js").getLogger("task");

exports.Task = Task;

function Task (id,key,days,time,duration,description,disabled) {
  log.trace("Adding Task " + id + ':' + key + " on " + days + " at " + time + " for " + duration + "min - " + description + ((disabled) ? " disabled" : " enabled"));
  this.id = id;
  this.key = key;
  this.days = days;
  this.time = time;
  this.duration = duration;
  this.description = description;
  this.disabled = disabled;
  this.next = new Date();
  var d = 0,dow = this.next.getDay();
  if((this.days.indexOf(Time.DAY_OF_WEEK[dow]) == -1) || this.time.clone().addMinutes(this.duration).isBefore(this.next)) {
    if(this.days.indexOf(Time.DAY_OF_WEEK[dow]) == -1) {
      log.trace("Today (" + Time.DAY_OF_WEEK[dow] + ") isn't in " + this.days + " Checking the rest of the week");
    } else {
      log.trace(this.time.clone().addMinutes(this.duration) + " is before " + this.next.toString("yyyy-MM-dd h:mmt"));
    }
    for(d = 1;d < 7;d++) {
      if(this.days.indexOf(Time.DAY_OF_WEEK[(dow + d) % 7]) != -1) {
        break;
      }
      log.trace(Time.DAY_OF_WEEK[(dow + d) % 7] + " isn't in " + this.days);
    }
  }
  this.next.setHours(this.time.getHours(24));
  this.next.setMinutes(this.time.getMinutes());
  this.next.setSeconds(this.time.getSeconds());
  this.next.setMilliseconds(this.time.getMilliseconds());
  this.next.setDate(this.next.getDate() + d);
  log.debug("Task Added " + this.toString());
} //Task

Task.prototype = {

  getId: function () {
    return this.id;
  }, //getId

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

  isDisabled: function () {
    return this.disabled;
  }, //isDisabled

  toString: function () {
    return "Run key: " + this.key + " for " + this.duration + "min on " + this.next.toString("yyyy-MM-dd h:mmt") + " (every " + this.days + " at " + this.time + ") " + ((this.disabled) ? "disabled" : "enabled"); 
  } //toString

}; //*Task