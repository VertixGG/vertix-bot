import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-definitions";

export class DynamicChannelMetaLimitInput extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<"short"> {
        return "short";
    }

    public async getLabel() {
        return "SET USER LIMIT (0 FOR UNLIMITED)";
    }

    protected async getPlaceholder() {
        return `${ DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH } - ${ DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH }`;
    }

    protected async getValue() {
        return this.uiArgs?.userLimit || 0;
    }

    protected async getMinLength() {
        return DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH;
    }

    protected async getMaxLength() {
        return DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH;
    }
}
