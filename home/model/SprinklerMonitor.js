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
  }, //start

  run: function (data) {
    var now = new Date();
    var tasks = this.schedule.getTasks();
    for(var i = 0;i < tasks.length;i++) {
      if(now.isAfter(tasks[i].getNext())) {
        if(!this.inTask) {
          var valve = data.valves.indexOf(tasks[i].key.toLowerCase());
          log.debug("Turning valve " + valve + " on for " + tasks[i].duration + "min");
          data.relay.on(valve);
          this.inTask = true;
          setTimeout(function(context) { 
            log.debug("Turning valve " + valve + " off"); 
            data.relay.off(valve); 
            context.inTask = false;
          },tasks[i].duration * 60000,this);
          tasks[i].update();
        }
      }
    }
  } //run

}; //*SprinklerMonitor