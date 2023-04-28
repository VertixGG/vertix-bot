import {
    Guild,
    Interaction,
    PermissionOverwriteOptions,
    PermissionResolvable,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import ChannelModel, { ChannelResult } from "../models/channel";

import Debugger from "@dynamico/utils/debugger";

import { DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS, } from "@dynamico/constants/master-channel";

import { channelManager, dynamicoManager, guiManager, } from "@dynamico/managers";

import { permissionsConvertBitfieldToOverwriteOptions } from "@dynamico/utils/permissions";

import { InitializeBase } from "@internal/bases/initialize-base";

export default class PermissionsManager extends InitializeBase {
    private static instance: PermissionsManager;

    private channelModel: ChannelModel;

    private debugger: Debugger;

    public static getInstance(): PermissionsManager {
        if ( ! PermissionsManager.instance ) {
            PermissionsManager.instance = new PermissionsManager();
        }

        return PermissionsManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/Permissions";
    }

    public constructor() {
        super();

        this.channelModel = ChannelModel.getInstance();

        this.debugger = new Debugger( this );
    }

    public async onChannelPermissionsUpdate( oldChannel: VoiceChannel, newChannel: VoiceChannel ) {
        this.logger.info( this.onChannelPermissionsUpdate,
            `Guild id: '${ oldChannel.guildId }', channel id: '${ oldChannel.id }' - Permissions were updated`
        );

        // Print debug new permissions.
        this.debugger.log( this.onChannelPermissionsUpdate, `Guild id: '${ oldChannel.guildId }' - New permissions for channel id: '${ oldChannel.id }'` );
        this.debugger.debugPermissions( this.onChannelPermissionsUpdate, newChannel.permissionOverwrites );

        const newMessage = await guiManager
            .get( "Dynamico/UI/EditDynamicChannel" )
            .getMessage( newChannel );

        await channelManager.editPrimaryMessage( newMessage, newChannel );

        const channel = await channelManager.getChannel( newChannel.guildId, newChannel.id, true );

        if ( ! channel ) {
            return this.logger.debug( this.onChannelPermissionsUpdate,
                `Guild id: '${ oldChannel.guildId }', channel id: '${ newChannel.id }' - Not found in the database`
            );
        }

        if ( channel.isMasterCreate || channel.isDynamic ) {
            const botId = newChannel.client.user.id,
                isBotPermissionsRemovedFromChannel = ! newChannel.permissionOverwrites.cache.get( botId );

            if ( isBotPermissionsRemovedFromChannel ) {
                await this.resetBotUserPermissions( newChannel, channel );
            }
        }
    }

    public getMissingRolePermissions( permissions: bigint[], context: Guild, userId = context.client.user.id ): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField( permissions );

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach( ( permission ) => {
            resultMissingPermissions[ permission ] = true;
        } );

        // Get all roles in the guild;
        const roles = context.roles.cache.values();

        for ( const role of roles ) {
            // Skip if user is not in role.
            if ( ! role.members.get( userId ) ) {
                continue;
            }

            const rolePermissions = context.roles.cache.get( role.id )?.permissions;

            // Skip non-effected roles, or user not in role.
            if ( ! rolePermissions || ! rolePermissions.bitfield ) {
                continue;
            }

            const rolePermissionsField = new PermissionsBitField( rolePermissions.bitfield );

            rolePermissionsField.toArray().forEach( ( permission ) => {
                delete resultMissingPermissions[ permission ];
            } );

            // If resultMissingPermissions is empty.
            if ( ! Object.keys( resultMissingPermissions ).length ) {
                break;
            }
        }

        return Object.keys( resultMissingPermissions );
    }

    public getMissingChannelPermissions( permissions: bigint[], context: VoiceBasedChannel, userId = context.client.user.id ): string[] {
        const resultMissingPermissions: PermissionOverwriteOptions = {},
            requiredPermissionsField = new PermissionsBitField( permissions );

        // Determine which roles are missing.
        requiredPermissionsField.toArray().forEach( ( permission ) => {
            resultMissingPermissions[ permission ] = true;
        } );

        // Get user permissions that are defined in the voice channel.
        const channelPermissions = context.permissionOverwrites.cache.get( userId ),
            permissionFieldAllow = new PermissionsBitField( channelPermissions?.allow.bitfield );

        permissionFieldAllow.toArray().forEach( ( permission ) => {
            delete resultMissingPermissions[ permission ];
        } );

        return Object.keys( resultMissingPermissions );
    }

    public async hasMemberPermissions( guildId: string, userId: string, permissions: PermissionResolvable ) {
        const guild = dynamicoManager.getClient()?.guilds.cache.get( guildId );

        if ( ! guild ) {
            this.logger.error( this.hasMemberPermissions,
                `Guild id: '${ guildId }' - Guild not found`
            );
            return false;
        }

        const member = await guild.members.fetch( userId );

        return member.permissions.has( permissions );
    }

    public hasAdminPermission( interaction: Interaction, logFunctionOwner?: Function ) {
        if ( ! interaction.guild ) {
            this.logger.error( this.hasAdminPermission,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - Is not a guild interaction.`
            );
            return false;
        }

        const hasPermission = interaction.guild.ownerId === interaction.user.id ||
            interaction.memberPermissions?.has( PermissionsBitField.Flags.Administrator ) || false;

        if ( logFunctionOwner && ! hasPermission ) {
            this.logger.warn( logFunctionOwner,
                `Guild id: '${ interaction.guildId }', interaction id: '${ interaction.id }' - User: '${ interaction.user.id }' is not the guild owner`
            );
        }

        return hasPermission;
    }

    public isSelfAdministratorRole( guild: Guild ): boolean {
        const botMember = guild.members.cache.get( guild.client.user.id );

        if ( ! botMember ) {
            return false;
        }

        return botMember.permissions.has( PermissionsBitField.Flags.Administrator );
    }

    /**
     * Function getMissingPermissions() :: Return missing permissions names.
     */
    public getMissingPermissions( permissions: bigint[], context: VoiceBasedChannel ): string[];
    public getMissingPermissions( permissions: bigint[], context: Guild ): string[];
    public getMissingPermissions( permissions: bigint[], context: VoiceBasedChannel | Guild ): string[] {
        if ( context instanceof Guild ) {
            return this.getMissingRolePermissions( permissions, context );
        }

        return this.getMissingChannelPermissions( permissions, context );
    }

    /**
     * Function resetBotUserPermissions() :: Called when the bot has removed from the channel permissions.
     * The function will try to re-add the bot permissions to the channel.
     */
    private async resetBotUserPermissions( channel: VoiceChannel, channelResult: ChannelResult ) {
        this.logger.info( this.resetBotUserPermissions,
            `Guild id: '${ channel.guildId }' - Bot permissions were removed from: '${ channelResult.internalType }' channel: '${ channel.id }'`
        );

        const requiredPermissionsOptions = permissionsConvertBitfieldToOverwriteOptions(
            DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow
        );

        await channel.permissionOverwrites.edit( channel.client.user.id, requiredPermissionsOptions ).catch(
            ( e ) => this.logger.warn( this.resetBotUserPermissions, "", e )
        );
    }
}
