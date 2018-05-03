"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execSync = require('child_process').execSync;
var sys = require('sys')
var exec = require('child_process').exec;
var net = require('net');
var constants_1 = require("./src/constants");
var serial_1 = require("./src/serial");
var commands_1 = require("./src/commands");
var meter_1 = require("./src/meter");
var logger_1 = require("./src/logger");
var evseSerial_1 = require("./src/evseSerial");
var IOTA = require("iota.lib.js");
var moment = require("moment");
var asap = require("asap");
var request = require('request');

var EVSE;
var LED;
var iota;
var state;
var lastNoticeTime;
var lastState;
var startDateTimeTx;
var startKwhTx;
var tokensPaid;
var stopped;
var EVSE;
var mySeed;
var myAddress;
var otherAddress;
var requestedAmount;
var currentMeterReading;
var chargeSessionStartReading;
var charging = false;
var globalSocket;
var chargeStart;

// Orginal CP
//var MAC_addr = "00:05:B6:03:3A:16";

// Box CP
var MAC_addr = "00:05:B6:03:3A:16";

var usedHashes = [];

EVSE = new evseSerial_1.EvseSerial(constants_1.Constants.SERIAL_CHARGE_PORT, constants_1.Constants.SERIAL_BAUD_RATE, handleChargeData);
EVSE.connect();

LED = new serial_1.Serial(constants_1.Constants.SERIAL_LED_PORT, constants_1.Constants.SERIAL_BAUD_RATE, function () { });
LED.connect();

setTimeout(function () { EVSE.writeCommand(commands_1.Commands.RESET); }, 1000);
setTimeout(function () { LED.writeCommand(commands_1.Commands.YELLOW); LED.writeCommand("0\n"); }, 2000);

var server = net.createServer(function(socket) {
    console.log("Connected over charge cable!");
    setTimeout(function () { LED.writeCommand(commands_1.Commands.YELLOW); }, 500);
    LED.writeCommand(commands_1.Commands.GREEN);
    socket.on('data', function(data){
        var textChunk = data.toString('utf8');
        console.log(textChunk);
        parseSocketData(data, socket);
    });
    socket.on('end', function(){
        console.log("Client disconnected!");
        LED.writeCommand(commands_1.Commands.YELLOW);
    });
    socket.on('error', function(err){
        console.log("Error: " + err);
    });
    globalSocket = socket;
});

if (constants_1.Constants.IOTA_USE_TEST_NET) {
    iota = new IOTA({
        'host': constants_1.Constants.IOTA_TEST_NET_HOST,
        'port': constants_1.Constants.IOTA_TEST_NET_PORT,
    });
    mySeed = "";
    myAddress = "";
}
else {
    iota = new IOTA({
        'host': constants_1.Constants.IOTA_MAIN_NET_HOST,
        'port': constants_1.Constants.IOTA_MAIN_NET_PORT,
    });
    mySeed = "";
    myAddress = "";
}

// Start the wallet checking process
checkWallet();

// Create socket server listening for communication
server.listen(1337, '10.200.200.1');
logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'TCP Server started on port 1337');

meter_1.Meter.initialize()
    .then(function (value) {
    logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'Meter found: ' + value);
    logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'Starting KWh timer.');
    meter_1.Meter.getKwh().then(function (kwh) {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_INITIALIZE, 'kWh reading: ' + kwh);
        currentMeterReading = kwh;
    });
    setTimeout(function () { kwhLoop(); }, constants_1.Constants.TIMER_KWH_REPORT);
    setTimeout(storeMeterValueInTangle, 1000);
    setInterval(storeMeterValueInTangle, 900000);
});

function puts(error, stdout, stderr) { sys.puts(stdout) }

