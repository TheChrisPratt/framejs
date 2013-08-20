var fs = require("fs");
var server = require("../framework/server");
var requestHandlers = require("./requestHandlers");

var options = {
  devMode: true,
  content: "home/content",
  port: 8888,
  secure: false,
/*
  port: 8443,
  secure: true,
  key: fs.readFileSync("security/selfsigned.key"),
  cert: fs.readFileSync("security/selfsigned.cert"),
*/
//  xbee_port: "/dev/ttyAMA0",
  xbee_port: "COM6",
  xbee_opts: {
    baudrate: 9600
  }
};

server.start(options,requestHandlers.handlers);
