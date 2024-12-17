/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import { Client, GuildMember, TextChannel } from 'discord.js';

import { BotEvent } from '../../../types/event';
import { DatabaseStructure } from '../../../types/database_structure';
import logger from '../../core/logger.js';
import { formatNumber } from '../../core/functions/numberBeautifuer.js';

export const event: BotEvent = {
    name: "guildMemberAdd",
    run: async (client: Client, member: GuildMember) => {
        try {
            const guild = member.guild;
            const botMembersCount = guild.members.cache.filter((m) => m.user.bot).size;
            const rolesCount = guild.roles.cache.size;
            const baseData = await client.db.get(`${guild.id}.GUILD.MCOUNT`) as DatabaseStructure.MemberCountSchema;
            const boostsCount = member.guild.premiumSubscriptionCount || 0;

            if (!baseData) return;

            const mappings: { key: keyof DatabaseStructure.MemberCountSchema, count: number | string }[] = [
                { key: 'bot', count: botMembersCount },
                { key: 'member', count: formatNumber(guild.memberCount) },
                { key: 'roles', count: rolesCount },
                { key: 'boost', count: boostsCount },
                { key: 'channel', count: rolesCount }
            ];

            for (const { key, count } of mappings) {
                const data = baseData[key];
                if (data) {

                    const channel = guild.channels.cache.get(data.channel!) as TextChannel;
                    if (channel && channel.isTextBased()) {
                        const newName = data.name
                            ?.replace(/{\w+Count}/, String(count))
                            ?.replace(/{\w+count}/, String(count));
                        channel.edit({ name: newName });
                    }
                }
            }
        } catch (error) {
            logger.err('Error handling guildMemberAdd event:' + error as any);
        }
    },
};