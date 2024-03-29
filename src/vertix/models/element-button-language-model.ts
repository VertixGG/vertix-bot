import { Prisma } from "@vertix-base-prisma-bot";

import { PrismaBotInstance } from"@vertix-base/prisma/prisma-bot-instance";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

const model = PrismaBotInstance.getClient().elementButtonLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class ElementButtonLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ElementButtonLanguageModel;

    public static getName(): string {
        return "Vertix/Models/ElementButtonLanguageModel";
    }

    public static getInstance(): ElementButtonLanguageModel {
        if ( ! ElementButtonLanguageModel.instance ) {
            ElementButtonLanguageModel.instance = new ElementButtonLanguageModel( false );
        }

        return ElementButtonLanguageModel.instance;
    }

    public static get $() {
        return ElementButtonLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}
