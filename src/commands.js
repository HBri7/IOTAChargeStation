"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Commands = /** @class */ (function () {
    function Commands() {
    }
    // CHARGE COMMANDS.
    // Session state.
    Commands.EVSE_STATE = 'state:evse' + '\n';
    // Start session (Lock included).
    Commands.SESSION_START = 'session:start' + '\n';
    // Stop session (No unlock included).
    Commands.SESSION_STOP = 'session:stop' + '\n';
    // Lock the cable from being released.
    Commands.CABLE_LOCK = 'lock:lock' + '\n';
    // Unlock the cable, so it can be released.
    Commands.CABLE_UNLOCK = 'lock:unlock' + '\n';
    // Reset the device.
    Commands.RESET = 'reset' + '\n';
    // LED COMMANDS.
    // Turn the LEDs blue.
    Commands.BLUE = 'b' + '\n';
    // Turn the LEDs green.
    Commands.GREEN = 'g' + '\n';
    // Turn the LEDs cyan.
    Commands.CYAN = 'c' + '\n';
    // Turn the LEDs red.
    Commands.RED = 'r' + '\n';
    // Turn the LEDs yellow.
    Commands.YELLOW = 'y' + '\n';
    // Turn the LEDs yellow.
    Commands.PURPLE = 'p' + '\n';
    return Commands;
}());
exports.Commands = Commands;
//# sourceMappingURL=commands.js.map