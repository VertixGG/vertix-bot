import { BaseInteraction, Client } from "discord.js";

export class BaseInteractionMock extends BaseInteraction {
    public constructor( client: Client, data: any ) {
        super( client, data );
    }

    public getUser() {
        return this.user;
    }
}
