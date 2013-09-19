var fs = require("fs");
var log = require("log4js").getLogger("requestHandlers");
var Relay = require("./model/Relay").Relay;
var router = require("../framework/router");
//var Schedule = require("./model/Schedule").Schedule;
var SprinklerMonitor = require("./model/SprinklerMonitor").SprinklerMonitor;
var Task = require("./model/Task").Task;
var Time = require("../framework/Time").Time;
var util = require("util");

var relay = null;
var schedule = null;

var VALVES = ["nlawn","slawn","blawn","fdrip","nhill","shill"];
var DESCRIPTIONS = ["Front Yard Sprinklers, North","Front Yard Sprinklers, South","Back Yard Sprinklers","Front Yard Drip","Back Yard Drip, North Hill","Back Yard Drip, South Hill"];

exports.init = function (options) {
  if(fs.existsSync(options.schedule)) {
    log.debug("Reading Schedule from disk (" + options.schedule + ')');
    var data = fs.readFileSync(options.schedule,"utf8");
    var json = JSON.parse(data);
    var tasks = [];
    for(var i = 0;i < json.length;i++) {
      tasks[i] = new Task(json[i].key,json[i].days,new Time(json[i].time.millis),json[i].duration,json[i].description);
    }
    var monitor = new SprinklerMonitor(tasks);
    schedule = monitor.getSchedule();
    schedule.addData("valves",VALVES);
    relay = new Relay(options.xbee_port,options.xbee_opts);
    schedule.addData("relay",relay);
    monitor.start();
  } else {
    log.debug(options.schedule + " not found, no initial schedule");
  }
}; //init

function initSchedule () {
  if(schedule === null) {
    schedule = new SprinklerMonitor().start();
    schedule.addData("valves",VALVES);
    if(relay === null) {
      relay = new Relay(options.xbee_port,options.xbee_opts);
    }
    schedule.addData("relay",relay);
  }
  return schedule;
} //initSchedule

exports.handlers = {

  "/valve-control.html": function (res,args,options) {
    if(relay === null) {
      relay = new Relay(options.xbee_port,options.xbee_opts);
    }
    log.debug("Args: " + util.inspect(args));
    log.debug("Valve: " + args.fields.value);
    var checked = args.fields.checked === "true";
    log.debug("Checked: " + checked);
    log.debug("Turning " + args.fields.valve + ((checked) ? " on" : " off"));
    (checked) ? relay.on(VALVES.indexOf(args.fields.valve)) : relay.off(VALVES.indexOf(args.fields.valve));
    res.writeHead(204,"No Content");
    res.end();
  }, //valve-control

  "/valve-status.html": function (res,args,options) {
    if(relay === null) {
      relay = new Relay(options.xbee_port,options.xbee_opts);
    }
    router.serve(options,"valve-status.js","application/json",args,res,{status: relay.positions()});
  }, //valve-status

  "/add-task.html": function (res,args,options) {
    initSchedule();
    log.debug("Args: " + util.inspect(args));
    log.debug("Options: " + util.inspect(options));
    var task = new Task(args.fields.zone,args.fields.days,new Time(args.fields.hour,args.fields.minute,args.fields.meridian),args.fields.duration,DESCRIPTIONS[VALVES.indexOf(args.fields.zone.toLowerCase())]);
    schedule.add(task);
    log.debug("Schedule: " + schedule);
    args.tasks = schedule.getTasks();
    router.serve(options,"schedule.html","text/html",args,res);
    fs.writeFile(options.schedule,JSON.stringify(args.tasks),{encoding: 'utf8'},function (err) {
      if(!err) {
        log.info("Schedule Saved");
      } else {
        log.error("Error saving schedule: " + err);
        throw err;
      }
    });
  }, //add-task

  "/schedule.html": function (res,args,options) {
    initSchedule();
    args.tasks = schedule.getTasks();
    router.serve(options,"schedule.html","text/html",args,res);
  } //schedule

}; //handlers