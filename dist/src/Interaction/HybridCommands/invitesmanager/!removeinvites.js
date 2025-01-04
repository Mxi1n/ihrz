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
import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, } from 'discord.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel)
            return;
        if (interaction instanceof ChatInputCommandInteraction) {
            var user = interaction.options.getMember("member");
            var amount = interaction.options.getNumber("amount");
        }
        else {
            var user = client.method.member(interaction, args, 0) || interaction.member;
            var amount = client.method.number(args, 1);
        }
        ;
        let a = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(lang.removeinvites_not_admin_embed_description);
        const permissionsArray = [PermissionsBitField.Flags.Administrator];
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);
        if (!permissions && neededPerm === 0) {
            await client.method.interactionSend(interaction, { embeds: [a] });
            return;
        }
        ;
        let check = await client.db.get(`${interaction?.guild?.id}.USER.${user.id}.INVITES`);
        if (check) {
            await client.db.sub(`${interaction.guildId}.USER.${user.id}.INVITES.invites`, amount);
            await client.db.sub(`${interaction.guildId}.USER.${user.id}.INVITES.bonus`, amount);
        }
        else {
            await client.db.set(`${interaction?.guild?.id}.USER.${user.id}.INVITES`, {
                regular: 0, bonus: 0, leaves: 0, invites: 0
            });
            await client.db.sub(`${interaction.guildId}.USER.${user.id}.INVITES.invites`, amount);
            await client.db.sub(`${interaction.guildId}.USER.${user.id}.INVITES.bonus`, amount);
        }
        ;
        let finalEmbed = new EmbedBuilder()
            .setDescription(lang.removeinvites_confirmation_embed_description
            .replace(/\${amount}/g, amount.toString())
            .replace(/\${user}/g, user.toString()))
            .setColor(`#92A8D1`)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        await client.method.interactionSend(interaction, { embeds: [finalEmbed] });
        await client.method.iHorizonLogs.send(interaction, {
            title: lang.removeinvites_logs_embed_title,
            description: lang.removeinvites_logs_embed_description
                .replace(/\${interaction\.user\.id}/g, interaction.member.user.id)
                .replace(/\${amount}/g, amount.toString())
                .replace(/\${user\.id}/g, user.id)
        });
    },
};
