import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { FeedbackInputTitle } from "@vertix/ui-v2/feedback/modal-elements/feedback-input-title";
import { FeedbackInputDescription } from "@vertix/ui-v2/feedback/modal-elements/feedback-input-description";

export class FeedbackReportModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackReportModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getTitle() {
        return "Submit a issue";
    }

    public static getInputElements() {
        return [
            [ FeedbackInputTitle ],
            [ FeedbackInputDescription ],
        ];
    }
}
