import { ChannelType, PermissionsBitField } from "discord.js";

import  { Logger } from "@vertix-base/modules/logger";

import { UIAdapterExecutionStepsBase } from "@vertix/ui-v2/_base/ui-adapter-execution-steps-base";
import { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { PermissionsManager } from "@vertix/managers/permissions-manager";

import {
    DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS,
    DEFAULT_SETUP_PERMISSIONS
} from "@vertix/definitions/master-channel";

export class AdminAdapterExuBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterExecutionStepsBase<TChannel, TInteraction> {
    private static dedicatedLogger = new Logger( this.getName() );

    public static getName() {
        return "Vertix/UI-V2/AdminAdapterExuBase";
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
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
                AdminAdapterExuBase.dedicatedLogger.admin( this.run,
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
