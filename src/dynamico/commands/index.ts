import { ICommand } from "@dynamico/interfaces/command";

import { Setup } from "@dynamico/commands/setup";

import Logger from "@internal/modules/logger";

export const Commands: ICommand[] = [
    Setup,
];

export const commandsLogger = new class CommandsLoggers extends Logger {
    public static getName(): string {
        return "Commands/Logger";
    }

    public constructor() {
        super( CommandsLoggers );
    }
};
