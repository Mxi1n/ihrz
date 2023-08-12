/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

import {
    Client,
    EmbedBuilder,
    PermissionsBitField,
    ChannelType,
} from 'discord.js';

import logger from '../../core/logger';

export = {
    run: async (client: Client, interaction: any, data: any) => {


        let permission = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!permission) return interaction.editReply({ content: data.lockall_dont_have_permission });
        interaction.guild.channels.cache.forEach((c: { type: ChannelType; permissionOverwrites: { create: (arg0: any, arg1: { SendMessages: boolean; }) => void; }; }) => {
            if (c.type === ChannelType.GuildText) {
                c.permissionOverwrites.create(interaction.guild.id, { SendMessages: false })
            };
        });

        let Lockembed = new EmbedBuilder()
            .setColor("#5b3475")
            .setTimestamp()
            .setDescription(data.lockall_embed_message_description
                .replace(/\${interaction\.user\.id}/g, interaction.user.id)
            );

        try {
            let logEmbed = new EmbedBuilder()
                .setColor("#bf0bb9")
                .setTitle(data.lockall_logs_embed_title)
                .setDescription(data.lockall_logs_embed_description
                    .replace(/\${interaction\.user\.id}/g, interaction.user.id)
                );

            let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');

            if (logchannel) {
                logchannel.send({ embeds: [logEmbed] })
            };
        } catch (e: any) {
            logger.err(e)
        };

        await interaction.editReply({ embeds: [Lockembed] });
        return;
    },
};