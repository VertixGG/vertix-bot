import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { SetupStep3Embed } from "@vertix/ui-v2/setup-new/step-3/setup-step-3-embed";

import { VerifiedRolesMenu } from "@vertix/ui-v2/verified-roles/verified-roles-menu";
import { VerifiedRolesEveryoneSelectMenu } from "@vertix/ui-v2/verified-roles/verified-roles-everyone-select-menu";

export class SetupStep3Component extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupStep3Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ],
        ];
    }

    public static getEmbeds() {
        return [
            SetupStep3Embed,
        ];
    }

}
