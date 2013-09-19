var log = require("log4js").getLogger("time");
var strutils = require("./strutils.js");

exports.Time = Time;

exports.DAY_OF_WEEK = ["sun","mon","tue","wed","thu","fri","sat"];

var MS = 1;             // Milliseconds = 1
var S = (1000 * MS);    // Seconds      = 1000
var M = (60 * S);       // Minutes      = 60000
var H = (60 * M);       // Hours        = 3600000
var AM = 0;             // Post 12am    = 0
var PM = (12 * H);      // Post 12pm    = 43200000

exports = {
  MS: MS,
  S: S,
  M: M,
  H: H,
  AM: AM,
  PM: PM
};

/**
 * Constructor - If no parameters are supplied, uses the current local time.
 * If a single date parameter is supplied, it's time fields are used.
 * If a single number parameter is supplied, it's assumed to be milliseconds after midnight 
 * Otherwise...
 *
 * @param h hours [1..24] or a Date Object
 * @param m minutes [0..59]
 * @param s seconds [0..59]
 * @param ms milliseconds [0..999]
 * @param a Either "am" | "pm"
 */
function Time (h,m,s,ms,a) {
  var hour,min,sec,mils,meridian;
  if((arguments.length == 0) || (h instanceof Date)) {
    var date = (arguments.length == 0) ? new Date() : h;
    hour = date.getHours();
    min = date.getMinutes();
    sec = date.getSeconds();
    mils = date.getMilliseconds();
  } else if((arguments.length == 1) && (typeof(h) === "number")) {
    this.millis = h;
    return;
  } else {
    hour = h || 1;
    min = m || 0;
    if(typeof(s) == "number") {
      sec = s;
      if(typeof(ms) == "number") {
        mils = ms;
        meridian = a || 'a';
      } else {
        mils = 0;
        meridian = ms || 'a';
      }
    } else {
      sec = 0;
      mils = 0;
      meridian = s || 'a';
    }
  }
  log.debug("Setting Time: Meridian=" + meridian + " (" + (meridian && (meridian.toLowerCase().charAt(0) === 'p')) + ')');
  this.millis = (H * hour) + (M * min) + (S * sec) + (MS * mils) + ((meridian && (meridian.toLowerCase().charAt(0) === 'p')) ? PM : AM);
} //Time

Time.prototype = {

  /**
   * Get Hour, default 0..11
   *
   * hpd = 12: 0..11
   * hpd = 24: 0..23
   *
   * @param hpd Hours Per Day (12 | 24) [Default 12]
   */
  getHours: function (hpd) {
    return (((this.millis / H) | 0) % (hpd || 12));
  }, //getHours

  getMinutes: function () {
    return ((this.millis % H) / M) | 0;
  }, //getMinutes

  getSeconds: function () {
    return ((this.millis % M) / S) | 0;
  }, //getSeconds

  getMilliseconds: function () {
    return (this.millis % S) | 0;
  }, //getMilliseconds

  isAM: function () { 
    return this.millis < PM;
  }, //isAM

  isPM: function () {
    return this.millis >= PM;
  }, //isPM

  getTime: function () {
    return this.millis;
  }, //getTime

  isAfter: function (time) {
    if(time instanceof Time) {
      return ((this.millis - time.getTime()) > 0);
    } else if(time instanceof Date) {
      return ((this.millis - (time.getTime() - time.clearTime().getTime())) > 0);
    }
    return false;
  }, //isAfter

  isBefore: function (time) {
    if(time instanceof Time) {
      return ((time.getTime() - this.millis) > 0);
    } else if(time instanceof Date) {
      return (((time.getTime() - time.clearTime().getTime()) - this.millis) > 0);
    }
  }, //isBefore

  /**
   * TODO@@@: Add a Java SimpleDateFormat string that defaults to 'h:mma'
   */
  toString: function () {
    return this.getHours() + ':' + strutils.toPaddedString(this.getMinutes(),2) + (this.isAM() ? 'a' : 'p');
  } //toString

}; //*Time