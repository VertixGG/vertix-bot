import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import { ClaimVoteEmbed } from "@vertix/ui-v2/claim/vote/claim-vote-embed";
import { ClaimVoteStepInButton } from "@vertix/ui-v2/claim/vote/claim-vote-step-in-button";
import { ClaimVoteWonEmbed } from "@vertix/ui-v2/claim/vote/calim-vote-won-embed";
import { ClaimVoteStepInEmbed } from "@vertix/ui-v2/claim/vote/claim-vote-step-in-embed";
import { ClaimVoteElementsGroup } from "@vertix/ui-v2/claim/vote/claim-vote-elements-group";
import { UIMarkdownsGroupBase } from "@vertix/ui-v2/_base/ui-markdowns-group-base";
import { ClaimVoteResultsMarkdown } from "@vertix/ui-v2/claim/vote/claim-vote-results-markdown";

export class ClaimVoteComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimVoteComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            ClaimVoteElementsGroup,

            UIElementsGroupBase.createSingleGroup( ClaimVoteStepInButton ),
        ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( ClaimVoteStepInEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimVoteEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimVoteWonEmbed ),
        ];
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }

    public static getMarkdownsGroups() {
        return [
            UIMarkdownsGroupBase.createSingleGroup( ClaimVoteResultsMarkdown ),
        ];
    }

    protected static getDefaultMarkdownsGroup() {
        return null;
    }
}
