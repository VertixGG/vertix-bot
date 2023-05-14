import {
    ActionRowBuilder,
    BaseMessageOptions,
    EmbedBuilder,
} from "discord.js";

import { UIBaseInteractionTypes, E_UI_TYPES, IUIGroupAttitude, } from "@dynamico/ui/_base/ui-interfaces";

import UIElement from "@dynamico/ui/_base/ui-element";
import UIGroupBase from "@dynamico/ui/_base/ui-group-base";
import UIEmbed from "@dynamico/ui/_base/ui-embed";

import UIEmbedTemplate from "@dynamico/ui/_base/ui-embed-template";

import Logger from "@internal/modules/logger";

export class UIComponentBase extends UIGroupBase {
    protected static logger: Logger = new Logger( this );

    protected static dynamicElements: typeof UIElement[] = [];
    protected static dynamicComponents: typeof UIComponentBase[] = [];
    protected static dynamicEmbeds: typeof UIEmbed[] = [];

    protected staticElementsInstances: UIElement[];
    protected staticComponentsInstances: UIComponentBase[];
    protected staticEmbedsInstances: UIEmbed[] = [];

    protected embedsTemplates: UIEmbedTemplate[] = [];

    private parent?: UIComponentBase;

    /**
     * Function constructor() :: constructor function for the UIComponentBase class.
     * It initializes the components...
     *
     * @see All UI components instances are created at the start of the application, the dynamic/static terms are used
     * to indicate whether the component is built at the start of the application or dynamically when the user requested.
     */
    public constructor( interaction?: UIBaseInteractionTypes | null, args?: any ) {
        super();

        if ( args?._parent ) {
            this.parent = args._parent;
        }

        this.staticComponentsInstances = [];
        this.staticElementsInstances = [];
    }

    public async getDynamicElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<any[]> {
        return this.buildDynamicElements( interaction, args );
    }

    public async getElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<UIElement[]> {
        const elements: UIElement[] = [];

        elements.push( ... await this.buildComponentElements( interaction, args ) );
        elements.push( ... await this.buildElements( interaction, args ) );

        return elements;
    }

    public async getEmbeds( interaction?: UIBaseInteractionTypes | null, args?: any ): Promise<EmbedBuilder[]> {
        let embeds = [],
            staticThis = this.getStaticThis(),
            dynamicEmbeds = staticThis.dynamicEmbeds,
            templateEmbeds = this.embedsTemplates;

        // Static embeds.
        if ( this.staticEmbedsInstances?.length ) {
            embeds.push( ... this.staticEmbedsInstances );
        }

        // Dynamic embeds.
        if ( dynamicEmbeds?.length ) {
            dynamicEmbeds.forEach( ( EmbedClass ) => {
                embeds.push( new EmbedClass( interaction, args ) );
            } );
        }

        // Template embeds.
        const builtTemplatesEmbeds: EmbedBuilder[] = [];

        if ( templateEmbeds?.length ) {
            await Promise.all(
                templateEmbeds.map( async ( embed ) => {
                    builtTemplatesEmbeds.push( await embed.build( interaction, args ) );
                } )
            );
        }

        return [
            ... await Promise.all(
                embeds.map( async ( embed ) => await embed.buildEmbed( interaction, args ) )
            ),
            ... builtTemplatesEmbeds,
        ];
    }

    public async getMessage( interaction: UIBaseInteractionTypes, args?: any ): Promise<BaseMessageOptions> {
        const builtComponents = await this.getActionRows( interaction, args ),
            embeds = await this.getEmbeds( interaction, args ),
            result: BaseMessageOptions = {};

        if ( builtComponents?.length ) {
            result.components = builtComponents;
        }

        if ( embeds?.length ) {
            result.embeds = embeds;
        }

        return result;
    }

    protected getStaticThis(): typeof UIComponentBase {
        return ( this.constructor as typeof UIComponentBase );
    }

    protected getExtendedAttitude( customId: string ): IUIGroupAttitude | null {
        // Try to find a attitude via customId.
        const namespace = customId.split( ":" )?.[ 0 ],
            // Try to find the namespace in internal components.
            internalElement = this.getInternalElements().find( ( element ) => element.getName() === namespace );

        if ( internalElement ) {
            // # CRITICAL:
            const belongsTo = internalElement.belongsTo(),
                groups = internalElement.groups();

            if ( belongsTo.length || groups.length ) {
                return {
                    belongsTo,
                    groups
                };
            }
        }

        return null;
    }

    /**
     * Function getInternalComponents() :: a method that returns the internal components for the UI.
     * It is an abstract method that needs to be implemented by the child class.
     */
    protected getInternalComponents(): typeof UIComponentBase[] {
        return [];
    }

    /**
     * Function getInternalElements() :: a method that returns the internal elements for the UI.
     * It is an abstract method that needs to be implemented by the child class.
     */
    protected getInternalElements(): typeof UIElement[] {
        return [];
    }

    /**
     * Function getInternalEmbeds() :: a method that returns the internal embeds for the UI.
     * It is an abstract method that needs to be implemented by the child class.
     */
    protected getInternalEmbeds(): typeof UIEmbed[] {
        return [];
    }

    protected async getEmbedTemplates(): Promise<UIEmbedTemplate[]> {
        return [];
    }

    /**
     * Function load() :: a method that loads the UI.
     */
    protected async load() {
        UIComponentBase.logger.debug( this.load, `Loading UIComponent: '${ this.getName() }'` );

        return await this.storeEntities();
    }

