/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2025 iHorizon
*/
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, SnowflakeUtil } from 'discord.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel)
            return;
        if (interaction instanceof ChatInputCommandInteraction) {
            var channel = interaction.options.getChannel("to");
            var buttonTitle = interaction.options.getString('button-title')?.substring(0, 32) || '+';
        }
        else {
            var channel = (await client.method.channel(interaction, args, 0) || interaction.channel);
            var buttonTitle = client.method.string(args, 1)?.substring(0, 32) || '+';
        }
        ;
        const permissionsArray = [PermissionsBitField.Flags.Administrator];
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);
        if (!permissions && neededPerm === 0) {
            await client.method.interactionSend(interaction, { content: lang.security_channel_not_admin });
            return;
        }
        ;
        await client.db.set(`${interaction.guildId}.CONFESSION.channel`, channel.id);
        await client.method.interactionSend(interaction, {
            content: lang.confession_channel_command_work
                .replace('${channel?.toString()}', channel.toString())
        });
        let embed = new EmbedBuilder()
            .setColor('#ff05aa')
            .setFooter(await client.method.bot.footerBuilder(interaction))
            .setTimestamp()
            .setDescription(lang.confession_channel_panel_embed_desc);
        let actionRow = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(buttonTitle)
            .setCustomId('new-confession-button'));
        const nonce = SnowflakeUtil.generate().toString();
        let message = await channel.send({
            embeds: [embed],
            files: [await client.method.bot.footerAttachmentBuilder(interaction)],
            components: [actionRow],
            enforceNonce: true,
            nonce: nonce
        });
        await client.db.set(`${interaction.guildId}.GUILD.CONFESSION.panel`, {
            channelId: message.channelId,
            messageId: message.id
        });
        await client.method.iHorizonLogs.send(interaction, {
            title: lang.confession_channel_log_embed_title,
            description: lang.confession_channel_log_embed_desc
                .replace('${interaction.user}', interaction.member.user.toString())
                .replace('${channel}', channel.toString())
        });
        return;
    },
};
