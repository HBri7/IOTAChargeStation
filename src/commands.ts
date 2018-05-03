export class Commands {

    // CHARGE COMMANDS.

    // Session state.
    public static EVSE_STATE = 'state:evse' + '\n';

    // Start session (Lock included).
    public static SESSION_START = 'session:start' + '\n';

    // Stop session (No unlock included).
    public static SESSION_STOP = 'session:stop' + '\n';

    // Lock the cable from being released.
    public static CABLE_LOCK = 'lock:lock' + '\n';

    // Unlock the cable, so it can be released.
    public static CABLE_UNLOCK = 'lock:unlock' + '\n';

    // Reset the device.
    public static RESET = 'reset' + '\n';


    // LED COMMANDS.

    // Turn the LEDs blue.
    public static BLUE = 'b';

    // Turn the LEDs green.
    public static GREEN = 'g';

    // Turn the LEDs cyan.
    public static CYAN = 'c';

    // Turn the LEDs red.
    public static RED = 'r';

    // Turn the LEDs yellow.
    public static YELLOW = 'y';
}



