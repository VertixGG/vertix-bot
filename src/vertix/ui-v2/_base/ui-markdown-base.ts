import * as fs from "fs";

import { ForceMethodImplementation } from "@vertix-base/errors/force-method-implementation";

import { UIArgs, UIBaseTemplateOptions, UIType } from "@vertix/ui-v2/_base/ui-definitions";

import { UITemplateBase } from "@vertix/ui-v2/_base/ui-template-base";

import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";

import { UIMarkdownLanguageContent } from "@vertix/ui-v2/_base/ui-language-definitions";

export abstract class UIMarkdownBase extends UITemplateBase {
    private static generatedLinks: { [ key: string ]: string } = {};

    private static content: string;

    private translatedContent: UIMarkdownLanguageContent | undefined;

    public static getName() {
        return "Vertix/UI-V2/UIMarkdownTemplateBase";
    }

    public static getType(): UIType {
        return "markdown";
    }

    public static ensure() {
        // TODO: Probably loading should be on another flow.
        const path = this.getContentPath();

        this.content = fs.readFileSync( path, "utf8" );
    }

    public static pullout( code: string ){
        const result = this.generatedLinks[ this.getName() + "/" + code ];

        delete this.generatedLinks[ this.getName() + "/" + code ];

        return result;
    }

    protected static getContentPath(): string {
        throw new ForceMethodImplementation( this, this.getContentPath.name );
    }

    public async build( uiArgs?: UIArgs ) {
        this.translatedContent = await UILanguageManager.$.getMarkdownTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIMarkdownLanguageContent> {
        const result: UIMarkdownLanguageContent = {
            content: ( this.constructor as typeof UIMarkdownBase ).content,
        };

        const options = this.getOptions();

        if ( Object.keys( options ).length ) {
            result.options = options;
        }

        return result;
    }

    protected abstract generateLink( content: string ): Promise<string>;

    protected abstract getCode(): string;

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected async getLogic( args?: UIArgs ): Promise<{ [ key: string ]: any }> {
        return {};
    }

    protected async getAttributes() {
        const content = this.composeTemplate(
            { content: await this.getContentInternal() },
            await this.getLogic( this.uiArgs ),
            this.getOptions(),
        );

        content.link = await this.generateLink( content.content );

        ( this.constructor as typeof UIMarkdownBase ).generatedLinks[ this.getName() + "/" + this.getCode() ] = content.link;

        return content;
    }

    private async getContentInternal() {
        return this.translatedContent?.content || ( this.constructor as typeof UIMarkdownBase ).content;
    }
}
