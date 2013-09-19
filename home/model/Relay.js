var log = require("log4js").getLogger("relay");
var SerialPort = require("serialport").SerialPort;

var serial = null;

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
  serial = new SerialPort(port,opts);
  log.trace("Turning All Switches off (n) [0x00000000]");
  serial.write('n'); // All Off
} //Relay

Relay.prototype = {
  switches: 0,

  on: function (pos) {
    this.switches |= 1 << pos;
    log.trace("Turning Switch " + pos + " on (" + valveTable[pos].on + ") [0b" + ("0000000" + this.switches.toString(2)).substr(-8) + ']');
    serial.write(valveTable[pos].on);
  },

  off: function (pos) {
    this.switches &= ~(1 << pos);
    log.trace("Turning Switch " + pos + " off (" + valveTable[pos].off + ") [0b" + ("0000000" + this.switches.toString(2)).substr(-8) + ']');
    serial.write(valveTable[pos].off);
  },

  position: function (pos) {
    return (this.switches & (1 << pos)) > 0;
  },

  toggle: function (pos) {
    this.position(pos) ? this.off(pos) : this.on(pos);
  },

  positions: function () {
    return this.switches;
  }

}; //*Relay