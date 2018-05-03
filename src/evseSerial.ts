import { Serial } from "./serial";
import {Constants} from "./constants";
import { Logger } from "./logger";

export class EvseSerial extends Serial{

    public constructor(port, baudRate, dataCallback) {
        super(port, baudRate, dataCallback);
    }

    public bootApplication(){
        Logger.log(Constants.CHANNEL_EVSE_STATE, 'Starting boot application.');
        let baudRateCheck = new Int8Array(1);
        let startApp = new Int8Array(4);
        baudRateCheck[0] = 15;  // 0x0F
        startApp[0] = 8;        // 0x08
        startApp[1] = 8;        // 0x08
        startApp[2] = 129;      // 0x81
        startApp[3] = 4;        // 0x04

        let self = this;
        setTimeout(function(){
            self.writeCommand(baudRateCheck);
        }, 10);
        setTimeout(function(){
            self.writeCommand(baudRateCheck);
        }, 20);
        setTimeout(function(){
            self.writeCommand(baudRateCheck);
            }, 30);
        setTimeout(function(){
            self.writeCommand(baudRateCheck);
        }, 40);
        setTimeout(function(){
            self.writeCommand(baudRateCheck);
        }, 50);

        setTimeout(function (){
            self.writeCommand(startApp);
        }, 150)

        Logger.log(Constants.CHANNEL_EVSE_STATE, 'Finished boot application.');

    }
}