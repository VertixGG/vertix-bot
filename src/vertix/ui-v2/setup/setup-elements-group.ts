import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";

import { ISetupArgs, MAX_EDIT_MASTER_BUTTONS_PER_ROW } from "@vertix/ui-v2/setup/setup-definitions";

import { UIArgs, UIEntitySchemaBase } from "@vertix/ui-v2/_base/ui-definitions";

import { SetupMasterEditButton } from "@vertix/ui-v2/setup/setup-master-edit-button";
import { SetupMasterCreateButton } from "@vertix/ui-v2/setup/setup-master-create-button";
import { BadwordsEditButton } from "@vertix/ui-v2/badwords/badwords-edit-button";
import { LanguageChooseButton } from "@vertix/ui-v2/language/language-choose-button";

export class SetupElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/SetupElementsGroup";
    }

    public static getItems( args?: ISetupArgs ) {
        const result: typeof UIElementButtonBase[][] = [];

        let masterButtons: typeof UIElementButtonBase[] = [];

        // TODO: Called too many times.
        if ( args?.masterChannels.length ) {
            masterButtons = args.masterChannels.map( ( channel, index ) => {
                return class extends SetupMasterEditButton {
                    public static getName() {
                        return `${ super.getName() }:${ index }`; // TODO: Use constant for separator.
                    }

                    public async build( uiArgs?: UIArgs ): Promise<UIEntitySchemaBase> {
                        uiArgs = Object.assign( {}, uiArgs ); // TODO: Check if it's needed.

                        uiArgs.index = index + 1;

                        return super.build( uiArgs );
                    }
                };
            } );
        } else {
            // TODO: Find better solution, so the system will acknowledge that its dynamic button.
            masterButtons = [ SetupMasterEditButton ];
        }

        masterButtons.push( SetupMasterCreateButton );

        // Buttons per row.
        for ( let i = 0; i < masterButtons.length; i += MAX_EDIT_MASTER_BUTTONS_PER_ROW ) {
            result.push( masterButtons.slice( i, i + MAX_EDIT_MASTER_BUTTONS_PER_ROW ) );
        }

        return [
            ... result,
            [ LanguageChooseButton, BadwordsEditButton ]
        ];
    }
}
