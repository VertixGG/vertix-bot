import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class ButtonsEmbed extends UIEmbedBase {
    private static _vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ButtonsEmbed";
    }

    protected getDescription(): string {
        return ButtonsEmbed._vars.dynamicChannelButtonsTemplate;
    }

    protected getArrayOptions() {
        // TODO: Use real data.
        return {
            dynamicChannelButtonsTemplate: {
                format: `- ( ${ ButtonsEmbed._vars.value } )${ ButtonsEmbed._vars.separator }`,
                separator: "\n",
                options: {
                    0: "✏️ ∙ **Rename**",
                    1: "✋ ∙ **User Limit**",
                    2: "🧹 ∙ **Clear Chat**",

                    3: "🚫 ∙ **Private** / 🌐 ∙ **Public**",
                    4: "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
                    5: "👥 ∙ **Access**",

                    6: "🔃 ∙ **Reset Channel**",
                    7: "😈 ∙ **Claim Channel**",
                }
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate,
        };
    }
}

