var Relay = require("./Relay").Relay;
var router = require("../framework/router");
var util = require("util");

var relay = null;

var valves = ["nlawn","slawn","blawn","fdrip","nhill","shill"];

exports.handlers = {

  "/valve-control.html": function (res,args,options) {
    if(relay == null) {
      relay = new Relay(options.xbee_port,options.xbee_opts);
    }
    if(options.devMode) {
      console.log("Args: " + util.inspect(args));
      console.log("Valve: " + args.fields.valve);
    }
    var checked = args.fields.checked === "true";
    if(options.devMode) {
      console.log("Checked: " + checked);
      console.log("Turning " + args.fields.valve + ((checked) ? " on" : " off"));
    }
    (checked) ? relay.on(valves.indexOf(args.fields.valve)) : relay.off(valves.indexOf(args.fields.valve));
    res.writeHead(204,"No Content");
    res.end();
  }, //valve-control

  "/valve-status.html": function (res,args,options) {
    if(relay == null) {
      relay = new Relay(options.xbee_port,options.xbee_opts);
    }
    router.serve(options,"valve-status.js","application/json",args,res,{status: relay.positions()});
  }, //valve-status

  "/schedule.html": function (res,args,options) {
    router.serve(options,"schedule.html","text/html",args,res);
  } //schedule

}; //handlers