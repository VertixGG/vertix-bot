import process from "process";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import { ChannelType, Client } from "discord.js";

import { Commands } from "@dynamico/commands";
import CategoryManager from "@dynamico/managers/category";
import ChannelManager from "@dynamico/managers/channel";

import InitializeBase from "@internal/bases/initialize-base";
import PrismaInstance from "@internal/prisma";

export class DynamicoManager extends InitializeBase {
    private static instance: DynamicoManager;

    private client: Client | null = null;

    public static getInstance() {
        if ( ! DynamicoManager.instance ) {
            DynamicoManager.instance = new DynamicoManager();
        }

        return DynamicoManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/Dynamico";
    }

    public async onReady( client: Client ) {
        if ( this.client ) {
            this.logger.error( this.onReady, "Client is already set" );
            process.exit( 1 );
            return;
        }

        this.client = client;

        if ( ! client.user || ! client.application ) {
            this.logger.error( this.onReady, "Client is not ready" );
            process.exit( 1 );
            return;
        }

        await client.application.commands.set( Commands );

        await this.removeEmptyChannels( client );
        await this.removeEmptyCategories( client );
        await this.removeEmptyChannelData();

        this.logger.log( this.onReady,
            `Ready handle is set, Bot '${ client.user.username }' is online, commands is set.` );
    }

    private async removeEmptyChannels( client: Client ) {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            channels = await prisma.channel.findMany( {
                where: {
                    internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
                }
            } );

        for ( const channel of channels ) {
            const guildCache = client.guilds.cache.get( channel.guildId ),
                channelCache = guildCache?.channels.cache.get( channel.channelId );

            if ( ! guildCache || ! channelCache ) {
                continue;
            }

            if ( channelCache?.members && channelCache.isVoiceBased() ) {
                if ( 0 === channelCache.members.size ) {
                    await ChannelManager.getInstance().delete( {
                        channel: channelCache,
                        guild: guildCache,
                    } );
                }
            } else {
                // Delete only from db.
                await prisma.channel.delete( {
                    where: {
                        id: channel.id
                    }
                } );

                this.logger.info( this.removeEmptyChannels,
                    `Channel '${ channel.channelId }' is deleted from db.` );
            }
        }
    }

    public async removeEmptyCategories( client: Client ) {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            categories = await prisma.category.findMany();

        for ( const category of categories ) {
            const categoryCache = client.guilds.cache.get( category.guildId )?.channels.cache.get( category.categoryId );

            if ( ChannelType.GuildCategory === categoryCache?.type ) {
                if ( 0 === categoryCache.children.cache.size ) {
                    await CategoryManager.getInstance().delete( categoryCache );
                }
            } else {
                // Delete only from db.
                await prisma.category.delete( {
                    where: {
                        id: category.id
                    }
                } );

                this.logger.info( this.removeEmptyCategories,
                    `Category '${ category.categoryId }' is deleted from db.` );
            }
        }
    }

    public async removeEmptyChannelData() {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            channelData = await prisma.channelData.findMany();

        for ( const data of channelData ) {
            const channel = await prisma.channel.findFirst( {
                where: {
                    id: data.id
                }
            } );

            if ( ! channel ) {
                await prisma.channelData.delete( {
                    where: {
                        id: data.id
                    }
                } );

                this.logger.info( this.removeEmptyChannelData,
                    `Channel data '${ data.id }' is deleted from db.` );
            }
        }
    }
}

export default DynamicoManager;
