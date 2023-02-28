import { ChannelType, Guild, PermissionsBitField, VoiceState } from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChannelCreateArgs
} from "../interfaces/channel";

import PrismaBase from "@internal/bases/prisma-base";

import CategoryManager from "./category-manager";
import ChannelManager from "./channel-manager";
import Logger from "@internal/modules/logger";

const DEFAULT_CATEGORY_NAME = "⚡ Dynamic Channels",
    DEFAULT_CHANNEL_NAME = "➕ New Channel",
    DEFAULT_DYNAMIC_CHANNEL_NAME = "%{userDisplayName}%'s Channel";

export default class MasterChannelManager extends PrismaBase {
    private static instance: MasterChannelManager;

    private logger: Logger;

    public static getName(): string {
        return "Discord/Managers/MasterChannelManager";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    constructor() {
        super();

        this.logger = new Logger( this );
    }

    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName } = args,
            { guild } = args.newState;

        this.logger.info( this.onJoinMasterChannel,
            `User '${ displayName }' joined master channel '${ channelName }'` );

        // Create a new dynamic channel for the user.
        await this.createDynamic( displayName, guild, args.newState );
    }

    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `User '${ displayName }' left dynamic channel '${ channelName }'` );

        // If the channel is empty, delete it.
        if ( args.oldState.channel?.members.size === 0 ) {
            await ChannelManager.getInstance().delete( {
                guild,
                channelName,
                channel: args.oldState.channel,
            } );
        }
    }

    public async createDynamic( userDisplayName: string, guild: Guild, newState: VoiceState ) {
        const dynamicChannelName = DEFAULT_DYNAMIC_CHANNEL_NAME.replace(
            "%{userDisplayName}%",
            userDisplayName
        );

        this.logger.log( this.createDynamic,
            `Creating dynamic channel '${ dynamicChannelName }' for user '${ userDisplayName }'` );

        // Create channel for the user.
        const channel = await ChannelManager.getInstance().create( {
            guild,
            name: dynamicChannelName,
            type: ChannelType.GuildVoice,
            isDynamic: true,
        } );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );
    }

    /**
     * Function create() :: Creates a new master channel for a guild.
     */
    public async create( args: IMasterChannelCreateArgs ) {
        const { guild } = args;

        this.logger.info( this.create,
            `Creating master channel for guild '${ guild.name }' for user: '${ args.guild.ownerId }'` );

        // Create master channel category.
        const category = await CategoryManager.getInstance().create( {
            guild,
            name: DEFAULT_CATEGORY_NAME,
        } );

        // Create master channel.
        return ChannelManager.getInstance().create( {
            guild,
            isMaster: true,
            name: args.name || DEFAULT_CHANNEL_NAME,
            parent: category,
            type: ChannelType.GuildVoice,
            /* Everyone - Send Messages - False */
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                deny: [ PermissionsBitField.Flags.SendMessages ],
            } ]
        } );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }'` );

        await CategoryManager.getInstance().delete( guild );
        await ChannelManager.getInstance().deleteFromDB( guild );
    }

    public async isMaster( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isMaster: true
            }
        } );
    }

    public async isDynamic( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isDynamic: true
            }
        } );
    }
}
