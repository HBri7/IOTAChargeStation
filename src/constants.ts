export class Constants{


    // ---------- SETTINGS -----------------

    // ---------- Timers ----------
    public static TIMER_TRANSACTION_CHECK       = 5000;     // 5 s
    public static TIMER_KWH_REPORT              = 300000;   // 300 s = 5 min
    public static TIMER_CHARGE                  = 3000;     // 3 s
    public static TIMER_STOP_DELAY              = 7000;     // 7 s
    public static TIMER_NOTICE                  = 180000;   // 180 s = 3 min

    // ---------- Message settings ----------
    public static MSG_STARTED_TX                = 'The charging session has started. The amount of tokens you sent is worth: {0} kWh.';
    public static MSG_UPDATE_TX                 = 'UPDATE: Currently charged {0} kWh of energy. With the tokens left you will receive: {1} kWh.';
    public static MSG_ENDED_TX                  = 'Your charging session has ended due to depletion of your tokens';
    public static MSG_CAR_STOPPED               = 'Your car has stopped charging. Either it is full or something went wrong. Returning excess tokens back to you.';
    public static MSG_KWH_REPORT                = 'Energy reading: {0}';
    public static MSG_TX_REPORT                 = 'TRANSACTION[{0}]|[{1}]';
    public static MSG_INFO_BROADCAST            = 'INFO[{0}]|[{1}]|[{2}]';

    // ---------- Channel settings ----------
    public static CHANNEL_INITIALIZE            = 'INITIALIZE';
    public static CHANNEL_SEARCHING             = 'SEARCHING';
    public static CHANNEL_KWH_METER             = 'KWH_METER';
    public static CHANNEL_ERROR                 = 'ERROR';
    public static CHANNEL_CHARGING              = 'CHARGING';
    public static CHANNEL_EVSE_STATE            = 'EVSE_STATE';

    // ---------- Other settings ----------
    public static OTHER_RATE                    = 1000;
    public static OTHER_MAX_RETRY_ATTEMPTS      = 3;
    public static OTHER_LOCATION                = 'House of Watt - James Watt 73 Amsterdam';
    public static OTHER_STATION_CODE            = 'ELAADAA';

    // ---------- IOTA settings ----------
    public static IOTA_SEED                     = 'JDSAEWQIUDSLKDWQOIUEWQKJDSUHIWQEPOKSADKJNLKJWQEIJISADLKMQWE9IJSAMQW9OASOMJHQWEUHB';
    public static IOTA_USE_TEST_NET             = true;
    public static IOTA_TEST_NET_HOST            = 'http://p101.iotaledger.net';
    public static IOTA_TEST_NET_PORT            = 14700;
    public static IOTA_MAIN_NET_HOST            = 'http://node04.iotatoken.nl';
    public static IOTA_MAIN_NET_PORT            = 14265;
    public static IOTA_TX_DEPTH                 = 9;
    public static IOTA_TX_MIN_WEIGHT_MAGNITUDE  = 14;
    public static IOTA_BASE_TAG                 = 'IOTA9STATION9NL9ELA9';
    public static IOTA_BASE_TAG_BROADCAST       = 'IOTASTATION9NLELA9BC';
    public static IOTA_FULL_TX_TAG              = Constants.IOTA_BASE_TAG + Constants.OTHER_STATION_CODE;
    public static IOTA_FULL_BC_TAG              = Constants.IOTA_BASE_TAG_BROADCAST + Constants.OTHER_STATION_CODE;
    public static IOTA_KWH_ADDRESS              = 'GYVKQDPKJNXPTEOT9VWJXOAXZPV9EXKHJLMEMADFVNDDRZDKIVRNCQNEFDMMNKXOBXKJYHLEKEGTBOEZXBZVEID9UW';




    // ---------- CONSTANTS -----------------

    // ---------- Serial constants ----------
    public static SERIAL_LED_PORT               = '/dev/tty.led';
    public static SERIAL_CHARGE_PORT            = '/dev/tty.evse';
    public static SERIAL_METER_PORT             = '/dev/tty.kwh';
    public static SERIAL_METER_ADDRESS          = 1;
    public static SERIAL_BAUD_RATE_METER        = 38400;
    public static SERIAL_BAUD_RATE              = 115200;

    // ---------- State constants ----------
    public static STATE_CONNECTED               = 'STATE=CONNECTED';    // Cable plugged in, no active session.
    public static STATE_DISCONNECTED            = 'STATE=DISCONNECTED'; // Cable pulled from the car during an active session.
    public static STATE_OFFERING                = 'STATE=OFFERING';     // Cable plugged in, active session, car is not drawing power.
    public static STATE_CHARGING                = 'STATE=CHARGING';     // Cable plugged in, active session, car is drawing power.
    public static STATE_IDLE                    = 'STATE=IDLE';         // No cable plugged in, no active session.
    public static STATE_PREPARING               = 'STATE=PREPARING';    // State in between IDLE and CONNECTED
    public static STATE_STOPPED                 = 'STATE=STOPPED';

}