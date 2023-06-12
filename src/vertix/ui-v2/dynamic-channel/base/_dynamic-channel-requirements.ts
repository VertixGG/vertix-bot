import { VoiceChannel } from "discord.js";

import { UIAdapterReplyContext } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { PermissionsManager } from "@vertix/managers/permissions-manager";

import { ChannelModel } from "@vertix/models";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS
} from "@vertix/definitions/master-channel";

import { GlobalLogger } from "@internal/vertix/global-logger";

export const dynamicChannelRequirements = async ( interaction: UIAdapterReplyContext ) => {
    if ( ! interaction.channel )  {
        return false;
    }

    const masterChannelDB = await ChannelModel.$.getByChannelId(
        interaction.channel.id
    );

    if ( ! masterChannelDB ) {
        return false;
    }

    if ( interaction.user.id !== masterChannelDB.userOwnerId ) {
        await UIAdapterManager.$.get( "Vertix/UI-V2/NotYourChannelAdapter" )?.ephemeral( interaction, {
            masterChannelId: masterChannelDB.channelId,
        } );
        return false;
    }

    if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        return true;
    }

    const requiredUserPermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
        requiredRolePermissions = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
        missingPermissions = [
            ... PermissionsManager.$.getMissingPermissions( requiredUserPermissions, interaction.channel as VoiceChannel ),
            ... PermissionsManager.$.getMissingPermissions( requiredRolePermissions, interaction.guild ),
        ];

    const result = ! missingPermissions.length;

    if ( missingPermissions.length ) {
        GlobalLogger.$.admin( dynamicChannelRequirements,
            `🔐 Dynamic Channel missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild.memberCount })`
        );

        GlobalLogger.$.log( dynamicChannelRequirements, `Guild id: '${ interaction.guildId }' - Required permissions:`, missingPermissions );

        await UIAdapterManager.$.get( "Vertix/UI-V2/MissingPermissionsAdapter" )?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username,
        } );
    }

    return result;
};