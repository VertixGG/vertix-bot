import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaClearChatButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatButton";
    }

    public getId() {
        return 2;
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getEmoji() + " " + await this.getLabel();
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Clear Chat" );
    }

    public async getEmoji(): Promise<string> {
        return "🧹";
    }
}