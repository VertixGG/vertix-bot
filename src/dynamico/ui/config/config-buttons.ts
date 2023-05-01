import { Channel } from ".prisma/client";

import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Guild,
    Interaction,
} from "discord.js";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { guildGetBadwordsFormatted, guildSetBadwords } from "@dynamico/utils/guild";
import { badwordsNormalizeArray, badwordsSplitOrDefault } from "@dynamico/utils/badwords";
import { masterChannelGetDynamicChannelNameTemplate, masterChannelSetSettingsData } from "@dynamico/utils/master-channel";

import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
} from "@dynamico/constants/master-channel";

import { channelManager, guiManager } from "@dynamico/managers";

import Logger from "@internal/modules/logger";

interface IConfigButtonsArgs {
    masterChannels: Channel[];
    badwords: string;
}

// TODO: This considered to be best practice, all other should be like this.

export class ConfigButtons extends UIElement {
    protected static dedicatedLogger: Logger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/ConfigButtons";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction, args: IConfigButtonsArgs ) {
        const editMasterChannelButtons: ButtonBuilder[] = [];

        let index = 0;

        if ( args.masterChannels.length ) {
            args.masterChannels.forEach( () => {
                ++index;

                const callback = async ( interaction: Interaction ) =>
                        this.onNameModifyClick( interaction as ButtonInteraction, args );

                const button = this.getButtonBuilder( callback, index.toString() ),
                    indexString = args.masterChannels.length > 9 ? index.toString().padStart( 2, "0" ) : index.toString();

                button.setEmoji( "✏️" );
                button.setLabel( `Master Channel #${ indexString }` );
                button.setStyle( ButtonStyle.Secondary );

                editMasterChannelButtons.push( button );
            } );
        }

        const callback = async ( interaction: Interaction ) =>
                this.onModifyBadwordsClick( interaction as ButtonInteraction, args );

        const modifyBadwords = this.getButtonBuilder( callback );

        modifyBadwords.setEmoji( "🙅" );
        modifyBadwords.setLabel( "Modify Bad Words" );
        modifyBadwords.setStyle( ButtonStyle.Primary );

        const result = [];

        if ( editMasterChannelButtons.length ) {
            // Limit buttons to 3 per row.
            for ( let i = 0; i < editMasterChannelButtons.length; i += 3 ) {
                result.push( editMasterChannelButtons.slice( i, i + 3 ) );
            }
        }

        result.push( [ modifyBadwords ] );

        return result;
    }

    private async onNameModifyClick( interaction: ButtonInteraction, args: IConfigButtonsArgs ) {
        // Extract anything after '>' from `interaction.customId`.
        const channelIndex = parseInt( interaction.customId.split( ">" )[ 1 ] ),
            component = guiManager
                .get( "Dynamico/UI/Temp/SetMasterConfig/EditTemplateModal" );

        component.setArg( "onTemplateModified", this.onNameModified.bind( this ) );
        component.setArg( "channelIndex", channelIndex );
        component.setArg( "channelNameTemplate",
            this.args.masterChannels[ channelIndex - 1 ].data[ 0 ].object.dynamicChannelNameTemplate
        );

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }

    private async onNameModified( interaction: ButtonInteraction, args: any ) {
        const masterChannelId = this.args.masterChannels[ args.channelIndex - 1 ].id,
            previousName = await masterChannelGetDynamicChannelNameTemplate( masterChannelId, true ),
            newName = args.channelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME;

        await masterChannelSetSettingsData( masterChannelId, { dynamicChannelNameTemplate: newName } );

        ConfigButtons.dedicatedLogger.admin( this.onNameModified,
            `🔧 Dynamic Channels Name has been modified - "${ previousName }" -> "${ newName }" (${ interaction.guild?.name })`
        );

        await guiManager.get( "Dynamico/UI/ConfigComponent" )
            .sendContinues( interaction, {
                badwords: args.badwords || await guildGetBadwordsFormatted( interaction.guildId as string ),
                masterChannels: await channelManager.getMasterCreateChannels( interaction.guildId as string, true )
            } );
    }

    private async onModifyBadwordsClick( interaction: ButtonInteraction, args: IConfigButtonsArgs ) {
        const component = guiManager
            .get( "Dynamico/UI/Temp/SetBadwordsConfig/EditBadwordsModal" );

        if ( undefined !== typeof this.args.badwords ) {
            component.setArg( "badwords", this.args.badwords );
        }

        component.setArg( "onBadwordsModified", this.onBadwordsModified.bind( this ) );

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }

    private async onBadwordsModified( interaction: ButtonInteraction, args: any ) {
        const oldBadwords = await guildGetBadwordsFormatted( interaction.guildId as string ),
            newBadwords = badwordsNormalizeArray( badwordsSplitOrDefault( args.badwords ) )
                .map( ( word ) => word.trim() );

        await guildSetBadwords( interaction.guild as Guild, newBadwords );

        ConfigButtons.dedicatedLogger.admin( this.onBadwordsModified,
            `🔧 Bad Words filter has been modified - "${ oldBadwords }" -> "${ newBadwords }" (${ interaction.guild?.name })`
        );

        await guiManager.get( "Dynamico/UI/ConfigComponent" )
            .sendContinues( interaction, {
                badwords: await guildGetBadwordsFormatted( interaction.guildId as string ),
                masterChannels: await channelManager.getMasterCreateChannels( interaction.guildId as string, true )
            } );
    }
}