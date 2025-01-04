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
import { REST, Routes } from 'discord.js';
import logger from "./logger.js";
import { getToken } from './functions/getToken.js';
const synchronizeCommands = async (client) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rest = new REST().setToken(await getToken() || process.env.BOT_TOKEN || client.config.discord.token);
            logger.log(`${client.config.console.emojis.LOAD} >> Currently ${client.commands?.size || 0} of slash (/) commands awaiting for refreshing.`.white);
            logger.log(`${client.config.console.emojis.LOAD} >> Currently ${client.applicationsCommands?.size || 0} of application ([]) commands awaiting for refreshing.`.white);
            let appCmds = (client.applicationsCommands || []).map((command) => ({
                name: command.name,
                type: command.type,
            }));
            let slashCommands = client.commands?.map((command) => ({
                name: command.name,
                type: command.type,
                description: command.description,
                description_localizations: command.description_localizations,
                options: command.options,
                integration_types: command.integration_types || [0],
                contexts: command.contexts || [0]
            })) || [];
            let allCommands = [...slashCommands, ...appCmds];
            let data = await rest.put(Routes.applicationCommands(client.user?.id), { body: allCommands });
            logger.log(`${client.config.console.emojis.OK} >> Currently ${data.length} of application are now synchronized.`.white);
            resolve();
        }
        catch (error) {
            logger.err(error);
            reject(error);
        }
    });
};
export default synchronizeCommands;
