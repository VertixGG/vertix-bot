import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class NotYourChannelEmbed extends UIEmbedBase {
    private static vars = {
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    };

    public static getName() {
        return "Vertix/UI-V2/NotYourChannelEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle(): string {
        return "⛔  This is not your channel!";
    }

    protected getDescription(): string {
        return "But you can open your own channel :)\n" +
            `\n Just click here: <#${ NotYourChannelEmbed.vars.masterChannelId }>`;
    }

    protected getColor(): number {
        return 0xFF5202;
    }

    protected getLogic( args?: UIArgs ) {
        return {
            masterChannelId: args?.masterChannelId,
        };
    }
}