function kwhLoop() {
    meter_1.Meter.getKwh().then(function (kwh) {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_KWH_METER, 'Sending KWh report. Current amount: ' + kwh.toString());
        
        currentMeterReading = kwh;
        
        var rightnow = new Date();
        
        if(charging && (kwh >= chargeSessionStartReading + requestedAmount/100)) {
            stopCharge();
        }
        else {
            setTimeout(function () { kwhLoop(); }, constants_1.Constants.TIMER_KWH_REPORT/4);
        }
    });
}

// Store meter reading in tangle (Executed every 15 minutes)
function storeMeterValueInTangle() {
    meter_1.Meter.getKwh().then(function (kwh) {
        logger_1.Logger.log(constants_1.Constants.CHANNEL_KWH_METER, 'Sending meter reading to Tangle: ' + kwh.toString() + 'kwh');
        
        var jsonMessage = JSON.stringify({ message: "IOTA CP Meter value", value: kwh });
        
        makeTransaction(mySeed, "CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARROT9CARR", jsonMessage, 0, function(bundle) {
            logger_1.Logger.log(constants_1.Constants.CHANNEL_KWH_METER, 'Stored meter value in Tangle: ' + bundle[0].hash);
        })
    });
}

// Create a transaction
function makeTransaction(seed, address, messageString, value, callback_func) {
    console.log("makeTransaction, message: " + messageString);
    let messageTrytes = iota.utils.toTrytes(messageString);
    var transfer = [{
        'address': address,
        'value': value,
        'tag': 'IOTACHARGESTATIONELAAD',
        'message': messageTrytes,
    }];

    iota.api.sendTransfer(seed, 4, 9, transfer, function(e, bundle) {
        if (e) throw e;
        console.log("Successfully sent your transfer: ", bundle[0].hash);
        callback_func(bundle);
    });
}

// Parse data from the incoming socket connection
function parseSocketData(data, socket) {
    var obj = JSON.parse(data);
    switch(obj.command) {
        case "address":
            otherAddress = obj.value;
            socket.write(JSON.stringify({command: "address", value: myAddress}));
            break;
        case "request":
            requestedAmount = obj.value;
            checkWallet();
            break;
    }
}

// Check wallet for new transactions
function checkWallet() {
    console.log("Checking wallet!");
    iota.api.findTransactionObjects({'addresses': [ address ]}, function(err, data) {
        if(!err) {
            //console.log(data);
            data.sort(function(a, b) {
                return parseFloat(b.timestamp) - parseFloat(a.timestamp);
            });
            var validfound = false;
            for(var i = 0; i < data.length; i++) {
                var transaction = data[i];
                var transactionDate = new Date(transaction.timestamp * 1000);
                var nowDate = new Date();
                if(nowDate-transactionDate < 5*60*1000 && !usedHashes.some(x => x == transaction.hash)){ // Within 5 minutes
                    console.log("Found valid transfer! Details: ");
                    console.log(transaction);
                    usedHashes.push(transaction.hash);
                    validfound = true;
                    startCharge();
                }
            }
            if(!validfound) {
                setTimeout(function () { checkWallet(); }, constants_1.Constants.TIMER_TRANSACTION_CHECK);
            }
        }
        else {
            setTimeout(function () { checkWallet(); }, constants_1.Constants.TIMER_TRANSACTION_CHECK);
            console.log(err);
        }
    });
}

function startCharge() {
    console.log("Start charging!");
    charging = true;
    chargeStart = new Date();
    chargeSessionStartReading = currentMeterReading;
    EVSE.writeCommand(commands_1.Commands.SESSION_START);
    kwhLoop();
}

function stopCharge() {
    console.log("Done charging!");
    charging = false;
    checkWallet();
    try {
        globalSocket.write(JSON.stringify({command: "stop", value: "true"}));
    }
    catch (e) {
        console.log("Unable to send command");
    }
    LED.writeCommand(commands_1.Commands.GREEN);
    EVSE.writeCommand(commands_1.Commands.SESSION_STOP);
}

