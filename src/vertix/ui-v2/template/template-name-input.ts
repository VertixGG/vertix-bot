import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";

import { UIInputStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE } from "@vertix/definitions/master-channel";

export class TemplateNameInput extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V2/TemplateNameInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "SET DEFAULT DYNAMIC CHANNELS NAME";
    }

    protected async getPlaceholder(): Promise<string> {
        return DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.dynamicChannelNameTemplate || DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE;
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 50;
    }
}