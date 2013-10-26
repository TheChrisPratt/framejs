require("../../framework/date.js");
var Schedule = require("./Schedule").Schedule;
var log = require("log4js").getLogger("sprinklerMonitor");

exports.SprinklerMonitor = SprinklerMonitor;

function SprinklerMonitor (tasks) {
  this.schedule = new Schedule(tasks);
} //SprinklerMonitor

SprinklerMonitor.prototype = {
  schedule: null,
  inTask: false,

  getSchedule: function (tasks) {
    return this.schedule;
  }, //getSchedule

  start: function () {
    this.schedule.start(this);
    return this.schedule;
  }, //start

  run: function (data) {
    var task;
    var now = new Date();
    var tasks = this.schedule.getTasks();
    for(var i = 0;i < tasks.length;i++) {
      task = tasks[i];
      if(!task.isDisabled() && now.isAfter(task.getNext())) {
        if(!this.inTask) {
          var valve = data.valves.indexOf(task.key.toLowerCase());
          log.debug("Task " + task.id + ": Turning valve " + valve + " on for " + task.duration + "min");
          data.relay.on(valve);
          this.inTask = true;
          setTimeout(function(context) { 
            log.debug("Turning valve " + valve + " off"); 
            data.relay.off(valve); 
            context.inTask = false;
          },task.duration * 60000,this);
          task.update();
        }
      }
    }
  } //run

}; //*SprinklerMonitor