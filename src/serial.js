"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var constants_1 = require("./constants");
var SerialPort = require("serialport");
var Serial = /** @class */ (function () {
    function Serial(port, baudRate, dataCallback) {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'Initializing serial port with port: ' + port + ' and baudrate: ' + baudRate);
        this.port = port;
        this.baudRate = baudRate;
        this.dataCallback = dataCallback;
        this.dataString = "";
    }
    Serial.prototype.connect = function () {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'Connecting to port: ' + this.port);
        var self = this;
        var sp = new SerialPort(this.port, {
            baudRate: this.baudRate,
            autoOpen: false
        });
        sp.on('data', function (data) {
            this.dataString += data;

            // Parse if we have a command and an end character 'newline'
            while (this.dataString.indexOf('\n') != -1) {
                var command = this.dataString.substring(0, this.dataString.indexOf('\n'));
                var buffer = new Buffer(command, 'utf8');
                self.dataCallback(buffer.toString('ascii'));
                this.dataString = this.dataString.substring(this.dataString.indexOf('\n')+1);
            }
        });
        sp.on('error', function(err) {
            console.log('error: ', err.message);
        })
        sp.close(function (err) {
            if (err) {
                sp.open(function (err) {
                    if (err !== null) {
                        throw (err);
                    }
                });
            }
        });
        this.serialPort = sp;
    };
    Serial.prototype.writeCommand = function (command) {
        try {
            this.serialPort.write(command, function (err) {
                if (err) {
                    logger_1.Logger.log(constants_1.Constants.CHANNEL_ERROR, 'Error writing command \'' + command + '\': ' + err.message);
                }
            });
        }
        catch(err) {
            logger_1.Logger.log(constants_1.Constants.CHANNEL_ERROR, 'Serialport Error! ' + err);
        }
    };
    return Serial;
}());
exports.Serial = Serial;
//# sourceMappingURL=serial.js.map