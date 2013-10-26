var log = require("log4js").getLogger("relay");
var SerialPort = require("serialport").SerialPort;
var strutils = require("../../framework/strutils.js");

var serial = null;
var port,opts;

var valveTable = [
  {on: 'e', off: 'o'},
  {on: 'f', off: 'p'},
  {on: 'g', off: 'q'},
  {on: 'h', off: 'r'},
  {on: 'i', off: 's'},
  {on: 'j', off: 't'},
  {on: 'k', off: 'u'},
  {on: 'l', off: 'v'}
];

exports.Relay = Relay;

function Relay (port,opts) {
  this.port = port;
  this.opts = opts;
  serial = this.getSerial();
  log.trace("Turning All Switches off (n) [0x00000000]");
  serial.write('n'); // All Off
} //Relay

Relay.prototype = {
  switches: 0,

  on: function (pos) {
    this.switches |= 1 << pos;
    log.trace("Turning Switch " + pos + " on (" + valveTable[pos].on + ") [0b" + strutils.toPaddedString(this.switches.toString(2),8) + ']');
    this.getSerial().write(valveTable[pos].on);
  }, //on

  off: function (pos) {
    this.switches &= ~(1 << pos);
    log.trace("Turning Switch " + pos + " off (" + valveTable[pos].off + ") [0b" + strutils.toPaddedString(this.switches.toString(2),8) + ']');
    this.getSerial().write(valveTable[pos].off);
  }, //off

  position: function (pos) {
    return (this.switches & (1 << pos)) > 0;
  }, //position

  toggle: function (pos) {
    this.position(pos) ? this.off(pos) : this.on(pos);
  }, //toggle

  positions: function () {
    return this.switches;
  }, //positions

  getSerial: function () {
    if(!serial) {
      this.serial = new SerialPort(this.port,this.opts);
      this.serial.on("error",function () {
        this.serial = null;
      });
    }
    return this.serial;
  } //getSerial

}; //*Relay