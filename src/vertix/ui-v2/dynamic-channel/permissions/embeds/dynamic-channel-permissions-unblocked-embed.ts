import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsUnblockedEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userUnBlockedDisplayName: uiUtilsWrapAsTemplate( "userUnBlockedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsUnblockedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Yellow;
    }

    protected getTitle() {
        return "🤙  User unblocked";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsUnblockedEmbed.vars.userUnBlockedDisplayName }** successfully un-blocked!\n` +
            super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userUnBlockedDisplayName = args.userUnBlockedDisplayName;

        return result;
    }
}
