import { Client } from "discord.js";

import * as handlers from "./listeners";
import * as process from "process";

import chalk from "chalk";

import GlobalLogger from "./global-logger";

import GUIManager from "./managers/gui";

export default function Main() {
    const logger = GlobalLogger.getInstance();

    logger.log( Main, "Bot is starting..." );

    GUIManager.getInstance().register( require( "@dynamico/ui/edit-channel" ).default );

    const client = new Client( {
        intents: [
            "GuildIntegrations",
            "GuildInvites",
            "Guilds",
            "GuildVoiceStates",
        ]
    } );

    // DiscordJS Debug mode.
    if ( process.env.debug_mode === "discord" ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( chalk.red( "API" ) , args.toString() );
        };

        client
            .on( "debug", debug )
            .on( "warn", debug )
            .on( "error", debug )
            .on( "shardError", debug );

        client.rest
            .on( "restDebug", debug )
            .on( "handlerSweep", debug )
            .on( "hashSweep", debug )
            .on( "invalidRequestWarning", debug )
            .on( "newListener", debug )
            .on( "rateLimited", debug )
            .on( "removeListener", debug )
            .on( "response", debug );
    }

    async function onLogin() {
        logger.log( onLogin, "Bot is authenticated" );

        logger.log( onLogin, "Registering listeners..." );

        for ( const handler of Object.values( handlers ) ) {
            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            await handler( client );

            logger.log( onLogin, `Handler '${ handler.name }' registered` );
        }

        logger.log( onLogin, "All listeners registered" );
    }

    client.login( process.env.DISCORD_BOT_TOKEN ).then( onLogin );
}
