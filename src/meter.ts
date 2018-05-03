import { Constants } from "./constants";
import { Logger } from "./logger";

let modbusRTU = require('modbus-serial');
let Promise = require ('es6-promise');

export class Meter{
    private static port:any;

    public static initialize(){
        Logger.log(Constants.CHANNEL_INITIALIZE, 'Initializing meter.');
        Meter.port = new modbusRTU();
        Meter.port.connectRTUBuffered(Constants.SERIAL_METER_PORT, {
            baudRate: Constants.SERIAL_BAUD_RATE_METER
        });
        Meter.port.setID(Constants.SERIAL_METER_ADDRESS);
        return Meter.getName();
    }

    private static getName(){
        return new Promise((resolve, reject) =>{
            setTimeout(function(){
                Meter.port.readHoldingRegisters(35168, 6, function(err, data){
                    if (!err){
                        let name = '';
                        for (let i = 0; i < data.data.length; i++){
                            let firstNumber = data.data[i];
                            let number8Bit1 = firstNumber & 0xff;
                            let number8Bit2 = ((firstNumber >> 8) & 0xff);
                            name += String.fromCharCode(number8Bit2, number8Bit1); // 94, 4
                        }
                        resolve(name);
                    }
                    else{
                        reject(err);
                    }
                })
            }, 2000);
        });
    }

    public static getKwh(){
        return new Promise((resolve, reject) =>{
            Meter.port.readHoldingRegisters(20480, 4, function(err, data){
                if (!err){
                    let kwh = Meter.combineKwh(data.data);
                    resolve(kwh);
                }
                else{
                    reject(err);
                }
            });
        });
    }

    private static combineKwh(data){
        let b2 = data[1] * Math.pow(2, 32);
        let b3 = data[2] * Math.pow(2, 16);
        let b4 = data[3];

        return (b2 + b3 + b4) / 100;
    }
}