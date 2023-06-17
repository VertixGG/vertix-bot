import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";

import { UIInputStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class FeedbackInputDescription extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackInputDescription";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Description";
    }

    protected async getMinLength(): Promise<number> {
        return 10;
    }

    protected async getMaxLength(): Promise<number> {
        return 2000;
    }
}
