import { Interaction, RoleSelectMenuInteraction } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

import UIElement from "@dynamico/ui/base/ui-element";

import Logger from "@internal/modules/logger";

export default class SelectBasicRoleMenu extends UIElement {
    private static _logger: Logger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/SetBasicRole/SelectBasicRole";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const selectRole = this.getRoleMenuBuilder( this.onClick.bind( this ) );

        selectRole.setPlaceholder( "🛡️ Choose basic roles" );
        selectRole.setMinValues( 0 );
        selectRole.setMaxValues( 5 );

        return [ selectRole ];
    }

    private async onClick( interaction: RoleSelectMenuInteraction ) {
        SelectBasicRoleMenu._logger.debug( this.onClick,
            `Selected roles: '${ interaction.values.join( ", " ) }'`
        );

        await guiManager.get( "Dynamico/UI/SetupProcess" )
            .sendContinues( interaction, {
                _step: 2,
                basicRoles: interaction.values.length ? interaction.values : undefined,
            } );
    }
}
