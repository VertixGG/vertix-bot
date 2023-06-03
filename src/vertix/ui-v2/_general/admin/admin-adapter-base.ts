import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { PermissionsManager } from "@vertix/managers/permissions-manager";

import { DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS } from "@vertix/definitions/master-channel";

import Logger from "@internal/modules/logger";

export class AdminAdapterBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterBase<TChannel, TInteraction> {
    private static dedicatedLogger = new Logger( this );

    public static getName() {
        return "Vertix/UI-V2/AdminAdapterBase";
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionsBitField.Flags.Administrator );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
            ChannelType.GuildText,
        ];
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ) {
        if ( ! PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
            const botRolePermissions = PermissionsManager.$.getRolesPermissions( interaction.guild );
            const missingPermissions = botRolePermissions.missing( DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS );

            if ( missingPermissions.length ) {
                AdminAdapterBase.dedicatedLogger.admin( this.run,
                    `🔐 Bot missing permissions" - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild?.memberCount })`
                );

                await this.uiManager.get( "Vertix/UI-V2/MissingPermissionsAdapter" )?.ephemeral( interaction, {
                    missingPermissions,
                    omitterDisplayName: interaction.guild.client.user.username,
                } );

                return false;
            }
        }

        return true;
    }
}
