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

import {
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionsBitField,
    Message
} from 'pwss';

import logger from '../../../core/logger.js';
import { LanguageData } from '../../../../types/languageData.js';
import { Command } from '../../../../types/command.js';

export const command: Command = {

    aliases: ['ranks-channel', 'channelranks', 'channel-ranks'],

    name: "rankschannel",
    name_localizations: {
        "fr": "définir-cannal"
    },

    description: "Set the channel where user earn new xp level message!",
    description_localizations: {
        "fr": "Définir le canal sur lequel l'utilisateur gagne un nouveau message de niveau XP"
    },


    thinking: false,
    category: 'ranks',
    type: "PREFIX_IHORIZON_COMMAND",
    run: async (client: Client, interaction: Message, execTimestamp: number, args: string[]) => {

        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.author || !interaction.guild || !interaction.channel) return;

        const data = await client.func.getLanguageData(interaction.guildId) as LanguageData;

        let argsid = client.func.argsHelper.getChannel(interaction, 0);

        if (!interaction.member.permissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: data.setxpchannels_not_admin, allowedMentions: { repliedUser: false } });
            return;
        };

        if (args) {
            if (!argsid) {
                await interaction.reply({ content: data.setxpchannels_valid_channel_message, allowedMentions: { repliedUser: false } });
                return;
            };

            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.setxpchannels_logs_embed_title_enable)
                    .setDescription(data.setxpchannels_logs_embed_description_enable.replace(/\${interaction\.user.id}/g, interaction.author.id)
                        .replace(/\${argsid}/g, argsid.id))

                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');

                if (logchannel) {
                    (logchannel as BaseGuildTextChannel).send({ embeds: [logEmbed] });
                };
            } catch (e: any) {
                logger.err(e)
            };

            try {
                let already = await client.db.get(`${interaction.guildId}.GUILD.XP_LEVELING.xpchannels`);
                if (already === argsid.id) return await interaction.reply({ content: data.setxpchannels_already_with_this_config });

                (client.channels.cache.get(argsid.id) as BaseGuildTextChannel).send({ content: data.setxpchannels_confirmation_message });
                await client.db.set(`${interaction.guildId}.GUILD.XP_LEVELING.xpchannels`, argsid.id);

                await interaction.reply({ content: data.setxpchannels_command_work_enable.replace(/\${argsid}/g, argsid.id), allowedMentions: { repliedUser: false } });
                return;
            } catch (e) {
                await interaction.reply({ content: data.setxpchannels_command_error_enable, allowedMentions: { repliedUser: false } });
                return;
            };
        } else if (!args) {
            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.setxpchannels_logs_embed_title_disable)
                    .setDescription(data.setxpchannels_logs_embed_description_disable.replace(/\${interaction\.user.id}/g, interaction.author.id))

                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');

                if (logchannel) {
                    (logchannel as BaseGuildTextChannel).send({ embeds: [logEmbed] });
                };
            } catch (e: any) {
                logger.err(e)
            };

            try {
                let already2 = await client.db.get(`${interaction.guildId}.GUILD.XP_LEVELING.xpchannels`);

                if (already2 === "off") {
                    await interaction.reply({ content: data.setxpchannels_already_disabled_disable });
                    return;
                };

                await client.db.delete(`${interaction.guildId}.GUILD.XP_LEVELING.xpchannels`);
                await interaction.reply({ content: data.setxpchannels_command_work_disable, allowedMentions: { repliedUser: false } });
                return;
            } catch (e) {
                await interaction.reply({ content: data.setxpchannels_command_error_disable, allowedMentions: { repliedUser: false } });
                return;
            };
        };
    },
};