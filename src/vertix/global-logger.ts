import { ObjectBase } from "@vertix-base/bases/object-base";
import  { Logger } from "@vertix-base/modules/logger";

export class GlobalLogger extends ObjectBase {
    private static instance: Logger;

    public static getName() {
        return "Vertix/GlobalLogger";
    }

    public static getInstance() {
        if ( ! GlobalLogger.instance ) {
            const self = new GlobalLogger();
            GlobalLogger.instance = new Logger( self );
        }

        return GlobalLogger.instance;
    }

    public static get $() {
        return GlobalLogger.getInstance();
    }
}

export default GlobalLogger;
