#!/usr/bin/env node
var constants_1 = require("./src/constants");
var gpio = require('rpi-gpio');
var asap = require('asap');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var request = require('request');
var tunnel = require('tunnel-ssh');

if (constants_1.Constants.IOTA_USE_TEST_NET) {
	// Manual config because of tunnel
    iota = new IOTA({
        'host': 'http://localhost',
        'port': '16265',
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

// Tunnel traffic over charge cabel via SSH tunnel
var tunnelConfig = {
    username:'pi',
    password:'raspberry',
    host:'10.200.200.1',
    port:22,
    dstHost:'node01.testnet.iotatoken.nl',
    dstPort:16265,
    localHost:'127.0.0.1',
    localPort: 16265,
    keepAlive: true
};

var otherAddress = undefined;

gpio.setMode(gpio.MODE_BCM);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var communicate = function() {
	gpio.setup(4, gpio.DIR_OUT, function() {
		gpio.write(4, false, function(err) {
	        if (err) throw err;
	        console.log('Written false to pin 4');
	    });
	});
	console.log("Start SLAC");
	var slac = execSync('sudo /home/pi/go/src/chargepoint-os/open-plc-utils/slac/pev_new -p /home/pi/go/src/chargepoint-os/open-plc-utils/slac/pev.ini -z -i eth0; sleep 1; sudo /home/pi/go/src/chargepoint-os/open-plc-utils/slac/pev_new -p /home/pi/go/src/chargepoint-os/open-plc-utils/slac/pev.ini -y -i eth0');
	var net = require('net');
	var client = new net.Socket();
	client.connect(1337, '10.200.200.1', function() {
		console.log('Connected');
		var amount = getRandomInt(85, 110);
		client.write(JSON.stringify({command: "address", value: myAddress}));
		client.write(JSON.stringify({command: "request", value: amount}));
		makeTransfer(amount);
	});

	client.on('data', function(data) {
		console.log('Received: ' + data);
		parseData(data);
	});

	client.on('close', function() {
		console.log('Connection closed');
	});

	console.log("Executed start SLAC");
}

var parseData = function(data) {
	var obj = JSON.parse(data);
	console.log(data);
    switch(obj.command) {
        case "address":
            otherAddress = obj.value;
            break;
        case "stop":
        	communicate();
        	break;
    }
}

var makeTransfer = function(kwh) {
	console.log(mySeed);
	if(otherAddress) {

		console.log("Making transfer!")
		tunnel(tunnelConfig, function (error, server) {
			makeTransaction(mySeed, otherAddress, "Charge!", kwh, function () {
				gpio.write(4, true, function(err) {
			        if (err) throw err;
			        console.log('Written true to pin 4');
			    });
			    server.close();
			});
		});
	}
	else {
		setTimeout(function () { makeTransfer(kwh); }, 1000);
	}
}

var makeTransaction = function(seed, address, messageString, value, callback_func) {
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

communicate();