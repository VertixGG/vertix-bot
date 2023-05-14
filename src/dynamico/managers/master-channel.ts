import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    CategoryChannel,
    ChannelType,
    CommandInteraction,
    Guild,
    Interaction,
    NonThreadGuildBasedChannel,
    OverwriteType,
    PermissionsBitField,
    SelectMenuInteraction,
    VoiceBasedChannel,
    VoiceChannel,
} from "discord.js";

import { IChannelEnterGenericArgs, } from "../interfaces/channel";

import {
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS,
    DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
} from "@dynamico/constants/master-channel";

import { CategoryModel } from "@dynamico/models/category";
import { ChannelModel, ChannelResult } from "@dynamico/models/channel";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { badwordsNormalizeArray, guildSetBadwords } from "@dynamico/utils/badwords";

import { DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS } from "@dynamico/constants/dynamic-channel";

import { DynamicoManager } from "@dynamico/managers/dynamico";
import { CategoryManager } from "@dynamico/managers/category";
import { ChannelDataManager } from "@dynamico/managers/channel-data";
import { ChannelManager } from "@dynamico/managers/channel";
import { DirectMessageManager } from "@dynamico/managers/direct-message";
import { DynamicChannelManager } from "@dynamico/managers/dynamic-channel";
import { GuildDataManager } from "@dynamico/managers/guild-data";
import { GUIManager } from "@dynamico/managers/gui";
import { PermissionsManager } from "@dynamico/managers/permissions";

import { Debugger } from "@internal/modules/debugger";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

interface IMasterChannelCreateDefaultMaster {
    dynamicChannelNameTemplate?: string,
    badwords?: string[],
}

interface IMasterChannelCreateArgs extends IMasterChannelCreateDefaultMaster {
    parent: CategoryChannel,
    guild: Guild,
    name?: string
    userOwnerId: string,
}

export class MasterChannelManager extends ManagerCacheBase<any> { // TODO: Replace any with correct type.
    private static instance: MasterChannelManager;

    private debugger: Debugger;

