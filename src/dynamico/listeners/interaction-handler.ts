import * as process from "process";

import {
    ButtonInteraction,
    ChannelType,
    Client,
    CommandInteraction, EmbedBuilder,
    Events,
    Interaction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import { Commands } from "../interactions/commands";

import guiManager from "../managers/gui";

import ChannelManager from "@dynamico/managers/channel";
import MasterChannelManager from "@dynamico/managers/master-channel";

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction );
        } else if ( interaction.isModalSubmit() ) {
            await handleModalSubmit( client, interaction );
        } else if ( interaction.isUserSelectMenu() || interaction.isStringSelectMenu() ) {
            await handleUserSelectMenuInteraction( client, interaction as UserSelectMenuInteraction );
        } else if ( process.env.debug_mode === "discord" ) {
            console.log( interaction );
        }
    } );
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction ): Promise<void> => {
    console.log( `Slash command '${ interaction.commandName }' was used by '${ interaction.user.username }'` );

    const slashCommand = Commands.find( c => c.name === interaction.commandName );

    if ( ! slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    await interaction.deferReply( {
        ephemeral: true,
    } );

    slashCommand.run( client, interaction );
};

async function authMiddleware( interaction: Interaction ) {
    // A map that holds all the channel owners.
    // The key is the channel id and the value is the user id.
    const channelOwners = new Map<string, string>();

    // Only the channel owner can pass the middleware
    if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type && interaction.guildId ) {
        if ( ! channelOwners.has( interaction.channel.id ) ) {
            const channel = await ChannelManager.getInstance().getChannel( interaction.guildId, interaction.channel.id );

            if ( channel ) {
                channelOwners.set( interaction.channel.id, channel.userOwnerId );
            }
        }

        const channelOwnerId = channelOwners.get( interaction.channel.id );

        if ( channelOwnerId === interaction.user.id ) {
            return true;
        }

        if ( interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit() ) {
            const embed = new EmbedBuilder(),
                // TODO: Cache this
                masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction );

            let message = "You should open your own channel and try again";

            if ( masterChannel ) {
                message = `${message}:\n<#${masterChannel.id}>`;
            }

            embed.setTitle( "Oops, this is not your channel !" );
            embed.setDescription( message );

            await interaction.reply( {
                embeds: [ embed ],
                ephemeral: true,
            } );
        }
    }

    return false;
}

async function handleButton( client: Client, interaction: ButtonInteraction ) {
    console.log( `Button id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
};

async function handleModalSubmit( client: Client, interaction: ModalSubmitInteraction ) {
    console.log( `Modal submit id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
}

async function handleUserSelectMenuInteraction( client: Client, interaction: UserSelectMenuInteraction | SelectMenuInteraction ) {
    console.log( `UserSelectMenuInteraction|SelectMenuInteraction id '${ interaction.customId }' was used by '${ interaction.user.username }'` );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
}
