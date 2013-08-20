require("./strutils");
var fs = require("fs");
var mu = require("mu2");

var mimeTypes = [];
mimeTypes[".js"]   = "application/javascript";
mimeTypes[".pdf"]  = "application/pdf";
mimeTypes[".jpg"]  = "image/jpeg";
mimeTypes[".jpeg"] = "image/jpeg";
mimeTypes[".gif"]  = "image/gif";
mimeTypes[".png"]  = "image/png";
mimeTypes[".svg"]  = "image/svg+xml";
mimeTypes[".tiff"] = "image/tiff";
mimeTypes[".ico"]  = "image/vnd.microsoft.icon";
mimeTypes[".css"]  = "text/css";
mimeTypes[".html"] = "text/html";
mimeTypes[".txt"]  = "text/plain";
mimeTypes[".xml"]  = "text/xml";

/**
 * Route the HTTP Request.  First check for a registered Request Handler. If 
 *  not, try to serve the request as an HTML file.
 *
 * @param options The Application options
 * @param handle The Request Handler Object
 * @param path The Request Path
 * @param res The HTTP Response
 * @param args The Request Arguments
 */
exports.route = function (options,handle,path,res,args) {
  var fn;
  if(path === "/favicon.ico") {
    fn = "images" + path;
    fs.exists(options.content + '/' + fn,function (exists) {
      if(exists) {
        exports.serve(options,fn,"image/vnd.microsoft.icon",null,res);
      } else {
        res.writeHead(404,fn + " not found");
        res.end();
      }
    });
  } else if(typeof handle[path] === 'function') {
    console.log("Routing: " + path);
    handle[path](res,args,options);
  } else {
    fn = ((path === '/') ? "index" : path.slice(1)) + ".html";
    fs.exists(options.content + '/' + fn,function (exists) {
      if(exists) {
        exports.serve(options,fn,"text/html",args,res);
      } else if(options.devMode && (path === "/exit")) {
        exports.serve(options,process.cwd() + "/framework/content/exit.html","text/html",null,res);
        setTimeout(function () {
          console.log("Exiting, by user request");
          process.exit(0);
        },500);
      } else {
        fs.exists(options.content + '/' + path,function (exists) {
          if(exists) {
            var type = mimeTypes[path.slice(path.lastIndexOf('.')).toLowerCase()];
            if(!type) {
              type = "application/octet-stream";
            }
            exports.serve(options,path.slice(1),type,args,res);
          } else {
            console.log("Not Found: " + path + " for " + path);
            res.writeHead(404,path + " not found",{"Content-Type": "text/plain"});
            res.end("404 '" + path + "' Not Found");
          }
        });
      }
    });
  }
}; //route

/**
 * Serve the named file, if it exists otherwise return a 404
 *
 * @param options The Application Options
 * @param fn The File Name to serve
 * @param type The MIME Type of the file
 * @param args The Replacement Arguments
 * @param res The HTTP Response
 * @param data Optional Data passed to file renderer
 */
exports.serve = function (options,fn,type,args,res,data) {
  if((fn.charAt(0) !== '/') && (fn.charAt(1) !== ':')) {
    fn = options.content + '/' + fn;
  }
  if(type.startsWith("text/") || (type === "application/json") || (type === "application/javascript")) {
    console.log("Processing: " + fn);
    if(options && options.devMode) {
      mu.clearCache(options);
    }
    var context = data || {};
    if(args) {
      context.args = args;
      context.params = args.fields;
      context.files = args.files;
    }
    if(options) {
      context.opts = options;
    }
    mu.compileAndRender(fn,context).pipe(res);
  } else {
    fs.readFile(fn,function(err,file) {
      if(!err) {
        if(options.devMode) {
          console.log("Serving: " + fn + " [" + type + ']');
        }
        res.writeHead(200,"OK",{"Content-Type": type});
        res.end(file);
      } else {
        console.log("Error: " + err);
        res.writeHead(500,"Server Error",{"Content-Type": "text/plain"});
        res.end("500 Internal Server Error: " + err);
      }
    });
  }
}; //serve