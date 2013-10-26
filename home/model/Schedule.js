//var log = require("log4js").getLogger("schedule");

exports.Schedule = Schedule;

var FREQUENCY = 5000;

function Schedule (tasks) {
  this.tasks = tasks || [];
} //Schedule

Schedule.prototype = {
  monitor: null,
  scheduler: null,
  data: {},

  start: function (monitor) {
    this.monitor = monitor;
    if(this.tasks.length > 0) {
      this.scheduler = setInterval((function(context) { return function() { (typeof(context.monitor) == "function") ? context.monitor(context.data) : context.monitor.run.call(context.monitor,context.data);}})(this),FREQUENCY);
      this.scheduler.unref();
    }
    return this;
  }, //start

  stop: function () {
    if(this.scheduler !== null) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
    return this;
  }, //stop

  nextId: function () {
    var id = -1;
    for(var i = 0;i < this.tasks.length;i++) {
      if(this.tasks[i].getId() > id) {
        id = this.tasks[i].getId();
      }
    }
    return Number(id) + 1;
  }, //nextId

  add: function (task) {
    this.tasks.push(task);
    if((this.scheduler === null) && (this.tasks.length > 0)) {
      this.scheduler = setInterval((function(context) { return function() { (typeof(context.monitor) == "function") ? context.monitor(context.data) : context.monitor.run.call(context.monitor,context.data);}})(this),FREQUENCY);
      this.scheduler.unref();
    }
    return this;
  }, //add

  remove: function (task) {
    var ndx = -1;
    if(typeof(task) == "number") {
      for(var i = 0;i < this.tasks.length;i++) {
        if(this.tasks[i].id == task) {
          ndx = i;
          break;
        }
      }
    } else {
      ndx = this.tasks.indexOf(task);
    }
    if(ndx >= 0) {
      this.tasks.splice(ndx,1);
    }
    if(this.tasks.length === 0) {
      this.stop();
    }
    return this;
  }, //remove

  get: function (task) {
    for(var i = 0;i < this.tasks.length;i++) {
      if(this.tasks[i].id == task) {
        return this.tasks[i];
      }
    }
    return null;
  }, //get

  set: function (id,task) {
    for(var i = 0;i < this.tasks.length;i++) {
      if(this.tasks[i].id == id) {
        this.tasks[i] = task;
        return true;
      }
    }
    return false;
  }, //set

  getTasks: function () {
    return this.tasks;
  }, //getTasks

  addData: function (name,value) {
    this.data[name] = value;
  }, //addData

  toString: function () {
    var str = "";
    for(var i = 0;i < this.tasks.length;i++) {
      str += "\n" + (i + 1) + ": " + this.tasks[i].toString();
    }
    return str;
  } //toString

}; //*Schedule