    public static getName(): string {
        return "Dynamico/Managers/MasterChannel";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    public static get $() {
        return MasterChannelManager.getInstance();
    }

    public constructor( shouldDebugCache = DynamicoManager.isDebugOn( "CACHE", MasterChannelManager.getName() ) ) {
        super( shouldDebugCache );

        this.debugger = new Debugger( this );
    }

    /**
     * Function onJoinMasterChannel() :: Called when a user joins the master channel(➕ New Channel).
     */
    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' joined master channel: '${ channelName }'` );

        if ( ! newState.channel ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find channel: '${ channelName }'` );

            return;
        }

        // Check if bot exist in administrator role.
        if ( ! PermissionsManager.$.isSelfAdministratorRole( guild ) ) {
            // Get permissions of master channel.
            const roleMasterChannelPermissions: bigint[] = [];

            if ( newState.channel ) {
                for ( const permission of newState.channel.permissionOverwrites.cache.values() ) {
                    const bitfield = permission.allow.bitfield;

                    // Push allow or deny permissions.
                    if ( OverwriteType.Role === permission.type ) {
                        roleMasterChannelPermissions.push( bitfield );
                    }
                }
            }

            const missingPermissionsChannelLevel = PermissionsManager.$.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel
                ),
                missingPermissionsRoleLevel = PermissionsManager.$.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel.guild
                ),
                missingPermissionsRoleMasterChannelLevel = PermissionsManager.$.getMissingPermissions(
                    roleMasterChannelPermissions,
                    newState.channel.guild,
                ), missingPermissions = [
                    ... missingPermissionsChannelLevel,
                    ... missingPermissionsRoleLevel,
                    ... missingPermissionsRoleMasterChannelLevel,
                ];

            // TODO: Fully refactor, it does add denied channel permissions to the missing permissions, if they not exist in the role permissions.
            const userOrRoles = newState.channel.permissionOverwrites.cache,
                missingPermissionsAdditional: any = {};

            for ( const userOrRole of userOrRoles.values() ) {
                const requiredPermissionsField = new PermissionsBitField( userOrRole.deny.bitfield === 0n ? userOrRole.allow.bitfield : userOrRole.deny.bitfield ),
                    requirePermissionArray = requiredPermissionsField.toArray();

                requirePermissionArray.forEach( ( permission ) => {
                    missingPermissionsAdditional[ permission ] = true;
                } );
            }

            // Dynamico leaking permissions on the role level.
            if ( missingPermissionsRoleLevel.length ) {
                this.logger.admin( this.onJoinMasterChannel,
                    `🔐 Dynamico missing permissions - "${ missingPermissionsRoleLevel.join( ", " ) }" (${ guild.name })`
                );
            }

            if ( missingPermissionsChannelLevel.length ) {
                this.logger.admin( this.onJoinMasterChannel,
                    `🔐 Master Channel missing permissions - "${ missingPermissionsChannelLevel.join( ", " ) }" (${ guild.name })`
                );
            }

            // Find all roles that has bot member.
            for ( const role of newState.guild.roles.cache.values() ) {
                if ( role.members.has( DynamicoManager.$.getClient()?.user?.id || "" ) ) {
                    const rolePermissions = role.permissions.toArray();

                    rolePermissions.forEach( ( permission ) => {
                        delete missingPermissionsAdditional[ permission ];
                    } );
                }
            }

            missingPermissions.push( ... Object.keys( missingPermissionsAdditional ) );

            if ( missingPermissions.length ) {
                this.logger.warn( this.onJoinMasterChannel,
                    `Guild id: '${ guild.id }' - User '${ displayName }' connected to master channel name: '${ channelName }' but is missing permissions`
                );

                const uniqueMissingPermissions = [ ... new Set( missingPermissions ) ];

                const message = await GUIManager.$.get( "Dynamico/UI/NotifyPermissions" )
                    .getMessage( newState.channel, {
                        permissions: uniqueMissingPermissions,
                        botName: newState.guild.client.user.username,
                    } );

                // Send DM message to the user with missing permissions.
                if ( newState.member?.id ) {
                    await DirectMessageManager.$.sendToUser( newState.member.id, message );
                }

                return;
            }
        }

        try {
            // Create a new dynamic channel for the user.
            const dynamicChannel = await DynamicChannelManager.$.createDynamicChannel( { displayName, guild, oldState, newState, } ),
                message = await GUIManager.$
                    .get( "Dynamico/UI/EditDynamicChannel" )
                    .getMessage( newState.channel as NonThreadGuildBasedChannel ); // TODO: Remove `as`.

            message.content = "<@" + newState.member?.id + ">";

            await dynamicChannel?.send( message );
        } catch ( e ) {
            this.logger.error( this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - Failed to create dynamic channel for user: '${ displayName }'` );

            this.logger.error( this.onJoinMasterChannel, "", e );
        }
    }

    /**
     * Function getDefaultInheritedProperties() :: Returns the default inherited properties from the master channel.
     * Take overview of the master channel.
     */
    public getChannelDefaultInheritedProperties( masterChannel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = masterChannel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.debugger.log( this.getChannelDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    /**
     * Function getDefaultInheritedPermissions() :: Returns the default inherited permissions from the master channel.
     */
    public getChannelDefaultInheritedPermissions( masterChannel: VoiceBasedChannel ) {
        const { permissionOverwrites } = masterChannel,
            result = [];

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            let { id, allow, deny, type } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if ( id === masterChannel.guild.id ) {
                deny = deny.remove( PermissionsBitField.Flags.SendMessages );
            }

            this.debugger.debugPermission( this.getChannelDefaultInheritedPermissions, overwrite );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    public getChannelDefaultProperties( userId: string, masterChannel: VoiceBasedChannel ) {
        const inheritedProperties = this.getChannelDefaultInheritedProperties( masterChannel ),
            inheritedPermissions = this.getChannelDefaultInheritedPermissions( masterChannel ),
            permissionOverwrites = [
                ... inheritedPermissions,
                {
                    id: userId,
                    ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                }
            ];

        return {
            ... inheritedProperties,
            permissionOverwrites,
        };
    }

    /**
     * Function getByDynamicChannel() :: Returns the master channel by the guildID & dynamic channel id.
     *
     * TODO: Full rewrite.
     */
    public async getByDynamicChannelId( guildId: string, dynamicChannelId: string, cache: boolean = false, interaction: Interaction | null = null ): Promise<VoiceChannel | void> {
        this.logger.log( this.getByDynamicChannelId, `Guild id: '${ guildId }' - Dynamic channel id: '${ dynamicChannelId }' cache: '${ cache }'` );

        if ( cache ) {
            const cached = this.getCache( `getByDynamicChannel-MasterChannelCached-ForId-${ dynamicChannelId }` );

            if ( cached ) {
                return cached;
            }
        }

        const dynamicChannelDB = await ChannelManager.$.getGuildChannelDB( guildId, dynamicChannelId, true );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.getByDynamicChannelId,
                `Guild id: '${ guildId }' - Could not find dynamic channel in database channel id: '${ dynamicChannelId }'`
            );

            if ( interaction ) {
                await GUIManager.$.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendReply( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        if ( ! dynamicChannelDB.ownerChannelId ) {
            this.logger.error( this.getByDynamicChannelId,
                `Guild id: '${ guildId }' - Could not find dynamic channel in database channel id: '${ dynamicChannelId }'`
            );

            if ( interaction ) {
                await GUIManager.$.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendReply( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        let masterChannel,
            guild = await DynamicoManager.$.getClient()?.guilds.cache.get( guildId ),
            masterChannelPromise = guild?.channels.fetch( dynamicChannelDB.ownerChannelId );

        const promise = new Promise( ( resolve ) => {
            masterChannelPromise?.catch( ( e ) => {
                this.logger.error( this.getByDynamicChannelId,
                    `Guild id: '${ guildId }' - Could not find dynamic channel in database channel id: '${ dynamicChannelId }'`
                );
                this.logger.error( this.getByDynamicChannelId, "", e );
                resolve( null );
            } ).then( ( result ) => {
                masterChannel = result;
                resolve( result );
            } );
        } );

        await promise;

        if ( ! masterChannel ) {
            this.logger.warn( this.getByDynamicChannel,
                `Guild id: '${ guildId }' - Could not find master channel, dynamic channel id: '${ dynamicChannelId }'` );

            if ( interaction ) {
                await GUIManager.$.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendReply( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        // Set cache, anyway.
        this.setCache( `getByDynamicChannel-MasterChannelCached-ForId-${ dynamicChannelId }`, masterChannel );

        return masterChannel;
    }

    public async getChannelAndDBbyDynamicChannel( interaction: Interaction, cache: boolean = false ): Promise<false | { channel: VoiceChannel, db: ChannelResult }> {
        const masterChannel = await this.getByDynamicChannel( interaction, cache );

        if ( ! masterChannel ) {
            return false;
        }

        const masterChannelDB = await ChannelManager.$.getGuildChannelDB( interaction.guildId as string, masterChannel.id, cache );

        if ( ! masterChannelDB ) {
            return false;
        }

        return {
            channel: masterChannel,
            db: masterChannelDB,
        };
    }

    /**
     * Function getByDynamicChannel() :: Returns the master channel by the dynamic channel according the interaction.
     */
    public async getByDynamicChannel( interaction: Interaction, cache: boolean = false ) {
        this.logger.info( this.getByDynamicChannel, `Guild id: '${ interaction.guildId }' - Interaction: '${ interaction.id }', cache: '${ cache }'` );

        if ( ChannelType.GuildVoice !== interaction.channel?.type || ! interaction.guildId || ! interaction.channelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Interaction is not a voice channel, interaction: '${ interaction.id }'` );
            return;
        }

        // # NOTE: No `debugger.log` needed since of `getByDynamicChannelId` will do it.
        return await this.getByDynamicChannelId( interaction.guildId, interaction.channelId, cache, interaction );
    }

    /**
     * Function getChannelNameTemplate() :: Returns the dynamic channel name template.
     */
    public async getChannelNameTemplate( ownerId: string, returnDefault?: boolean ) {
        const result = await ChannelDataManager.$.getSettingsData( ownerId, DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS, true ),
            name = result?.object?.dynamicChannelNameTemplate;

        this.debugger.log( this.getChannelNameTemplate,
            `ownerId: '${ ownerId }' name: '${ name }'`
        );

        if ( ! name && returnDefault ) {
            this.debugger.log( this.getChannelNameTemplate,
                `ownerId: '${ ownerId }' returns default name: '${ DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME }'`
            );
            return DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME;
        }

        return name;
    }

    /**
     * Function createMasterChannel() :: Creates a default master channel for a guild, part of setup process.
     */
    public async createDefaultMasterChannel( interaction: CommandInteraction, userOwnerId: string, extraArgs: IMasterChannelCreateDefaultMaster = {} ) {
        const guild = interaction.guild as Guild;

        let masterCategory;
        try {
            masterCategory = await this.createDefaultMasterCategory( guild );
        } catch ( e ) {
            this.logger.warn( this.createDefaultMasterChannel, "", e );
        }

        if ( masterCategory ) {
            extraArgs.badwords = badwordsNormalizeArray( extraArgs.badwords );

            this.debugger.dumpDown( this.createDefaultMasterChannel, extraArgs, "extraArgs" );

            const args = {
                    guild,
                    userOwnerId,
                    parent: masterCategory,
                    ... extraArgs,
                },
                masterCreateChannel = await this.createMasterChannel( args );

            return {
                masterCategory,
                masterCreateChannel,
            };
        }

        await GUIManager.$.get( "Dynamico/UI/GlobalResponse" )
            .sendContinues( interaction, {
                globalResponse: uiUtilsWrapAsTemplate( "somethingWentWrong" ),
            } );

        return false;
    }

    /**
     * Function createMasterCategory() :: Creates a new master category for a master channel(s).
     */
    public async createDefaultMasterCategory( guild: Guild ) {
        return await CategoryManager.$.create( {
            guild,
            name: DEFAULT_MASTER_CATEGORY_NAME,
        } );
    }

    /**
     * Function checkLimit() :: Validates if the guild has reached the master channel limit.
     */
    public async checkLimit( interaction: CommandInteraction, guildId: string ) {
        const limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await ChannelModel.$.isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            this.debugger.log( this.checkLimit, `Guild id: '${ guildId }' - Has reached master limit: '${ limit }'` );

            this.logger.admin( this.checkLimit,
                `💰 Master Channels Limitation function has been activated max(${ limit }) (${ interaction.guild?.name })`
            );

            await GUIManager.$.get( "Dynamico/UI/NotifyMaxMasterChannels" )
                .sendContinues( interaction, { maxFreeMasterChannels: limit } );
        }

        return ! hasReachedLimit;
    }

    /**
     * Function removeLeftOvers() :: Removes leftovers of a guild.
     */
    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        // TODO Relations are deleted automatically??
        await CategoryModel.$.delete( guild.id );
        await ChannelModel.$.delete( guild );
    }

    /**
     * Function createMasterChannel() :: Creates channel master of create.
     */
    private async createMasterChannel( args: IMasterChannelCreateArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createMasterChannel,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }'` );

        this.debugger.log( this.createMasterChannel, "badwords", args.badwords );

        const outOfBoxPermissionsOverwrites = [ {
            id: guild.client.user.id,
            ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
        }, {
            id: guild.roles.everyone,
            ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ];

        const result = await ChannelManager.$.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: outOfBoxPermissionsOverwrites,
        } );

        // TODO In future, we should use hooks for this. `Commands.on( "channelCreate", ( channel ) => {} );`.

        await ChannelDataManager.$.setSettingsData( result.channelDB.id, {
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate || DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
        } );

        await guildSetBadwords( guild, args.badwords );

        return result.channel;
    }
}
