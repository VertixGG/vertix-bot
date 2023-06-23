import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPremiumResetChannelButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPremiumResetChannelButton";
    }

    public getId() {
        return 6;
    }

    public getSortId() {
        return 6;
    }

    public getLabelForEmbed() {
        return "🔃 ∙ **Reset**";
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "Reset" );
    }

    public getEmoji(): Promise<string> {
        return Promise.resolve( "🔃" );
    }
}
