import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaClearChatButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatButton";
    }

    public getId() {
        return 2;
    }

    public getSortId() {
        return 2;
    }

    public getLabelForEmbed() {
        return "🧹 ∙ **Clear Chat**";
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "Clear Chat" );
    }

    public async getEmoji(): Promise<string> {
        return "🧹";
    }
}