    /**
     * Function pulse() :: a method that is being called from within the inner components.
     */
    protected async pulse?( interaction: UIBaseInteractionTypes, args: any ) {
        // If there is parent pulse method, call it.
        if ( this.parent?.pulse ) {
            await this.parent.pulse( interaction, args );
        }
    }

    /**
     * Function storeEntities() :: a method that stores UI entities.
     */
    private async storeEntities() {
        const embeds = this.getInternalEmbeds(),
            embedsTemplates = await this.getEmbedTemplates(),
            elements = this.getInternalElements(),
            components = this.getInternalComponents(),
            // ---
            staticElements = elements?.filter( ( element ) => E_UI_TYPES.STATIC === element.getType() ),
            staticComponents = components?.filter( ( component ) => E_UI_TYPES.STATIC === component.getType() ),
            staticEmbeds = embeds?.filter( ( embed ) => E_UI_TYPES.STATIC === embed.getType() ),
            // ---
            dynamicElements = elements?.filter( ( element ) => E_UI_TYPES.DYNAMIC === element.getType() ),
            dynamicComponents = components?.filter( ( component ) => E_UI_TYPES.DYNAMIC === component.getType() ),
            dynamicEmbeds = embeds?.filter( ( embed ) => E_UI_TYPES.DYNAMIC === embed.getType() ),
            // ---
            staticThis = this.getStaticThis();

        // Static elements.
        if ( staticElements?.length ) {
            this.staticElementsInstances.push( ... await this.createElements( staticElements ) );
        }

        // Dynamic elements.
        if ( dynamicElements?.length ) {
            staticThis.dynamicElements = dynamicElements;
        }

        // Static components.
        if ( staticComponents?.length ) {
            staticComponents.forEach( ( ComponentClass ) => {
                this.staticComponentsInstances.push( new ComponentClass( null, { _parent: this } ) );
            } );
        }

        // Static embeds.
        if ( staticEmbeds?.length ) {
            staticEmbeds.forEach( ( EmbedClass ) => {
                this.staticEmbedsInstances.push( new EmbedClass( null, { _parent: this } ) );
            } );
        }

        // Dynamic components.
        if ( dynamicComponents?.length ) {
            staticThis.dynamicComponents = dynamicComponents;
        }

        // Dynamic embeds.
        if ( dynamicEmbeds?.length ) {
            staticThis.dynamicEmbeds = dynamicEmbeds;
        }

        // Template embeds.
        if ( embedsTemplates?.length ) {
            this.embedsTemplates = embedsTemplates;
        }

        // If every variable is empty, throw an error.
        const all = [ staticElements, staticComponents, staticEmbeds, dynamicElements, dynamicComponents, dynamicEmbeds, embedsTemplates ];

        if ( ! ( this instanceof UIEmbed ) && all.every( ( instance ) => ! instance?.length ) ) {
            throw new Error( "No UI elements were found." );
        }
    }

    private async buildElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<UIElement[]> {
        const elements = [];

        // Static elements.
        if ( this.staticElementsInstances?.length ) {
            elements.push( ... this.staticElementsInstances );
        }

        // Dynamic elements.
        elements.push( ... await this.buildDynamicElements( interaction, args ) );

        return elements;
    }

    private async buildDynamicElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<UIElement[]> {
        const elements = [],
            staticThis = this.getStaticThis(),
            dynamicElements = staticThis.dynamicElements;

        // Dynamic elements.
        if ( dynamicElements?.length ) {
            elements.push( ... await this.createElements( dynamicElements, interaction, args ) );
        }

        return elements;
    }

    private async buildComponentElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<UIElement[]> {
        const elements: any[] = [];

        await Promise.all( this.staticComponentsInstances?.map( async ( component ) => {
            elements.push( ... await component.buildElements( interaction, args ) );
        } ) );

        await Promise.all( ( await this.createDynamicComponents( interaction, args ) ).map( async ( component ) => {
            elements.push( ... await component.buildElements( interaction, args ) );
        } ) );

        return elements;
    }

    private async createDynamicComponents( interaction?: UIBaseInteractionTypes, args?: any ): Promise<UIComponentBase[]> {
        const result: any[] = [],
            staticThis = this.getStaticThis(),
            dynamicComponents = staticThis.dynamicComponents;

        if ( dynamicComponents?.length ) {
            await Promise.all( dynamicComponents.map( async ( DynamicComponent ) => {
                const component = new DynamicComponent();

                await component.waitUntilLoaded();

                result.push( component );
            } ) );
        }

        return result;
    }

    private async createElements( elements: typeof UIElement[], interaction?: UIBaseInteractionTypes, args: any = {} ): Promise<UIElement[]> {
        const result: any = [];

        for ( const component of elements ) {
            args._parent = this;

            const instance = new component( interaction, args );

            await instance.waitUntilLoaded();

            result.push( instance );
        }

        return result;
    }

    private async getActionRows( interaction?: UIBaseInteractionTypes, args?: any ): Promise<ActionRowBuilder<any>[]> {
        const elements = [];

        elements.push( ... await this.getElements( interaction, args ) );

        const builtElements = [];

        for ( const uiElements of elements ) {
            const builtComponent = uiElements.getBuiltRows();

            if ( Array.isArray( builtComponent ) ) {
                builtElements.push( ... builtComponent );
            }
        }

        return builtElements;
    }
}

export default UIComponentBase;
