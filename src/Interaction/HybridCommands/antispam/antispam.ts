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
    Client,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    Message,
    EmbedBuilder,
} from 'pwss';

import { Command } from '../../../../types/command';
import { LanguageData } from '../../../../types/languageData';

export const command: Command = {
    name: "antispam",

    description: "Subcommand for antispam category!",
    description_localizations: {
        "fr": "Commande sous-groupé pour la catégorie d'antispam"
    },

    options: [
        {
            name: "manage",

            description: "Manage the antispam module",
            description_localizations: {
                "fr": "Gérer le module antispam"
            },

            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "bypass-roles",

            description: "All of the roles wich bypass the antispam",
            description_localizations: {
                "fr": "Tous les rôles qui contournent l'anti spam"
            },

            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "ignore-channels",

            description: "Ignore this channels in the AntiSpam Module",
            description_localizations: {
                "fr": "Ignorer des salons afin que l'AntiSpam ne l'ai prennent pas en compte"
            },

            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
    category: 'antispam',
    thinking: true,
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction | Message, execTimestamp: number, options?: string[]) => {
        let data = await client.func.getLanguageData(interaction.guildId) as LanguageData;
        let fetchedCommand;

        if (interaction instanceof ChatInputCommandInteraction) {
            fetchedCommand = interaction.options.getSubcommand();
        } else {
            if (!options?.[0]) {
                const getType = (type: number): string => {
                    switch (type) {
                        case 3:
                            return "string"
                        case 6:
                            return "user"
                        case 8:
                            return "roles"
                        case 10:
                        case 4:
                            return "number"
                        case 7:
                            return "channel"
                        default:
                            return "default"
                    }
                }
                const embed = new EmbedBuilder()
                    .setTitle(command.name.charAt(0).toUpperCase() + command.name.slice(1) + " Help Embed")
                    .setColor("LightGrey");
                var botPrefix = await client.func.prefix.guildPrefix(client, interaction.guildId!);
                var cleanBotPrefix = botPrefix.string;

                if (botPrefix.type === "mention") { cleanBotPrefix = "`@Ping-Me`" }
                command.options?.map(x => {
                    var pathString = '';
                    var fullNameCommand = command.name + " " + x.name;

                    x.options?.forEach((value) => {
                        value.required ? pathString += "**`[" : pathString += "**`<"
                        pathString += getType(value.type)
                        value.required ? pathString += "]`**" + " " : pathString += ">`**" + " "
                    })
                    embed.addFields({
                        name: cleanBotPrefix + fullNameCommand,
                        value: `**Aliases:** ${x.aliases?.map(x => `\`${x}\``)
                            .join(", ") || "None"}\n**Use:** ${cleanBotPrefix}${fullNameCommand} ${pathString}`
                    })
                })
                interaction.reply({ embeds: [embed] })
                return;
            };

            let cmd = command.options?.find(x => options[0] === x.name || x.aliases?.includes(options[0]));
            if (!cmd) return;

            fetchedCommand = cmd.name;
            options.shift();
        }

        const commandModule = await import(`./!${fetchedCommand}.js`);
        await commandModule.default.run(client, interaction, data, execTimestamp, options);
    },
};