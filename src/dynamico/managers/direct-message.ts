import fetch from "cross-fetch";

import { EmbedBuilder, Guild, Message, MessageCreateOptions, TextBasedChannel } from "discord.js";

import { DYNAMICO_DEFAULT_COLOR_BRAND, DYNAMICO_OWNERS_IDS } from "@dynamico/constants/dynamico";

import { DynamicoManager } from "@dynamico/managers/dynamico";

import InitializeBase from "@internal/bases/initialize-base";

const OWNER_COMMAND_SYNTAX = {
    embed: "!embed <#channel_id> <https://message_url.com>",
    edit_embed: "!edit_embed <#channel_id> <message_id> <https://message_url.com>"
};

export class DirectMessageManager extends InitializeBase {
    private static instance: DirectMessageManager;

    public static getName() {
        return "Managers/DirectMessage";
    }

    public static getInstance() {
        if ( ! DirectMessageManager.instance ) {
            DirectMessageManager.instance = new DirectMessageManager();
        }

        return DirectMessageManager.instance;
    }

    public static get $() {
        return DirectMessageManager.getInstance();
    }

    public async onMessage( message: Message ) {
        this.logger.admin( this.onMessage,
            `💬 Dynamico received DM from '${ message.author.tag }' content: '${ message.content }'`
        );

        if ( DYNAMICO_OWNERS_IDS.includes( message.author.id ) ) {
            return this.onOwnerMessage( message );
        }
    }

    public async onOwnerMessage( message: Message ) {
        const command = message.content.split( " " )
            .filter( ( entry ) => entry.length );

        switch ( command[ 0 ] ) {
            case "!embed":
                await this.handleEmbedCommand( command, message );
                break;

            case "!edit_embed":
                await this.handleEditEmbedCommand( command, message );
                break;

            default:
                let syntaxMessage = "Available commands:\n\n";

                Object.values( OWNER_COMMAND_SYNTAX ).forEach(
                    ( syntax ) => syntaxMessage += `${ syntax }\n`
                );

                await message.reply( syntaxMessage );
        }
    }

    private async handleEmbedCommand( command: string[], message: Message ) {
        if ( command.length < 2 || command.length > 3 || ! command[ 1 ]?.length || ! command[ 2 ]?.length ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.embed );
        }

        const channel = await DynamicoManager.$.getClient()?.channels.fetch( command[ 1 ] );

        if ( ! channel || ! channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        const response = await this.fetchEmbed( command[ 2 ], message );

        if ( response ) {
            await this.sendEmbedCommand( channel, response, message );
        }
    }

    private async handleEditEmbedCommand( command: string[], message: Message ) {
        if ( command.length < 3 || command.length > 4 || ! command[ 1 ]?.length || ! command[ 2 ]?.length || ! command[ 3 ]?.length ) {
            return await message.reply( OWNER_COMMAND_SYNTAX.edit_embed );
        }

        const channel = await DynamicoManager.$.getClient()?.channels.fetch( command[ 1 ] );

        if ( ! channel || ! channel.isTextBased() ) {
            return await message.reply( "Invalid channel!" );
        }

        // Find message.
        const messageToEdit = await channel.messages.fetch( command[ 2 ] ).catch( () => null );

        if ( ! messageToEdit ) {
            await message.reply( "Message not found!" );
        }

        const response = await this.fetchEmbed( command[ 3 ], message );

        if ( response && messageToEdit ) {
            await messageToEdit.edit( { embeds: [ this.buildEmbed( response ) ] } )
                .catch( async () => {
                    await message.reply( "Message was not edited!" );
                } )
                .then( async () => {
                    await message.reply( "Message edited!" );
                } );
        }
    }

    private async sendEmbedCommand( channel: TextBasedChannel, response: any, message: Message ) {
        channel.send( { embeds: [ this.buildEmbed( response ) ] } )
            .catch( async () => {
                await message.reply( "Message was not sent!" );
            } )
            .then( async () => {
                await message.reply( "Message sent!" );
            } );
    }

    public async sendLeaveMessageToOwner( guild: Guild ) {
        const embed = new EmbedBuilder();

        embed.setColor( DYNAMICO_DEFAULT_COLOR_BRAND );
        embed.setTitle( "We hope everything alright 🙏" );
        embed.setDescription( "If there was anything wrong with **Dynamico** functionality or if there's something we could improve upon, please let us know!\n" +
            "Join our [Community Support](https://discord.gg/Dynamico) and we will be glad to assist with anything you need." );

        await this.sendToOwner( guild, { embeds: [ embed ] } );
    }

    public async sendToOwner( guild: Guild, message: MessageCreateOptions ) {
        await ( await DynamicoManager.$.getClient()?.users.fetch( guild.ownerId ) )?.send( message ).catch( () => {
            this.logger.error( this.sendToOwner, `Guild id: '${ guild.id } - Failed to send message to guild ownerId: '${ guild.ownerId }'` );
        } );
    }

    public async sendToUser( userId: string, message: MessageCreateOptions ) {
        await ( await DynamicoManager.$.getClient()?.users.fetch( userId ) )?.send( message ).catch( () => {
            this.logger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` );
        } );
    }

    private async fetchEmbed( url: string, message: Message ) {
        let response: any;

        try {
            const request = fetch( url );

            response = await request.then( async ( _response ) => {
                if ( ! _response.ok ) {
                    throw _response;
                }

                return _response.json();
            } );
        } catch ( e: any ) {
            await message.reply( e.message as string );
            response = null;
        }

        return response;
    }

    private buildEmbed( response: any ) {
        const embedBuilder = new EmbedBuilder();

        if ( response.title ) {
            embedBuilder.setTitle( response.title );
        }

        if ( response.thumbnail ) {
            embedBuilder.setThumbnail( response.thumbnail );
        }

        if ( response.image ) {
            embedBuilder.setImage( response.image );
        }

        if ( response.description ) {
            embedBuilder.setDescription( response.description );
        }

        if ( response.color ) {
            embedBuilder.setColor( parseInt( response.color ) );
        }

        return embedBuilder;
    }

}
