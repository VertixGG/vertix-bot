import { EmbedBuilder } from "discord.js";

import ComponentUIBase from "./base/component-ui-base";

import EditChannelButtons from "./edit-channel/buttons";
import EditChannelMenus from "./edit-channel/menus";

export default class EditChannelUI extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel";
    }

    getEmbeds() {
        const embed = new EmbedBuilder();

        embed.setTitle( "Manage your Dynamic Channel" );
        embed.setDescription( "Here you can manage your voice channel and edit it as you see fit.\n" +
            "You must be connected to the voice channel in order to edit it." );

        return [ embed ];
    }

    getInternalComponents() {
        return [
            EditChannelButtons,
            EditChannelMenus
        ];
    }
}
