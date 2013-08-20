var fs = require("fs.extra");
var router = require("../framework/router");

exports.handlers = {

  "/upload": function (res,args,options) {
    console.log("Request handler 'upload' called.");
    var dest = options.content +"/images/" + args.files.upload.name;
    fs.move(args.files.upload.path,dest,function (err) {
      if(err) {
        fs.unlink(dest);
        fs.move(args.files.upload.path,dest);
      }
    });
    router.serve(options,"upload.html","text/html",args,res,{message: "Node.js Demo"});
  }, //upload

  "/show": function (res,args,options) {
    console.log("Request handler 'show' called.");
    router.serve(options,"images/" + args.fields.file,"image/png",args,res);
  } //show

}; //handlers