import { Logger } from "./logger";
import {Constants} from "./constants";

let SerialPort = require("serialport");

export class Serial{

    private serialPort;
    private port;
    private baudRate;
    private dataCallback;

    public constructor(port, baudRate, dataCallback) {
        Logger.log(Constants.CHANNEL_INITIALIZE, 'Initializing serial port with port: ' + port + ' and baudrate: ' + baudRate);
        this.port = port;
        this.baudRate = baudRate;
        this.dataCallback = dataCallback;
    }

    public connect(){
        Logger.log(Constants.CHANNEL_INITIALIZE, 'Connecting to port: ' + this.port);
        let self = this;

        let sp = new SerialPort(this.port, {
          baudRate: this.baudRate,
          autoOpen: false
        });

        sp.on('data', function (data) {
            let buffer = new Buffer(data, 'utf8');
            self.dataCallback(buffer.toString('ascii'));
        });

        sp.close(function(err){
            if (err){
                sp.open(function(err){
                    if (err !== null){
                        throw(err);
                    }
                });
            }
        });

        this.serialPort = sp;
    }

    public writeCommand(command){
        this.serialPort.write(command, function(err){
            if (err){
                Logger.log(Constants.CHANNEL_ERROR, 'Error writing command \'' + command + '\': ' + err.message);
            }
        });
    }
}