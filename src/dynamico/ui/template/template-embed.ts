import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";
import { DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME } from "@dynamico/constants/master-channel";

// TODO: This embed considered to be best practice, all embeds should be like this.
// TODO: If it possible, make an common logic for all embeds.

export class TemplateEmbed extends UIEmbed {
    private vars: any;

    public static getName() {
        return "Dynamico/UI/TemplateEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            channelNameTemplate: uiUtilsWrapAsTemplate( "channelNameTemplate" ),
            channelNameTemplateDefault: uiUtilsWrapAsTemplate( "channelNameTemplateDefault" ),
            channelNameTemplateState: uiUtilsWrapAsTemplate( "channelNameTemplateState" ),
        };
    }

    protected getTitle() {
        return "Step 1 - Set dynamic channels name";
    }

    protected getDescription() {
        return "Here you can set a default name for dynamic channels.\n" +
            "You can keep the current default channels name by pressing the \"Next\" button.\n\n" +
            "**Current default name:**\n" +
            "`" + this.vars.channelNameTemplateState + "`";
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }

    protected getArgsFields() {
        return [
            "channelNameTemplate",
        ];
    }

    protected getLogicFields() {
        return [
            "channelNameTemplateState",
        ];
    }

    protected getFieldOptions(): any {
        return {
            channelNameTemplateState: {
               [ this.vars.channelNameTemplate ]: this.vars.channelNameTemplate,
               [ this.vars.channelNameTemplateDefault ]: DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
            }
        };
    }

    protected async getFieldsLogic( interaction?: null, args?: any ) {
        const result: any = {};

        if ( args.channelNameTemplate?.length ) {
            result.channelNameTemplateState = this.vars.channelNameTemplate;
        } else {
            result.channelNameTemplateState = this.vars.channelNameTemplateDefault;
        }

        return result;
    }
}
