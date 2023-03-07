import { CallbackUIType, E_UI_TYPES } from "@dynamico/interfaces/ui";
import guiManager from "@dynamico/managers/gui";
import ObjectBase from "@internal/bases/object-base";
import { ForceMethodImplementation } from "@internal/errors";
import Logger from "@internal/modules/logger";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
    NonThreadGuildBasedChannel,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";

export default class UIBase extends ObjectBase {
    private static logger: Logger = new Logger( this );

    private builtRows: ActionRowBuilder<any>[] = [];

    public interaction?: Interaction | NonThreadGuildBasedChannel;

    static getName() {
        return "Dynamico/UI/UIBase";
    }

    static getType(): E_UI_TYPES {
        throw new ForceMethodImplementation( this, this.getType.name );
    }

    constructor( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        super();

        if ( this.getName() === UIBase.getName() ) {
            return;
        }

        if ( interaction ) {
            this.interaction = interaction;
        }

        this.initialize( interaction );
    }

    protected initialize( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        this.build( interaction );
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

    protected getBuilders( interaction?: Interaction | NonThreadGuildBasedChannel ): ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[] {
        throw new ForceMethodImplementation( this, this.getBuilders.name );
    }

    public build( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        UIBase.logger.debug( this.build, `Building UI '${ this.getName() }'` );

        const builders = this.getBuilders( interaction ),
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