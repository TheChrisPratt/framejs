var fs = require("fs");
var server = require("../framework/server");
var requestHandlers = require("./requestHandlers");

var options = {
  content: "demo/content",
  port: 8888,
  secure: false
/*
  port: 8443,
  secure: true,
  key: fs.readFileSync("security/selfsigned.key"),
  cert: fs.readFileSync("security/selfsigned.cert")
*/
};

server.initLogging(options);
requestHandlers.init(options);
server.start(options,requestHandlers.handlers);
