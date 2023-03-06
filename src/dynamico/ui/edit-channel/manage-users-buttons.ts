import {
    ButtonStyle,
    ChannelType,
    Interaction,
    VoiceChannel
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "@dynamico/ui/base/ui-base";

import guiManager from "@dynamico/managers/gui";

export default class ManageUsersButtons extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/ManageUsersButtons";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getBuilders( interaction: Interaction ) {
        const publicButton = this.getButtonBuilder( this.makeChannelPublic.bind( this ) ),
            privateButton = this.getButtonBuilder( this.makeChannelPrivate.bind( this ) ),
            usersButton = this.getButtonBuilder( this.displayManageUsers.bind( this ) ),
            specialButton = this.getButtonBuilder( async () => {} );

        publicButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🌐" )
            .setLabel( "Public" );

        privateButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🚫" )
            .setLabel( "Private" );

        usersButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "👥" )
            .setLabel( "Manage Users" );

        specialButton
            .setStyle( ButtonStyle.Primary )
            .setEmoji( "🌟" )
            .setLabel( "Special Channel" )
            .setDisabled( true );

        return [
            [ publicButton, privateButton, usersButton ],
            [ specialButton ]
        ];
    }

    private async makeChannelPublic( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // Set connect permissions for @everyone to false.
            // TODO: If user set basic roles, then we apply all the changes for each basicRole, except for @everyone.
            await dynamicChannel.permissionOverwrites.create( interaction.guildId, {
                Connect: true,
            } );

            await guiManager.continuesMessage( interaction, "Channel is public now." );
        }
    }

    private async makeChannelPrivate( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.guildId && interaction.isButton() ) {
            const dynamicChannel = interaction.channel as VoiceChannel;

            // If user didn't set any basic roles, then we apply the changes on @everyone.
            // TODO: If user set basic roles, then we apply all the changes for each basicRole, except for @everyone.
            await dynamicChannel.permissionOverwrites.create( interaction.guildId, {
                Connect: false,
            } );

            await guiManager.continuesMessage( interaction, "Channel is private now." );
        }
    }

    private async displayManageUsers( interaction: Interaction ) {
        if ( interaction.channel?.type === ChannelType.GuildVoice && interaction.isButton() ) {
            const message = guiManager
                .get( "Dynamico/UI/EditChannel/ManageUsers" )
                .getMessage( interaction );

            await guiManager.continuesMessage( interaction, false, [], message.components );
        }
    }
}
