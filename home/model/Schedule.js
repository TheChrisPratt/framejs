exports.Schedule = Schedule;

var FREQUENCY = 5000;

function Schedule () {
} //Schedule

Schedule.prototype = {
  tasks: [],
  monitor: null,
  scheduler: null,
  data: {},

  start: function (monitor) {
    this.monitor = monitor;
    if(this.tasks.length > 0) {
      this.scheduler = setInterval((typeof(this.monitor) == "function") ? this.monitor : this.monitor.run,FREQUENCY,this.data);
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

  add: function (task) {
    this.tasks.push(task);
    if((this.scheduler === null) && (this.tasks.length > 0)) {
      this.scheduler = setInterval((typeof(this.monitor) == "function") ? this.monitor : this.monitor.run,FREQUENCY,this.data);
      this.scheduler.unref();
    }
    return this;
  }, //add

  remove: function (task) {
    var ndx = -1;
    if(typeof(task) == 'number') {
      ndx = task;
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

  getTasks: function () {
    return this.tasks;
  }, //getTasks

  addData: function (name,value) {
    data[name] = value;
  }, //addData

  toString: function () {
    var str = "";
    for(var i = 0;i < this.tasks.length;i++) {
      str += "\n" + (i + 1) + ": " + this.tasks[i].toString();
    }
    return str;
  } //toString

}; //*Schedule