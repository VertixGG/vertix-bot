import {
    ActionRowBuilder,
    ButtonBuilder,
    ComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";

import UIBase from "@dynamico/ui/base/ui-base";

import { guiManager } from "@dynamico/managers";

import { BaseInteractionTypes, CallbackUIType, DYNAMICO_UI_ELEMENT } from "@dynamico/interfaces/ui";

import Logger from "@internal/modules/logger";

import { ForceMethodImplementation } from "@internal/errors";

export default class UIElement extends UIBase {
    protected static logger: Logger = new Logger( this );

    public interaction?: BaseInteractionTypes; // TODO Try to remove this or make it private.

    protected parent?: UIElement;

    private builtRows: ActionRowBuilder<any>[] = [];

    public static getName() {
        return DYNAMICO_UI_ELEMENT;
    }

    public constructor( interaction?: BaseInteractionTypes, args? : any  ) {
        super( interaction, args );

        if ( this.getName() === UIElement.getName() ) {
            return;
        }

        if ( interaction ) {
            this.interaction = interaction;
        }

        if ( args._parent ) {
            this.parent = args._parent;
        }
    }

    protected load( interaction?: BaseInteractionTypes ) {
        return this.build( interaction, this.args );
    }

    protected getButtonBuilder( callback: CallbackUIType ) {
        const button = new ButtonBuilder();

        this.setCallback( button, callback );

        return button;
    }

    protected getMenuBuilder( callback: ( interaction: SelectMenuInteraction ) => Promise<void> ) {
        const menu = new StringSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getUserMenuBuilder( callback: ( interaction: UserSelectMenuInteraction ) => Promise<void> ) {
        const menu = new UserSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getInputBuilder( callback?: CallbackUIType ) {
        const input = new TextInputBuilder();

        if ( callback ) {
            this.setCallback( input, callback );
        }

        return input;
    }

    protected getModalBuilder( callback: ( interaction: ModalSubmitInteraction ) => Promise<void> ) {
        const modal = new ModalBuilder();

        this.setCallback( modal, callback );

        return modal;
    }

    protected async getBuilders( interaction?: BaseInteractionTypes, args?: any ): Promise<ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[]> {
        throw new ForceMethodImplementation( this, this.getBuilders.name );
    }

    public async build( interaction?: BaseInteractionTypes, args?: any ) {
        UIElement.logger.debug( this.build, `Building UI '${ this.getName() }'` );

        const builders = await this.getBuilders( interaction, args ),
            builtComponents: ActionRowBuilder<any>[] = [];

        // Loop through the builders and build them.
        const isMultiRow = Array.isArray( builders[ 0 ] );

        if ( isMultiRow ) {
            for ( const row of builders ) {
                const actionRow = new ActionRowBuilder<any>();

               builtComponents.push( actionRow.addComponents( row as ComponentBuilder[] ) );
            }
        } else {
            const actionRow = new ActionRowBuilder<any>();

            builtComponents.push( actionRow.addComponents( builders as ComponentBuilder[] ) );
        }

        // Set row type according to the type of the component.
        builtComponents.forEach( ( row ) => {
            row.data.type = 1;
        } );

        this.builtRows = builtComponents;
    }

    public getBuiltRows() {
        return this.builtRows;
    }

    private setCallback( context: ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder | TextInputBuilder | ModalBuilder, callback: Function ) {
        const unique = guiManager.storeCallback( this, callback, this.interaction?.id || "" );

        context.setCustomId( unique );
    }
}
