import { DynamicChannelPremiumResetChannelEmbed } from "./dynamic-channel-premium-reset-channel-embed";

import { DynamicChannelPremiumResetChannelButton } from "./dynamic-channel-premium-reset-channel-button";

import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { SomethingWentWrongEmbed } from "@vertix/ui-v2/_general/something-went-wrong-embed";

export class DynamicChannelPremiumResetChannelComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPremiumResetChannelComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelPremiumResetChannelButton ) ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPremiumResetChannelEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
