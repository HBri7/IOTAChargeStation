"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var logger_1 = require("./logger");
var modbusRTU = require('modbus-serial');
var Promise = require('es6-promise');
var Meter = /** @class */ (function () {
    function Meter() {
    }
    Meter.initialize = function () {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'Initializing meter.');
        Meter.port = new modbusRTU();
        Meter.port.connectRTUBuffered(constants_1.Constants.SERIAL_METER_PORT, {
            baudRate: constants_1.Constants.SERIAL_BAUD_RATE_METER
        });
        Meter.port.setID(constants_1.Constants.SERIAL_METER_ADDRESS);
        return Meter.getName();
    };
    Meter.getName = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                Meter.port.readHoldingRegisters(35168, 6, function (err, data) {
                    if (!err) {
                        var name_1 = '';
                        for (var i = 0; i < data.data.length; i++) {
                            var firstNumber = data.data[i];
                            var number8Bit1 = firstNumber & 0xff;
                            var number8Bit2 = ((firstNumber >> 8) & 0xff);
                            name_1 += String.fromCharCode(number8Bit2, number8Bit1); // 94, 4
                        }
                        resolve(name_1);
                    }
                    else {
                        reject(err);
                    }
                });
            }, 2000);
        });
    };
    Meter.getKwh = function () {
        return new Promise(function (resolve, reject) {
            Meter.port.readHoldingRegisters(20480, 4, function (err, data) {
                if (!err) {
                    var kwh = Meter.combineKwh(data.data);
                    resolve(kwh);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    Meter.combineKwh = function (data) {
        var b2 = data[1] * Math.pow(2, 32);
        var b3 = data[2] * Math.pow(2, 16);
        var b4 = data[3];
        return (b2 + b3 + b4) / 100;
    };
    return Meter;
}());
exports.Meter = Meter;
//# sourceMappingURL=meter.js.map