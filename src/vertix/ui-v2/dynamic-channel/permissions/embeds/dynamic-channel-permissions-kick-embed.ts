import { Colors } from "discord.js";

import {
    DynamicChannelPermissionsAccessEmbed
} from "@vertix/ui-v2/dynamic-channel/permissions/embeds/dynamic-channel-permissions-access-embed";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsKickEmbed extends DynamicChannelPermissionsAccessEmbed {
    private static vars = {
        userKickedDisplayName: uiUtilsWrapAsTemplate( "userKickedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsKickEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Yellow;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "👢  User kicked";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsKickEmbed.vars.userKickedDisplayName }** successfully kicked!\n` +
            super.getDescription();
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args );

        result.userKickedDisplayName = args.userKickedDisplayName;

        return result;
    }
}
