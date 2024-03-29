import { VerifiedRolesEmbed } from "@vertix/ui-v2/verified-roles/verified-roles-embed";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class SetupStep3Embed extends VerifiedRolesEmbed {
    public static getName() {
        return "Vertix/UI-V2/SetupStep3Embed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle(): string {
        return "Step 3 - Select Verified Roles";
    }

    protected getDescription() {
        return "Select the roles whose permissions will be impacted by the state of Dynamic Channel's.\n\n" +
            "Verified roles are not used in most cases, almost all the servers use the default settings.\n\n" +
            "Not sure how it works?, check out the [explanation](https://vertix.gg/setup/3).\n\n" +

            "**_🛡️ Verified Roles_**\n\n" +
            "> " + super.getDescription() + "\n\n" +

            "You can keep the default settings by pressing **( `✓ Finish` )** button.";
    }
}
