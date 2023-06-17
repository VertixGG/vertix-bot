import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";

import { UIInputStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { DEFAULT_BADWORDS_PLACEHOLDER } from "@vertix/definitions/badwords";

export class BadwordsInput extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V2/BadwordsInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "SEPARATE BY `,` FOR NON-EXACT MATCHES USE `*`";
    }

    protected async getPlaceholder(): Promise<string> {
        return DEFAULT_BADWORDS_PLACEHOLDER;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.badwords.join( ", " )  || "";
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 2500;
    }
}
