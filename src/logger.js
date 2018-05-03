"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function (channel, message) {
        console.log('[' + channel + ']: ' + message);
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map