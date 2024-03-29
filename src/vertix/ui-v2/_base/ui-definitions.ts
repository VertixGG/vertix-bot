import { Message } from "discord.js";

import { UIElementBase } from "@vertix/ui-v2/_base/ui-element-base";
import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";
import { UIEntityBase } from "@vertix/ui-v2/_base/ui-entity-base";
import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIMarkdownBase } from "@vertix/ui-v2/_base/ui-markdown-base";
import { UIMarkdownsGroupBase } from "@vertix/ui-v2/_base/ui-markdowns-group-base";
import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";
import { UIAdapterReplyContext } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

export enum UIInstancesTypes {
    Static = "Static",
    Dynamic = "Dynamic"
}

// TODO: Check if required, and when.
export const UI_ELEMENTS_DEPTH = 2,
    UI_ELEMENTS_DEFAULT_MAX_PER_ROW = 3;

export const UI_GENERIC_SEPARATOR = ":";

export const UI_IMAGE_EMPTY_LINE_URL = "https://i.imgur.com/NthLO3W.png";

export type UIArgs = { [ key: string ]: any; }

export type UIType = "component" | "element" | "embed" | "modal" | "markdown";
export type UIGroupsType = "element" | "embed" | "markdown";
export type UIAdapterBuildSource = "unknown" | "send" | "send-to-user" | "reply" | "edit" | "edit-message" | "run" | "show-modal";

// TODO: constructor types should not be arrays, but a single type.

export type UIElementsTypes = typeof UIElementBase[] | typeof UIElementBase[][];
export type UIElementsConstructor = { new(): UIElementBase<any> }[] | { new(): UIElementBase<any> }[][]; // TODO: Maybe passthroughs the type of the element as a generic.
export type UIElementsTypesConstructor = UIElementsTypes | UIElementsConstructor;

export type UIEmbedTypes = typeof UIEmbedBase[];
export type UIEmbedConstructor = { new(): UIEmbedBase }[];
export type UIEmbedTypesConstructor = UIEmbedTypes | UIEmbedConstructor;

export type UIModalTypes = typeof UIModalBase[];
export type UIModalConstructor = { new(): UIModalBase }[];
export type UIModalTypesConstructor = UIModalTypes | UIModalConstructor;

export type UIMarkdownTypes = typeof UIMarkdownBase[];
export type UIMarkdownConstructor = { new(): UIMarkdownBase }[];
export type UIMarkdownLinkConstructor = UIMarkdownTypes | UIMarkdownConstructor;

export type UIEntityTypes = typeof UIEntityBase[];
export type UIEntityConstructor = { new(): UIEntityBase }[];
export type UIEntityTypesConstructor = UIEntityTypes | UIEntityConstructor | ( UIEntityTypes | UIEntityConstructor )[];

export type UIComponentConstructor = { new( args?: UICreateComponentArgs ): UIComponentBase };
export type UIComponentTypeConstructor = typeof UIComponentBase & UIComponentConstructor;

// export type UIEntityUnionTypes = UIEmbedTypes | UIElementsTypes;
// export type UIEntityUnionTypesConstructor = UIElementsConstructor | UIEmbedConstructor;
// export type UIEntityUnionTypesConstructorUnion = UIElementsTypesConstructor | UIEmbedTypesConstructor;

export type UIButtonStyleTypes = "primary" | "secondary" | "success" | "danger" | "link";
export type UIInputStyleTypes = "short" | "long";

export interface UISchemaBase {
    type: string;
    name: string;
}

export interface UIPortableSchemaBase extends UISchemaBase {
    entities: { [ key: string ]: any; };
}

export interface UIEntitySchemaBase extends UISchemaBase {
    attributes: { [ key: string ]: any; };
    isAvailable: boolean;
}

/* Execution */

export type UIExecutionConditionArgs<TInteraction extends UIAdapterReplyContext = UIAdapterReplyContext> = {
    context: TInteraction | Message<true>,
    args?: UIArgs
};

export interface UIExecutionStep {
    embedsGroup?: string | null;
    elementsGroup?: string | null;
    markdownGroup?: string | null;
    getConditions?: ( args: UIExecutionConditionArgs ) => boolean;
}

export interface UIExecutionStepItem extends UIExecutionStep {
    name: string;
}

export interface UIExecutionStepData extends UIExecutionStep {
    entities: UICreateComponentArgs;
}

export interface UIExecutionSteps {
    [ key: string ]: UIExecutionStep;
}

/* Embed */

export interface UIBaseTemplateOptions {
    [ key: string ]: string | {
        [ key: string ]: string
    }
}

export interface UIEmbedArrayOptions {
    [ key: string ]: {
        format: string,
        separator: string,
        multiSeparator?: string,
        options?: { [ key: string ]: any, }
    };
}

/* Language */

export interface UICreateComponentArgs {
    elementsGroupType?: typeof UIElementsGroupBase;
    embedsGroupType?: typeof UIEmbedsGroupBase;
    markdownsGroupType?: typeof UIMarkdownsGroupBase;
}

