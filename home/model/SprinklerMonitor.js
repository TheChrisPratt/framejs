require("../../framework/date.js");
var Schedule = require("./Schedule").Schedule;

exports.SprinklerMonitor = SprinklerMonitor;

function SprinklerMonitor () {
} //SprinklerMonitor

SprinklerMonitor.prototype = {
  schedule: null,

  start: function () {
    this.schedule = new Schedule().start(this);
    return this.schedule;
  }, //start

  run: function (data) {
    var now = new Date();
    var tasks = this.schedule.getTasks();
    for(var i = 0;i < tasks.length;i++) {
      if(now.isAfter(tasks[i].getNext())) {
        console.log('[' + now.toString("yyyy-MM-dd h:mm:sst") + "] Firing Task: " + tasks[i]);
        //TODO@@@: Do Something Useful
        tasks[i].update();
      } else {
        console.log('[' + now.toString("yyyy-MM-dd h:mm:sst") + "] Not Firing: " + tasks[i]);
      }
    }
  } //run

}; //*SprinklerMonitor