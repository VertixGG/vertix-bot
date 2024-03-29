import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedElapsedTimeBase } from "@vertix/ui-v2/_base/ui-embed-time-elapsed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix/definitions/app";

export class DynamicChannelMetaRenameLimitedEmbed extends UIEmbedElapsedTimeBase {
    private static vars = {
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
        masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
        masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameLimitedEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime( args: UIArgs ): Date {
        return new Date( Date.now() + args.retryAfter * 1000 );
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle(): string {
        return "🙅 You renamed your channel too fast!";
    }

    protected getDescription(): string {
        return `Please wait \`${ this.getElapsedTimeFormatFractionVariable() }\` until the next rename` +
            DynamicChannelMetaRenameLimitedEmbed.vars.masterChannelMessage;
    }

    protected getOptions() {
        const {
            masterChannelId,
            masterChannelMessageDefault,
        } = DynamicChannelMetaRenameLimitedEmbed.vars;

        return {
            masterChannelMessage: {
                [ masterChannelId ]: ` or open a new channel: <#${ masterChannelId }>`,

                [ masterChannelMessageDefault ]: "",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {};

        if ( args.masterChannelId ) {
            result.masterChannelId = args.masterChannelId;
            result.masterChannelMessage = DynamicChannelMetaRenameLimitedEmbed.vars.masterChannelId;
        } else {
            result.masterChannelMessage = DynamicChannelMetaRenameLimitedEmbed.vars.masterChannelMessageDefault;
        }

        return result;
    }
}
