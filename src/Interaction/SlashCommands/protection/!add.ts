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
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildMember,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, command: Option | Command | undefined, allowed: boolean) => {        


        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        let baseData = await client.db.get(`${interaction.guildId}.ALLOWLIST`);
        let member = interaction.options.getMember('member') as GuildMember;

        if (interaction.user.id !== interaction.guild.ownerId) {
            await interaction.reply({ content: lang.allowlist_add_not_owner });
            return;
        };

        if (interaction.user.id !== interaction.guild.ownerId && baseData.list[interaction.user.id]?.allowed !== true) {
            await interaction.reply({ content: lang.allowlist_add_not_permited });
            return;
        };

        if (!member) {
            await interaction.reply({ content: lang.allowlist_add_member_unreachable });
            return;
        };

        if (baseData?.list[member.user.id]?.allowed == true) {
            await interaction.reply({ content: lang.allowlist_add_already_in });
            return;
        };

        await client.db.set(`${interaction.guild.id}.ALLOWLIST.list.${member.user.id}`, { allowed: true });
        await interaction.reply({
            content: lang.allowlist_add_command_work
                .replace('${member.user}', member.user.toString())
        });
        return;
    },
};