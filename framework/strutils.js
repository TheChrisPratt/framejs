if(typeof(String.prototype.startsWith) !== "function") {
  String.prototype.startsWith = function (str) {
    return this.slice(0,str.length) === str;
  };
}

if(typeof(String.prototype.endsWith) !== "function") {
  String.prototype.endsWith = function (str) {
    return (this.length >= str.length) && (this.slice(this.length - str.length) === str);
  };
}

/**
 * Convert a number to a string with a minimum number of digits, prefixing the
 * number with 0's as needed.
 *
 * @param num The number to be converted
 * @param min The minimum number of digits
 * @returns The prefixed numeric string
 */
exports.toPaddedString = function (num,min) {
  return ("000000" + num).slice(-1 * (min || 2));
}; //toPaddedString

exports.toDateString = function (date) {
  if(arguments.length == 0) {
    date = new Date();
  }
  return 
}