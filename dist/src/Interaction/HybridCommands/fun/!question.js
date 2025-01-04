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
import { ChatInputCommandInteraction, EmbedBuilder, } from 'discord.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        if (await client.db.get(`${interaction.guildId}.GUILD.FUN.states`) === "off") {
            await client.method.interactionSend(interaction, { content: lang.fun_category_disable });
            return;
        }
        ;
        if (interaction instanceof ChatInputCommandInteraction) {
            var question = interaction.options.getString("question");
            var user = interaction.user;
        }
        else {
            var question = client.method.longString(args, 0);
            var user = interaction.author;
        }
        ;
        let text = question?.split(" ");
        if (!text[2]) {
            await client.method.interactionSend(interaction, { content: lang.question_not_full });
            return;
        }
        let reponses = lang.question_s;
        let embed = new EmbedBuilder()
            .setTitle(lang.question_embed_title
            .replace(/\${interaction\.user\.username}/g, user.globalName || user.username))
            .setColor("#ddd98b")
            .addFields({ name: lang.question_fields_input_embed, value: question, inline: true }, { name: lang.question_fields_output_embed, value: reponses[Math.floor((Math.random() * reponses.length))] })
            .setTimestamp();
        await client.method.interactionSend(interaction, { embeds: [embed] });
        return;
    },
};
