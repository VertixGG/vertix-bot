/**
 * @see https://discord.com/api/oauth2/authorize?client_id=1079487067932868608&permissions=8&scope=bot%20applications.commands
 */
import Prisma from "./prisma";
import botInitialize from "./discord";
import GlobalLogger from "@internal/discord/global-logger";

function enteryPoint() {
    GlobalLogger.getInstance().info( enteryPoint, "Database is connected" );

    botInitialize();
}

Prisma.getConnectPromise().then( enteryPoint );
