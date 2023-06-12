import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import {
    DynamicChannelPermissionsDenyMenu,
    DynamicChannelPermissionsGrantMenu
} from "@vertix/ui-v2/dynamic-channel/permissions/elements";

export class DynamicChannelPermissionsAccessElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAccessElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelPermissionsGrantMenu ],
            [ DynamicChannelPermissionsDenyMenu ],
        ];
    }
}