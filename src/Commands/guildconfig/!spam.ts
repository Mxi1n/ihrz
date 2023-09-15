/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

import {
    Client,
    PermissionsBitField,
    AutoModerationRuleTriggerType
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let turn = interaction.options.getString("action");
        let logs_channel = interaction.options.getChannel('logs-channel');

        let automodRules = await interaction.guild.autoModerationRules.fetch();

        let spamRule = automodRules
            .find((rule: { triggerType: AutoModerationRuleTriggerType; }) => rule.triggerType === AutoModerationRuleTriggerType.Spam);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.blockpub_not_admin });
            return;
        } else if (turn === "on") {

            if (!spamRule) {
                await interaction.guild.autoModerationRules.create({
                    name: 'Block spam by iHorizon',
                    creatorId: client.user?.id,
                    enabled: true,
                    eventType: 1,
                    triggerType: 3,
                    triggerMetadata:
                    {
                        presets: [1, 2, 3]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                customMessage: "This message was prevented by iHorizon"
                            }
                        },
                        {
                            type: 2,
                            metadata: {
                                channel: logs_channel,
                            }
                        }
                    ]
                });

                console.log('Règles (spam) créer!')

            } else if (spamRule) {

                await spamRule.edit({
                    name: 'Block spam by iHorizon',
                    creatorId: client.user?.id,
                    enabled: true,
                    triggerMetadata:
                    {
                        presets: [1, 2, 3]
                    },
                    actions: [
                        {
                            type: 1,
                            metadata: {
                                customMessage: "This message was prevented by iHorizon"
                            }
                        },
                        {
                            type: 2,
                            metadata: {
                                channel: logs_channel,
                            }
                        }
                    ]
                });

                console.log('Règles (spam) modifié!')

            };

            await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.GUILD.GUILD_CONFIG.spam`, value: "on" });
            await interaction.editReply({
                content: data.automod_block_spam_command_on
                    .replace('${interaction.user}', interaction.user)
                    .replace('${logs_channel}', logs_channel)
            });
            return;
        } else if (turn === "off") {

            await spamRule.setEnabled(false);

            await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.GUILD.GUILD_CONFIG.spam`, value: "off" });
            await interaction.editReply({
                content: data.automod_block_spam_command_off
                    .replace('${interaction.user}', interaction.user)
                    .replace('${logs_channel}', logs_channel)
            });
            return;
        };
    },
};