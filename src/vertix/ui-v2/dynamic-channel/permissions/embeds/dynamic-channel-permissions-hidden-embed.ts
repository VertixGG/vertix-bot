import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsHiddenEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        message: uiUtilsWrapAsTemplate( "message" ),
        messageDefault: uiUtilsWrapAsTemplate( "messageDefault" ),
        messageAccessNotAvailable: uiUtilsWrapAsTemplate( "messageAccessNotAvailable" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsHiddenEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getColor() {
        return 0xC79D5F; // Same as globe emoji.
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "🙈  The channel is hidden now";
    }

    protected getDescription() {
        return "Please be aware that only granted users can see your channel.\n\n" +
            DynamicChannelPermissionsHiddenEmbed.vars.allowedUsersDisplay + "\n" +
            DynamicChannelPermissionsHiddenEmbed.vars.message;
    }

    protected getOptions() {
        const {
            messageDefault,
            messageAccessNotAvailable,

            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsHiddenEmbed.vars;

        return {
            "message": {
                [ messageDefault ]: "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
                [ messageAccessNotAvailable ]: "There is no way to grant access to your channel for new members.\n\n" +
                "This is because the **(👥 Access)** Button has been disabled by the administrator",
            },

            "allowedUsersDisplay": {
                [ allowedUsersDefault ]: "Currently no other user has access except you.\n",
                [ allowedUsers ]: "**_Allowed users_**: \n" + `${ allowedUsers }\n`,
            }
        };
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsHiddenEmbed.vars;

        return {
            allowedUsers: {
                format: `- <@${ value }>${ separator }`,
                separator: "\n",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {}, {
            messageDefault,
            messageAccessNotAvailable,

            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsHiddenEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        if ( args.dynamicChannelButtonsIsAccessButtonAvailable ) {
            result.message = messageDefault;
        } else {
            result.message = messageAccessNotAvailable;
        }

        return result;
    }
}
