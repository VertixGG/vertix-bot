import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

/**
 * Show for each dynamic channel, as primary message.
 */
export class DynamicChannelEmbed extends UIEmbedBase {
    private static vars: any = {
        name: uiUtilsWrapAsTemplate( "name" ),
        limit: uiUtilsWrapAsTemplate( "limit" ),
        state: uiUtilsWrapAsTemplate( "state" ),

        limitDisplayValue: uiUtilsWrapAsTemplate( "limitDisplayValue" ),
        limitDisplayUnlimited: uiUtilsWrapAsTemplate( "limitDisplayUnlimited" ),
        limitValue: uiUtilsWrapAsTemplate( "limitValue" ),

        statePublic: uiUtilsWrapAsTemplate( "statePublic" ),
        statePrivate: uiUtilsWrapAsTemplate( "statePrivate" ),

        visibilityState: uiUtilsWrapAsTemplate( "visibilityState" ),
        visibilityStateShown: uiUtilsWrapAsTemplate( "visibilityStateShown" ),
        visibilityStateHidden: uiUtilsWrapAsTemplate( "visibilityStateHidden" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle(): string {
        return "༄ Manage your Dynamic Channel";
    }

    protected getDescription(): string {
        const { name, limit, state, visibilityState } = DynamicChannelEmbed.vars;

        return "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
            "Please be advised that the privilege to make alterations is vested solely of the channel owner.\n\n" +
            "_Current settings_:\n" +
            `- Name: **${ name }**\n` +
            `- User Limit: ✋ **${ limit }**\n` +
            `- State: ${ state }\n` +
            `- Visibility State: ${ visibilityState }`;
    }

    protected getOptions() {
        return {
            limit: {
                [ DynamicChannelEmbed.vars.limitDisplayValue ]: DynamicChannelEmbed.vars.limitValue,
                [ DynamicChannelEmbed.vars.limitDisplayUnlimited ]: "Unlimited",
            },
            state: {
                [ DynamicChannelEmbed.vars.statePublic ]: "🌐 **Public**",
                [ DynamicChannelEmbed.vars.statePrivate ]: "🚫 **Private**",
            },
            visibilityState: {
                [ DynamicChannelEmbed.vars.visibilityStateShown ]: "🐵 **Shown**",
                [ DynamicChannelEmbed.vars.visibilityStateHidden ]: "🙈 **Hidden**",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const {
            limitDisplayValue,
            limitDisplayUnlimited,

            statePublic,
            statePrivate,

            visibilityStateShown,
            visibilityStateHidden,
        } = DynamicChannelEmbed.vars;

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,

            state: args.isPrivate ? statePrivate : statePublic,
            visibilityState: args.isHidden ? visibilityStateHidden : visibilityStateShown,

            limitValue: args.userLimit,
        };
    }
}
