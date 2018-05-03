"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = /** @class */ (function () {
    function Constants() {
    }
    // ---------- SETTINGS -----------------
    // ---------- Timers ----------
    Constants.TIMER_TRANSACTION_CHECK = 5000; // 5 s
    Constants.TIMER_KWH_REPORT = 60000; // 1 min
    Constants.TIMER_CHARGE = 3000; // 3 s
    Constants.TIMER_STOP_DELAY = 7000; // 7 s
    Constants.TIMER_NOTICE = 180000; // 180 s = 3 min
    // ---------- Message settings ----------
    Constants.MSG_STARTED_TX = 'The charging session has started. The amount of tokens you sent is worth: {0} kWh.';
    Constants.MSG_UPDATE_TX = 'UPDATE: Currently charged {0} kWh of energy. With the tokens left you will receive: {1} kWh.';
    Constants.MSG_ENDED_TX = 'Your charging session has ended due to depletion of your tokens';
    Constants.MSG_CAR_STOPPED = 'Your car has stopped charging. Either it is full or something went wrong. Returning excess tokens back to you.';
    Constants.MSG_KWH_REPORT = 'Energy reading: {0}';
    Constants.MSG_TX_REPORT = 'TRANSACTION[{0}]|[{1}]';
    Constants.MSG_INFO_BROADCAST = 'INFO[{0}]|[{1}]|[{2}]';
    // ---------- Channel settings ----------
    Constants.CHANNEL_INITIALIZE = 'INITIALIZE';
    Constants.CHANNEL_SEARCHING = 'SEARCHING';
    Constants.CHANNEL_KWH_METER = 'KWH_METER';
    Constants.CHANNEL_ERROR = 'ERROR';
    Constants.CHANNEL_CHARGING = 'CHARGING';
    Constants.CHANNEL_EVSE_STATE = 'EVSE_STATE';
    // ---------- Other settings ----------
    Constants.OTHER_RATE = 1000;
    Constants.OTHER_MAX_RETRY_ATTEMPTS = 3;
    Constants.OTHER_LOCATION = 'House of Carrots - James Watt 73 Amsterdam';
    Constants.OTHER_STATION_CODE = 'ELAADAA';
    // ---------- IOTA settings ----------
    Constants.IOTA_SEED = '';
    Constants.IOTA_USE_TEST_NET = true;
    Constants.IOTA_TEST_NET_HOST = 'http://node01.testnet.iotatoken.nl';
    Constants.IOTA_TEST_NET_PORT = 16265;
    Constants.IOTA_MAIN_NET_HOST = 'http://node06.iotatoken.nl';
    Constants.IOTA_MAIN_NET_PORT = 14265;
    Constants.IOTA_TX_DEPTH = 9;
    Constants.IOTA_TX_MIN_WEIGHT_MAGNITUDE = 14;
    Constants.IOTA_BASE_TAG = 'IOTA9STATION9NL9ELA9';
    Constants.IOTA_BASE_TAG_BROADCAST = 'IOTASTATION9NLELA9BC';
    Constants.IOTA_FULL_TX_TAG = Constants.IOTA_BASE_TAG + Constants.OTHER_STATION_CODE;
    Constants.IOTA_FULL_BC_TAG = Constants.IOTA_BASE_TAG_BROADCAST + Constants.OTHER_STATION_CODE;
    Constants.IOTA_KWH_ADDRESS = 'GYVKQDPKJNXPTEOT9VWJXOAXZPV9EXKHJLMEMADFVNDDRZDKIVRNCQNEFDMMNKXOBXKJYHLEKEGTBOEZXBZVEID9UW';
    // ---------- CONSTANTS -----------------
    // ---------- Serial constants ----------
    Constants.SERIAL_LED_PORT = '/dev/tty.led';
    Constants.SERIAL_CHARGE_PORT = '/dev/tty.evse';
    Constants.SERIAL_METER_PORT = '/dev/tty.kwh';
    Constants.SERIAL_METER_ADDRESS = 1;
    Constants.SERIAL_BAUD_RATE_METER = 38400;
    Constants.SERIAL_BAUD_RATE = 115200;
    // ---------- State constants ----------
    Constants.STATE_CONNECTED = 'STATE=CONNECTED'; // Cable plugged in, no active session.
    Constants.STATE_DISCONNECTED = 'STATE=DISCONNECTED'; // Cable pulled from the car during an active session.
    Constants.STATE_OFFERING = 'STATE=OFFERING'; // Cable plugged in, active session, car is not drawing power.
    Constants.STATE_CHARGING = 'STATE=CHARGING'; // Cable plugged in, active session, car is drawing power.
    Constants.STATE_IDLE = 'STATE=IDLE'; // No cable plugged in, no active session.
    Constants.STATE_PREPARING = 'STATE=PREPARING'; // State in between IDLE and CONNECTED
    Constants.STATE_STOPPED = 'STATE=STOPPED';
    return Constants;
}());
exports.Constants = Constants;
//# sourceMappingURL=constants.js.map