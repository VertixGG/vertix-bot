import { Prisma } from "@prisma/client";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

import { PrismaInstance } from "@internal/prisma";

const model = PrismaInstance.getClient().embedLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class EmbedLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: EmbedLanguageModel;

    public static getName(): string {
        return "Vertix/Models/EmbedLanguageModel";
    }

    public static getInstance(): EmbedLanguageModel {
        if ( ! EmbedLanguageModel.instance ) {
            EmbedLanguageModel.instance = new EmbedLanguageModel( false );
        }

        return EmbedLanguageModel.instance;
    }

    public static get $() {
        return EmbedLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}