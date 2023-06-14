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

const { QuickDB } = require("quick.db"),
    { MongoDriver } = require("quickmongo"),
    config = require(`${process.cwd()}/files/config`),
    logger = require(`${process.cwd()}/src/core/logger`),
    couleurmdr = require(`colors`),
    proc = require(`${process.cwd()}/src/core/errorManager`);

let db;

module.exports = new Promise((resolve, reject) => {
    if (config.database.useSqlite) {
        db = new QuickDB();
        logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database.useSqlite ? 'SQLite' : 'MongoDB'}) !`.green);
        resolve(db);
    } else {
        const driver = new MongoDriver(config.database.mongoDb);

        driver.connect()
            .then(() => {
                logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database.useSqlite ? 'SQLite' : 'MongoDB'}) !`.green);
                db = new QuickDB({ driver });
                resolve(db), proc.exit(driver);
            })
            .catch(async (error) => {
                await logger.err(`${config.console.emojis.ERROR} >> ${error.toString().split("\n")[0]}`.red);
                await logger.err(`${config.console.emojis.ERROR} >> Database is unreachable (${config.database.useSqlite ? 'SQLite' : 'MongoDB'}) !`.red);
                await logger.err(`${config.console.emojis.ERROR} >> Please use a different database than ${config.database.useSqlite ? 'SQLite' : 'MongoDB'} !`.red);
                await logger.err(`${config.console.emojis.ERROR} >> in the /files/config.js at: 'database.useSqlite'.`.red);

                await logger.err(`Exiting the code...`.bgRed);

                return process.exit(0);
            });
    };
});