//
// Get information from connected devices.
//
// @chamerling
//

var utils = require('./utils');
var fs = require('fs');

var W1_FILE = '/sys/bus/w1/devices/w1_bus_master1/w1_master_slaves';

//
// Get all connected sensor IDs as array
// @param callback(err, array)
//
var sensors = function(callback) {
  callback = utils.safe(callback);

  fs.readFile(W1_FILE, 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    }
    
    var parts = data.split("\n");
    parts.pop();
    return callback(null, parts);
  });
}
exports.sensors = sensors;

var parseData = function(data) {
    
    var arr = data.split(' ');
    
    if (arr[1].charAt(0) === 'f') {
        
        var x = parseInt("0xffff" + arr[1].toString() + arr[0].toString(), 16);
        return (-((~x + 1) * 0.0625));
        
    } else if (arr[1].charAt(0) === '0') {
        
        return parseInt("0x0000" + arr[1].toString() + arr[0].toString(), 16) * 0.0625;
        
    }
    
    throw new Error('Can not parse data');
    
};

//
// Get the temperature of a given sensor
// @param sensor : The sensor ID
// @param callback : callback (err, value)
var temperature = function(sensor, callback) {
  callback = utils.safe(callback);

  fs.readFile('/sys/bus/w1/devices/' + sensor + '/w1_slave', 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    }
    
      try {
        return callback(null, parseData(data));
      } catch (e) {
        return callback(new Error('Can not read temperature for sensor ' + sensor));
      }
      
  });
};
exports.temperature = temperature;

var temperatureSync = function(sensor) {
    
    var data = fs.readFileSync('/sys/bus/w1/devices/' + sensor + '/w1_slave', 'utf8');
    return parseData(data);
    
};
exports.temperatureSync = temperatureSync;
