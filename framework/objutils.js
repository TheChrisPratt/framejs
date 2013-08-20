exports.concat = function () {
  var arg;
  var ret = {};
  for(var i = 0;i < arguments.length;i++) {
    arg = arguments[i];
    if(typeof arg === "object") {
      for(var prop in arg) {
        if(arg.hasOwnProperty(prop)) {
          ret[prop] = arg[prop];
        }
      }
    }
  }
  return ret;
}; //concat