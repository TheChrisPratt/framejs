require("./strutils");
var fs = require("fs");
var http = require("http");
var https = require("https");
var log4js = require("log4js");
var querystring = require("querystring");
var router = require("./router");
var url = require("url");
var util = require("util");

var log = null;

exports.initLogging = function (options) {
  options = options || {};
    // Set up logging
  var logconfig = options.logconfig || "log4js.json";
  if(typeof(logconfig) == "string") {
    if(fs.existsSync(logconfig)) {
      log4js.configure(JSON.parse(fs.readFileSync(logconfig,"utf8")));
    } else {
      console.log("Unable to locate " + logconfig + ", using defaults")
    }
  } else if(typeof(logconfig) == "object") {
    log4js.configure(logconfig);
  } else {
    console.log("Unable to configure logging using a " + typeof(logconfig) + ", using defaults");
  }
  log = log4js.getLogger("server");
}; //initLogging

exports.start = function (options,handle) {

  function onRequest (req,res) {
    
    function getPostBody (cb) {
      var body = "";
      req.setEncoding("utf8");
      req.addListener("data",function (data) {
        body += data;
      });
      req.addListener("end",function () {
        cb(body);
      });
    } //getPostBody
    
    var path = url.parse(req.url).pathname;
    log.info(req.method + " Request for " + path + " received.");
    if(req.method.toUpperCase() === "POST") {
      var contentType = req.headers["content-type"];
      log.debug("Content-Type: " + contentType);
      if(contentType.startsWith("multipart/form-data")) {
        log.debug("Parsing Multi-part Form Data...");
        var formidable = require("formidable");
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,files) {
          if(!err) {
            var args = {fields: fields,files: files};
            router.route(options,handle,path,res,args);
          } else {
            log.error(err);
          }
        });
      } else if(contentType.startsWith("application/json")) {
        log.debug("Parsing JSON Data...");
        getPostBody(function (body) {
          router.route(options,handle,path,res,{fields: JSON.parse(body)});
        });
      } else {
        log.debug("Parsing Form Data...");
        getPostBody(function (body) {
          router.route(options,handle,path,res,{fields: querystring.parse(url.parse(req.url,false).query + '&' + body)});
        });
      }
    } else if(req.method.toUpperCase() === "GET") {
      log.debug("Parsing Query String...");
      var args = {fields: url.parse(req.url,true).query};
      router.route(options,handle,path,res,args);
    } else {
      log.warn("Unsupported Method: " + req.method);
      res.writeHead(500,{"Content-Type": "text/plain"});
      res.write("Unsupported Method: " + req.method);
      res.end();
    }
  } //onRequest

  options = options || {};

  if(log === null) {
    initLogging(options);
  }

    // Process the Command Line Arguments to set / override supplied options
  process.argv.forEach(function (val,ndx,ary) {
    if(val.startsWith('-')) {
      switch(val) {
        case "-port":
          if(ary.length > ndx + 1) {
            options.port = parseInt(ary[ndx + 1],10);
          } else {
            log.error("Port Number not specified");
          }
          break;
        case "-secure":
          options.secure = true;
          break;
        case "-key":
          if(ary.length > ndx + 1) {
            options.key = fs.readFileSync(ary[ndx + 1]);
          } else {
            log.warn("Missing Key Filename");
          }
          break;
        case "-cert":
          if(ary.length > ndx + 1) {
            options.cert = fs.readFileSync(ary[ndx + 1]);
          } else {
            log.error("Missing Certificate Filename");
          }
          break;
        case "-mode":
          if(ary.length > ndx + 1) {
            options.devMode = ary[ndx + 1].toLowerCase().startsWith("dev");
          } else {
            log.warn("Missing Mode (dev | prod)");
          }
          break;
      }
    }
  });

  if(!options.devMode) {
    options.devMode = (process.env.NODE_ENV) ? process.env.NODE_ENV.toLowerCase().startsWith("dev") : false;
  }

  if(!options.secure || ((typeof(options.key) !== "undefined") && (typeof(options.cert) !== "undefined"))) {
    if(options.secure) {
      https.createServer(options,onRequest).listen(options.port);
      log.info("Secure Server is listening at https://localhost:" + options.port + '/');
    } else {
      http.createServer(onRequest).listen(options.port);
      log.info("Server is listening at http://localhost:" + options.port + '/');
    }
  } else {
    log.error("Secure Servers require Security Key and Certificate to be supplied");
  }

}; //start
