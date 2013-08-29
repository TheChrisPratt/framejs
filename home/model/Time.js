exports.Time = Time;

var MS = 1;             // Milliseconds = 1
var S = (1000 * MS);    // Seconds      = 1000
var M = (60 * S);       // Minutes      = 60000
var H = (60 * M);       // Hours        = 3600000
var AM = 0;             // Post 12am    = 0
var PM = (12 * H);      // Post 12pm    = 43200000

function Time (h,m,s,ms,a) {
  var hour,min,sec,mils,meridian;
  if((arguments.length == 0) || (h instanceof Date)) {
    var date = (arguments.length == 0) ? new Date() : h;
    hour = date.getHours();
    min = date.getMinutes();
    sec = date.getSeconds();
    mils = date.getMilliseconds();
  } else {
    hour = (h || 1) - 1;
    min = m || 0;
    if(typeof(s) == "number") {
      sec = s;
      if(typeof(ms) == "number") {
        mils = ms;
        meridian = a || "am";
      } else {
        mils = 0;
        meridian = ms || "am";
      }
    } else {
      sec = 0;
      mils = 0;
      meridian = s || "am";
    }
  }
  this.millis = (H * hour) + (M * min) + (S * sec) + (MS * mils) + ((meridian && (meridian.toLowerCase() === "am")) ? AM : PM);
} //Time

Time.prototype = {

  /**
   * Get Hour, default 1..12
   *
   * hpd = 12 & base = 0: 0..11
   * hpd = 12 & base = 1: 1..12
   * hpd = 24 & base = 0: 0..23
   * hpd = 24 & base = 1: 1..24
   *
   * @param hpd Hours Per Day (12 | 24) [Default 12]
   * @param base The Base Number (0 | 1) [Default 1]
   */
  getHours: function (hpd,base) {
    return (((this.millis / H) | 0) % (hpd || 12)) + (base || 1);
  }, //getHours

  getMinutes: function () {
    return ((this.millis % H) | 0) / M;
  }, //getMinutes

  getSeconds: function () {
    return ((this.millis % M) | 0) / S;
  }, //getSeconds

  getMillis: function () {
    return (this.millis % S) | 0;
  }, //getMillis

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
    return ((millis - time.getTime()) > 0);
  }, //isAfter

  isBefore: function (time) {
    return ((time.getTime() - millis)) > 0);
  }, //isBefore

  /**
   * TODO@@@: Add a Java SimpldDateFormat string that defaults to 'h:mma'
   */
  toString: function () {
    return this.getHours() + ':' + this.getMinutes() + (this.isAM() ? "a" : "p");
  } //toString

}; //*Time