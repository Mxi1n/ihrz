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
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
export default {
    run: async (client, interaction, lang, command, neededPerm) => {
        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel)
            return;
        let channel = interaction.options.getChannel("channel");
        if ((!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && neededPerm === 0)) {
            await interaction.reply({ content: lang.setsuggest_channel_not_admin });
            return;
        }
        ;
        let fetchOldChannel = await client.db.get(`${interaction.guild.id}.SUGGEST.channel`);
        if (fetchOldChannel === channel?.id) {
            await interaction.reply({
                content: lang.setsuggest_channel_already_set_with_that
                    .replace('${interaction.user}', interaction.user.toString())
                    .replace('${channel}', channel.toString())
            });
            return;
        }
        ;
        let setupEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(lang.setsuggest_channel_embed_title)
            .setFooter(await client.method.bot.footerBuilder(interaction))
            .setDescription(lang.setsuggest_channel_embed_desc);
        await client.db.set(`${interaction.guild.id}.SUGGEST.channel`, channel?.id);
        await interaction.reply({
            content: lang.setsuggest_channel_command_work
                .replace('${interaction.user}', interaction.user.toString())
                .replace('${channel}', channel.toString()),
        });
        channel.send({
            embeds: [setupEmbed],
            files: [await client.method.bot.footerAttachmentBuilder(interaction)]
        });
        return;
    },
};