function setupSlac() {
    setTimeout(function () { LED.writeCommand("5\n"); LED.writeCommand(commands_1.Commands.GREEN); }, 500);
    console.log("Send SLAC init");
    var slac = exec('sudo "/home/pi/open-plc-utils/ether/efsu" "/home/pi/open-plc-utils/ether/HC_STOP_LISTEN_FOR_SLAC_ASSN.IND" "-i" "eth0" "-vhd" "' + MAC_addr +'" "-e" "0xabba"; \
                    sleep 5; \
                    sudo "/home/pi/open-plc-utils/ether/efsu" "/home/pi/open-plc-utils/ether/HC_LISTEN_FOR_SLAC_ASSN.IND" "-i" "eth0" "-vhd" "' + MAC_addr +'" "-e" "0xabba"', 
    function() {
        setTimeout(function () { LED.writeCommand(commands_1.Commands.PURPLE); }, 500);
        
        // Set timeout for Slac communication
        setTimeout(function () {
            setTimeout(function () { LED.writeCommand(commands_1.Commands.GREEN); }, 500);
        }, 21000);
    });
    slac.stdout.pipe(process.stdout);
}

function stopSlac() {
    console.log("Send STOP Slac");
    var stopSlac = exec('sudo "/home/pi/open-plc-utils/ether/efsu" "/home/pi/open-plc-utils/ether/HC_STOP_LISTEN_FOR_SLAC_ASSN.IND" "-i" "eth0" "-vhd" "' + MAC_addr +'" "-e" "0xabba"');
    stopSlac.stdout.pipe(process.stdout);
}

function stopTransactionPrematurely() {
    stopCharge();
}

function handleChargeData(data) {
    if (data.indexOf(constants_1.Constants.STATE_CONNECTED) !== -1) {
        lastState = constants_1.Constants.STATE_CONNECTED;
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_CONNECTED);
        //setTimeout(function () { EVSE.writeCommand(commands_1.Commands.CABLE_LOCK); }, 1500);
        setupSlac();
    }
    if (data.indexOf(constants_1.Constants.STATE_OFFERING) !== -1) {
        if (lastState == constants_1.Constants.STATE_CHARGING) {
            stopTransactionPrematurely();
        }
        lastState = constants_1.Constants.STATE_OFFERING;
        setTimeout(function () { LED.writeCommand(commands_1.Commands.CYAN); }, 400);
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_OFFERING);
    }
    if (data.indexOf(constants_1.Constants.STATE_CHARGING) !== -1) {
        setTimeout(function () { LED.writeCommand(commands_1.Commands.BLUE); }, 1500);
        lastState = constants_1.Constants.STATE_CHARGING;
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_CHARGING);
    }
    if (data.indexOf(constants_1.Constants.STATE_DISCONNECTED) !== -1) {
        stopTransactionPrematurely();
        lastState = constants_1.Constants.STATE_DISCONNECTED;
        LED.writeCommand("0\n");
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_DISCONNECTED);
    }
    if (data.indexOf(constants_1.Constants.STATE_IDLE) !== -1) {
        setTimeout(function () { LED.writeCommand("0\n"); }, 500);
        if (lastState == constants_1.Constants.CONNECTED || lastState == constants_1.Constants.STOPPED) {
            setTimeout(function () { LED.writeCommand("0\n"); }, 500);
        }
        lastState = constants_1.Constants.STATE_IDLE;
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_IDLE);
    }
    if (data.indexOf(constants_1.Constants.STATE_PREPARING) !== -1) {
        lastState = constants_1.Constants.STATE_PREPARING;
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_PREPARING);
    }
    if (data.indexOf(constants_1.Constants.STATE_STOPPED) !== -1) {
        lastState = constants_1.Constants.STATE_STOPPED;
        logger_1.Logger.log(constants_1.Constants.CHANNEL_EVSE_STATE, constants_1.Constants.STATE_STOPPED);
        LED.writeCommand(commands_1.Commands.GREEN);
        EVSE.writeCommand(commands_1.Commands.CABLE_UNLOCK);
    }
}
