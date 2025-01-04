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
import { promptYesOrNo } from '../../../core/functions/awaitingResponse.js';
import { generateRoleFields } from './economy.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel)
            return;
        const permissionsArray = [PermissionsBitField.Flags.ManageGuild];
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);
        if (!permissions && neededPerm === 0) {
            await client.method.interactionSend(interaction, {
                content: lang.var_dont_have_perm.replace("{perm}", lang.setjoinroles_var_perm_manage_guild)
            });
            return;
        }
        if (interaction instanceof ChatInputCommandInteraction) {
            var role = interaction.options.getRole("role");
            var amount = interaction.options.getNumber("amount");
        }
        else {
            var role = client.method.role(interaction, args, 0);
            var amount = client.method.number(args, 1);
        }
        var roleData = await client.db.get(`${interaction.guildId}.ECONOMY.buyableRoles`);
        if (!roleData) {
            roleData = {};
        }
        // check if the roles has dangerous permissions
        let rolePermissions = new PermissionsBitField(role.permissions);
        let roleDangerousPermissions = [];
        for (const perm of client.method.getDangerousPermissions(lang)) {
            if (rolePermissions.has(perm.flag)) {
                roleDangerousPermissions.push(perm.name);
            }
        }
        // send message if the role has dangerous permissions
        if (roleDangerousPermissions.length > 0) {
            let stringDangerousPermissions = roleDangerousPermissions
                .map(x => "`" + x + "`")
                .join(", ");
            var response = await promptYesOrNo(interaction, {
                content: lang.economy_role_add_prompt_dangerous
                    .replace("${stringDangerousPermissions}", stringDangerousPermissions),
                noButton: lang.var_no,
                yesButton: lang.var_yes,
                dangerAction: true
            });
            if (!response)
                return client.method.interactionSend(interaction, {
                    content: lang.economy_role_add_canceled,
                    components: []
                }); // if the user responds with no
        }
        if (Object.keys(roleData).length >= 20) {
            await client.method.interactionSend(interaction, {
                content: lang.economy_role_add_max_20_roles,
                components: []
            });
            return;
        }
        roleData[role.id] = {
            price: amount
        };
        await client.db.set(`${interaction.guildId}.ECONOMY.buyableRoles`, roleData);
        let embed = new EmbedBuilder()
            .setTitle(lang.economy_boost_embed_title)
            .setDescription(lang.economy_boost_embed_desc)
            .setFields(generateRoleFields(roleData, lang))
            .setColor("#0097ff")
            .setTimestamp()
            .setFooter(await client.method.bot.footerBuilder(interaction));
        await client.method.interactionSend(interaction, {
            content: null,
            embeds: [embed],
            components: [],
            files: [await client.method.bot.footerAttachmentBuilder(interaction)]
        });
    },
};
