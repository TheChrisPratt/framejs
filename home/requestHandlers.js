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
      tasks[i] = new Task(json[i].id,json[i].key,json[i].days,new Time(json[i].time.millis),json[i].duration,json[i].description,json[i].disabled);
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

function initSchedule (options) {
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
    initSchedule(options);
    log.trace("Args: " + util.inspect(args));
    log.trace("Options: " + util.inspect(options));
    if(args.fields.id && (args.fields.id >= 0)) {
      log.debug("Updating Task " + args.fields.id);
      schedule.set(args.fields.id,new Task(args.fields.id,args.fields.zone,args.fields.days,new Time(args.fields.hour,args.fields.minute,args.fields.meridian),args.fields.duration,DESCRIPTIONS[VALVES.indexOf(args.fields.zone.toLowerCase())],args.fields.disabled));
    } else {
      log.debug("Adding Task");
      schedule.add(new Task(schedule.nextId(),args.fields.zone,args.fields.days,new Time(args.fields.hour,args.fields.minute,args.fields.meridian),args.fields.duration,DESCRIPTIONS[VALVES.indexOf(args.fields.zone.toLowerCase())],args.fields.disabled));
    }
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

  "/del-task.html": function (res,args,options) {
    initSchedule(options);
    log.trace("Args: " + util.inspect(args));
    log.trace("Options: " + util.inspect(options));
    schedule.remove(Number(args.fields.task));
    log.debug("Schedule (removed " + args.fields.task + "): " + schedule);
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
  }, //del-task

  "/get-task.html": function (res,args,options) {
    initSchedule(options);
    log.trace("Args: " + util.inspect(args));
    log.trace("Options: " + util.inspect(options));
    var task = schedule.get(Number(args.fields.task));
    log.debug("Returning Task: " + task + " [application/json]");
    res.writeHead(200,"OK",{"Content-Type": "application/json"});
    res.end(JSON.stringify(task));
  }, //get-task

  "/schedule.html": function (res,args,options) {
    initSchedule(options);
    args.tasks = schedule.getTasks();
    router.serve(options,"schedule.html","text/html",args,res);
  } //schedule

}; //handlers