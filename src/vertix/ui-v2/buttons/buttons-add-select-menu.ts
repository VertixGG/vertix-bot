import { ButtonsSelectMenuBase } from "@vertix/ui-v2/buttons/buttons-select-menu-base";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

export class ButtonsAddSelectMenu extends ButtonsSelectMenuBase {
    public static getName() {
        return "Vertix/UI-V2/ButtonsAddSelectMenu";
    }

    protected async getPlaceholder(): Promise<string> {
        return "＋ Add Button";
    }

    protected async getSelectOptions() {
        return super.getSelectOptions( false );
    }

    protected async isAvailable(): Promise<boolean> {
        return Object.keys( this.uiArgs?.dynamicChannelButtonsTemplate || {} ).length !== DynamicChannelElementsGroup.getAllItems().length;
    }
}
