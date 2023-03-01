import Logger from "@internal/modules/logger";
import ObjectBase from "@internal/bases/object-base";

export default class GlobalLogger extends ObjectBase {
    private static instance: Logger;

    public static getName() {
        return "Dynamico/GlobalLogger";
    }

    public static getInstance() {
        if ( !GlobalLogger.instance ) {
            const self = new GlobalLogger();
            GlobalLogger.instance = new Logger( self );
        }

        return GlobalLogger.instance;
    }
}
