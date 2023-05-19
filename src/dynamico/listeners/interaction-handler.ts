import {
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Interaction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import { Commands } from "../commands";

import { UIInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import GlobalLogger from "@dynamico/global-logger";

import authMiddleware from "@dynamico/middlewares/auth";
import permissionsMiddleware from "@dynamico/middlewares/permissions";

import { PermissionsManager } from "@dynamico/managers/permissions";
import { GUIManager } from "@dynamico/managers/gui";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS } from "@dynamico/constants/master-channel";

const globalLogger = GlobalLogger.$,
    permissionManager = PermissionsManager.$;

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction<"cached"> );
        } else if ( interaction.isModalSubmit() ) {
            await handleModalSubmit( client, interaction as ModalSubmitInteraction<"cached"> );
        } else if ( interaction.isUserSelectMenu() || interaction.isStringSelectMenu() ) {
            await handleUserSelectMenuInteraction( client, interaction as UserSelectMenuInteraction<"cached"> );
        } else if ( interaction.isRoleSelectMenu() ) {
            await handleRoleSelectMenuInteraction( client, interaction as RoleSelectMenuInteraction<"cached"> );
        } else {
            globalLogger.debug( interactionHandler, "", interaction );
        }
    } );
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction ): Promise<void> => {
    globalLogger.log( handleSlashCommand,
        `Guild id: '${ interaction.guildId }' - Slash command: '${ interaction.commandName }' were used by '${ interaction.user.username }'`
    );

    if ( ! interaction.guild ) {
        await interaction.reply( { content: "This command can only be used in a server", ephemeral: true } );
        return;
    }

    if ( ! PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        const missingPermissions = permissionManager.getMissingPermissions(
            DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
            interaction.guild
        );

        if ( missingPermissions.length ) {
            globalLogger.log( handleSlashCommand,
                `Guild id: '${ interaction.guildId }' - User: '${ interaction.user.username }' does not have permission to use command '${ interaction.commandName }'`
            );

            globalLogger.admin( handleSlashCommand,
                `🔐 Dynamico missing permissions for "/${ interaction.commandName }" - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild?.memberCount })`
            );

            const message = await GUIManager.$.get( "Dynamico/UI/NotifyPermissions" )
                .getMessage( interaction, {
                    permissions: missingPermissions,
                    botName: interaction.guild.client.user.username,
                } );

            await interaction.reply( {
                ... message,
                ephemeral: true,
            } );

            return;
        }
    }

    const slashCommand = Commands.find( c => c.name === interaction.commandName );

    if ( ! slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    slashCommand.run( client, interaction );
};

const getCallback = async ( interaction: UIInteractionTypes ) => {
    const result = await GUIManager.$.getCallback( interaction.customId, [
        authMiddleware,
        permissionsMiddleware,
    ] );

    result( interaction );
};

async function handleButton( client: Client, interaction: ButtonInteraction<"cached"> ) {
    globalLogger.log( handleButton,
        `Guild id: '${ interaction.guildId }' - ButtonInteraction id: '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
};

async function handleModalSubmit( client: Client, interaction: ModalSubmitInteraction<"cached"> ) {
    globalLogger.log( handleModalSubmit,
        `Guild id: '${ interaction.guildId }' - ModalSubmitInteraction id: '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
}

async function handleUserSelectMenuInteraction( client: Client, interaction: UserSelectMenuInteraction<"cached"> | SelectMenuInteraction<"cached"> ) {
    globalLogger.log( handleUserSelectMenuInteraction,
        `Guild Id: '${ interaction.guildId } - UserSelectMenuInteraction | SelectMenuInteraction id: '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
}

async function handleRoleSelectMenuInteraction( client: Client, interaction: RoleSelectMenuInteraction<"cached"> ) {
    globalLogger.log( handleRoleSelectMenuInteraction,
        `Guild Id: '${ interaction.guildId } - RoleSelectMenuInteraction id: '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await getCallback( interaction );
}
