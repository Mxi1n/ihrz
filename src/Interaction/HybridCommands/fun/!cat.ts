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
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    Message,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData';
import { axios } from '../../../core/functions/axios.js';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, command: Option | Command | undefined, neededPerm: number, args?: string[]) => {
        let permCheck = await client.method.permission.checkCommandPermission(interaction, command!);
        if (!permCheck.allowed) return client.method.permission.sendErrorMessage(interaction, lang, permCheck.neededPerm || 0);

        if (await client.db.get(`${interaction.guildId}.GUILD.FUN.states`) === "off") {
            await client.method.interactionSend(interaction, { content: lang.fun_category_disable });
            return;
        };
        axios.get('http://edgecats.net/random').then(async res => {
            let emb = new EmbedBuilder()
                .setImage(res.data)
                .setTitle(lang.cats_embed_title)
                .setTimestamp();

            await client.method.interactionSend(interaction, { embeds: [emb] });
            return;
        });
    },
};