import { ClaimVoteStepInEmbed } from "@vertix/ui-v2/claim/vote/claim-vote-step-in-embed";

describe( "Vertix/UI-V2/ClaimVoteStepInEmbed", () => {
    it( "should passthroughs sanity check", async () => {
        // Arrange.
        const embed = new ClaimVoteStepInEmbed();

        // Act.
        const result = await embed.build( {} );

        // Assert.
        expect( result ).toEqual( {
            "name": "Vertix/UI-V2/ClaimVoteStepInEmbed",
            "type": "embed",
            "attributes": {
                "title": "👑  {userInitiatorDisplayName} wish to claim this channel",
                "description": "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `NaN minute`."
            },
            "isAvailable": true,
        } );
    } );

    it( "should support timeout in minutes and seconds (less then minute = seconds)", async () => {
        // Arrange.
        jest.useFakeTimers();

        const embed = new ClaimVoteStepInEmbed();

        // Act - Minutes.
        let result = await embed.build( {
            timeEnd: Date.now() + 1000 * 60 * 2, // 2 minutes.
        } );

        // Assert - Minutes.
        expect( result.attributes.description ).toEqual(
            "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `2 minutes`."
        );

        // Act - Seconds.
        result = await embed.build( {
            timeEnd: Date.now() + 1000 * 30, // 30 seconds.
        } );

        // Assert - Seconds.
        expect( result.attributes.description ).toEqual(
            "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `30 seconds`."
        );

        // Cleanup.
        jest.clearAllTimers();
    } );

    it( "should work according to the spec", async () => {
        // Arrange.
        const embed = new ClaimVoteStepInEmbed();

        // Act.
        const result = await embed.build( {
            userId: "user-id",
            userDisplayName: "user-display-name",
            timeEnd: Date.now() + 1000 * 60 * 2, // 2 minutes.
        } );

        // Assert.
        expect( result ).toEqual( {
            "name": "Vertix/UI-V2/ClaimVoteStepInEmbed",
            "type": "embed",
            "attributes": {
                "description": "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `2 minutes`.",
                "title": "👑  {userInitiatorDisplayName} wish to claim this channel",
            },
            "isAvailable": true,
        } );
    } );
} );
