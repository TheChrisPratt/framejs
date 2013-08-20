require("./strutils");
var fs = require("fs");
var http = require("http");
var https = require("https");
var querystring = require("querystring");
var route = require("./router").route;
var url = require("url");

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
    console.log(req.method + " Request for " + path + " received.");
    if(req.method.toUpperCase() === "POST") {
      var contentType = req.headers["content-type"];
      console.log("Content-Type: " + contentType);
      if(contentType.startsWith("multipart/form-data")) {
        console.log("Parsing Multipart Form Data...");
        var formidable = require("formidable");
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,files) {
          if(!err) {
            var args = {fields: fields,files: files};
            route(options,handle,path,res,args);
          } else {
            console.log(err);
          }
        });
      } else if(contentType.startsWith("application/json")) {
        console.log("Parsing JSON Data...");
        getPostBody(function (body) {
          route(options,handle,path,res,{fields: JSON.parse(body)});
        });
      } else {
        console.log("Parsing Form Data...");
        getPostBody(function (body) {
          route(options,handle,path,res,{fields: querystring.parse(url.parse(req.url,false).query + '&' + body)});
        });
      }
    } else if(req.method.toUpperCase() === "GET") {
      console.log("Parsing Query String...");
      var args = {fields: url.parse(req.url,true).query};
      route(options,handle,path,res,args);
    } else {
      console.log("Unsupported Method: " + req.method);
      res.writeHead(500,{"Content-Type": "text/plain"});
      res.write("Unsupported Method: " + req.method);
      res.end();
    }
  } //onRequest

  if(!options) {
    options = {};
  }

    // Process the Command Line Arguments to set/override supplied options
  process.argv.forEach(function (val,ndx,ary) {
    if(val.startsWith('-')) {
      switch(val) {
        case "-port":
          if(ary.length > ndx + 1) {
            options.port = parseInt(ary[ndx + 1],10);
          } else {
            console.log("Port Number not specified");
          }
          break;
        case "-secure":
          options.secure = true;
          break;
        case "-key":
          if(ary.length > ndx + 1) {
            options.key = fs.readFileSync(ary[ndx + 1]);
          } else {
            console.log("Missing Key Filename");
          }
          break;
        case "-cert":
          if(ary.length > ndx + 1) {
            options.cert = fs.readFileSync(ary[ndx + 1]);
          } else {
            console.log("Missing Certificate Filename");
          }
          break;
        case "-mode":
          if(ary.length > ndx + 1) {
            options.devMode = ary[ndx + 1].toLowerCase().startsWith("dev");
          } else {
            console.log("Missing Mode (dev | prod)");
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
      console.log("Secure Server is listening at https://localhost:" + options.port + '/');
    } else {
      http.createServer(onRequest).listen(options.port);
      console.log("Server is listening at http://localhost:" + options.port + '/');
    }
  } else {
    console.log("Secure Servers require Security Key and Certificate to be supplied");
  }

}; //start
