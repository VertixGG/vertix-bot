import {
    ChannelType,
    Interaction,
    OverwriteType,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "@dynamico/ui/base/ui-base";

import guiManager from "@dynamico/managers/gui";

export default class ManageUsersMenus extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/MangeUsersMenus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getBuilders( interaction: Interaction ) {
        const grantMenu = this.getUserMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setMaxValues( 1 );
        grantMenu.setMinValues( 0 );

        removeMenu.setPlaceholder( "👇 Remove User From List" );

        const members: { label: string; value: string; }[] = [];

        // Add all users in channel to grant menu.
        if ( interaction.channel && ChannelType.GuildVoice === interaction.channel.type ) {
            interaction.channel.permissionOverwrites.cache.map( ( ( permission ) => {
                if ( permission.type === OverwriteType.Member ) {
                    const member = interaction.guild?.members.cache.get( permission.id );

                    if ( member ) {
                        members.push( {
                            label: member.displayName,
                            value: member.id,
                        } );
                    }
                }
            } ) );
        }

        removeMenu.setOptions( members );

        return [
            [ grantMenu ],
            [ removeMenu ],
        ];
    }

    private async grantUser( interaction: UserSelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            if ( member ) {
                await channel.permissionOverwrites.create( member, {
                    ViewChannel: true,
                    Connect: true,
                } );

                const dynamicChannel = interaction.channel as VoiceChannel;

                const component = guiManager.get( "Dynamico/UI/EditChannel/ManageUsers" );
                const message = component.getMessage( interaction );

                await guiManager.continuesMessage( interaction, false, [], message.components );
            } else {
                await guiManager.continuesMessage( interaction,
                    `Could not find user with id '${ interaction.values[ 0 ] }'`, );
            }
        }
    }

    private async removeUser( interaction: SelectMenuInteraction ) {
        if ( interaction.values.length === 0 ) {
            await interaction.deferUpdate( {} );

            return;
        }

        if ( ChannelType.GuildVoice === interaction.channel?.type && interaction ) {
            const channel = interaction.channel as VoiceChannel,
                member = interaction.client.users.cache.get( interaction.values[ 0 ] );

            // If user tries to remove himself, then we just ignore it.
            if ( member?.id === interaction.user.id ) {
                const component = guiManager.get( "Dynamico/UI/EditChannel/ManageUsers" );
                const message = component.getMessage( interaction );

                await guiManager.continuesMessage( interaction, false, [], message.components );
            } else if ( member ) {
                await channel.permissionOverwrites.delete( member );

                const dynamicChannel = interaction.channel as VoiceChannel;

                const component = guiManager.get( "Dynamico/UI/EditChannel/ManageUsers" );
                const message = component.getMessage( interaction );

                await guiManager.continuesMessage( interaction, false, [], message.components );
            } else {
                await guiManager.continuesMessage( interaction,
                    `Could not find user with id '${ interaction.values[ 0 ] }'`, );
            }
        }
    }
}
