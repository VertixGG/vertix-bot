import {
    ButtonStyle,
    Interaction,
} from "discord.js";

import RenameChannelModalUI from "./modals/rename-channel-modal";
import UserlimitChannelModalUI from "./modals/userlimit-channel-modal";

import UIBase from "../base/ui-base";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import guiManager from "@dynamico/managers/gui";

import Logger from "@internal/modules/logger";

export default class MangeChannelButtons extends UIBase {
    private logger: Logger;

    public static getName() {
        return "Dynamico/UI/EditChannel/ManageChannelButtons";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    constructor() {
        super();

        this.logger = new Logger( this );
    }

    getBuilders() {
        const renameButton = this.getButtonBuilder( this.renameChannel.bind( this ) ),
            limitButton = this.getButtonBuilder( this.limitChannel.bind( this ) );

        renameButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✏️" )
            .setLabel( "Rename" );

        limitButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✋" )
            .setLabel( "User Limit" );

        return [ renameButton, limitButton ];
    }

    private async renameChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = guiManager
                .get( RenameChannelModalUI.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( component.getModal( interaction ) );
            }
        }
    }

    private async limitChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = guiManager
                .get( UserlimitChannelModalUI.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( component.getModal( interaction ) );
            }
        }
    }
}
