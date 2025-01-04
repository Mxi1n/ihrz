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
import { EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, } from 'discord.js';
import { generateRoleFields } from './economy.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel)
            return;
        if (await client.db.get(`${interaction.guildId}.ECONOMY.disabled`) === true) {
            await client.method.interactionSend(interaction, {
                content: lang.economy_disable_msg
                    .replace('${interaction.user.id}', interaction.member.user.id)
            });
            return;
        }
        ;
        const permissionsArray = [PermissionsBitField.Flags.ManageGuild];
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);
        if (!permissions && neededPerm === 0) {
            await client.method.interactionSend(interaction, {
                content: lang.var_dont_have_perm
                    .replace("{perm}", lang.setjoinroles_var_perm_manage_guild)
            });
            return;
        }
        ;
        var roleData = await client.db.get(`${interaction.guildId}.ECONOMY.buyableRoles`);
        if (!roleData) {
            roleData = {};
        }
        if (Object.keys(roleData).length === 0) {
            await client.method.interactionSend(interaction, {
                content: "There are no buyable roles to list."
            });
            return;
        }
        let embed = new EmbedBuilder()
            .setTitle("Economy System - Buyable Roles")
            .setDescription("All buyable roles are listed below.")
            .setFields(generateRoleFields(roleData, lang))
            .setColor("#0097ff")
            .setTimestamp()
            .setFooter(await client.method.bot.footerBuilder(interaction));
        await client.method.interactionSend(interaction, {
            embeds: [embed],
            files: [await client.method.bot.footerAttachmentBuilder(interaction)]
        });
    },
};
