"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var serial_1 = require("./serial");
var constants_1 = require("./constants");
var logger_1 = require("./logger");
var EvseSerial = /** @class */ (function (_super) {
    __extends(EvseSerial, _super);
    function EvseSerial(port, baudRate, dataCallback) {
        return _super.call(this, port, baudRate, dataCallback) || this;
    }
    EvseSerial.prototype.bootApplication = function () {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, 'Starting boot application.');
        var baudRateCheck = new Int8Array(1);
        var startApp = new Int8Array(4);
        baudRateCheck[0] = 15; // 0x0F
        startApp[0] = 8; // 0x08
        startApp[1] = 8; // 0x08
        startApp[2] = 129; // 0x81
        startApp[3] = 4; // 0x04
        var self = this;
        setTimeout(function () {
            self.writeCommand(baudRateCheck);
        }, 10);
        setTimeout(function () {
            self.writeCommand(baudRateCheck);
        }, 20);
        setTimeout(function () {
            self.writeCommand(baudRateCheck);
        }, 30);
        setTimeout(function () {
            self.writeCommand(baudRateCheck);
        }, 40);
        setTimeout(function () {
            self.writeCommand(baudRateCheck);
        }, 50);
        setTimeout(function () {
            self.writeCommand(startApp);
        }, 150);
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, 'Finished boot application.');
    };
    return EvseSerial;
}(serial_1.Serial));
exports.EvseSerial = EvseSerial;
//# sourceMappingURL=evseSerial.js.map