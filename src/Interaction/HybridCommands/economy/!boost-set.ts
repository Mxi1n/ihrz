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

import {
    Client,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Message,
    PermissionsBitField,
    Role,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';
import { DatabaseStructure } from '../../../../types/database_structure.js';
import { generateRoleFields } from './economy.js';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, command: Command, neededPerm: number, args?: string[]) => {
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel) return;


        if (await client.db.get(`${interaction.guildId}.ECONOMY.disabled`) === true) {
            await client.method.interactionSend(interaction, {
                content: lang.economy_disable_msg
                    .replace('${interaction.user.id}', interaction.member.user.id)
            });
            return;
        };

        const permissionsArray = [PermissionsBitField.Flags.ManageGuild]
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
            var role = interaction.options.getRole("role") as Role;
            var boost = parseInt(interaction.options.getString("boost")!);
        } else {
            var role = client.method.role(interaction, args!, 0) as Role;
            var boost = client.method.number(args!, 1);
        }

        var roleData = await client.db.get(`${interaction.guildId}.ECONOMY.buyableRoles`) as DatabaseStructure.EconomyModel["buyableRoles"];
        if (!roleData) {
            roleData = {};
        }

        // check if the roles has dangerous permissions
        let rolePermissions = new PermissionsBitField(role.permissions);
        let roleDangerousPermissions: string[] = [];

        for (const perm of client.method.getDangerousPermissions(lang)) {
            if (rolePermissions.has(perm.flag)) {
                roleDangerousPermissions.push(perm.name);
            }
        }

        // send message if the role doeesnt exist
        if (!roleData?.[role.id]) {
            await client.method.interactionSend(interaction, {
                content: lang.economy_boost_role_not_found
            });
            return;
        }

        roleData[role.id]["boost"] = boost;

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