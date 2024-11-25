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

import { JSONDriver, MemoryDriver, MySQLDriver, QuickDB } from 'quick.db';
import { PostgresDriver } from 'quick.db/out/drivers/PostgresDriver.js'
import ansiEscapes from 'ansi-escapes';
import { SteganoDB } from 'stegano.db';
import mysql from 'mysql2/promise.js';
import { PallasDB } from 'pallas-db';
import { setInterval } from 'timers';

import { ConfigData } from '../../types/configDatad.js';
import logger from './logger.js';
import fs from 'fs';

export type db = QuickDB<any> | SteganoDB | PallasDB;
let dbInstance: db | null = null;

const tables = ['json', 'OWNER', 'OWNIHRZ', 'BLACKLIST', 'PREVNAMES', 'API', 'TEMP', 'SCHEDULE', 'USER_PROFIL', "RESTORECORD"];
const readOnlyTables = ["RESTORECORD", "OWNIHRZ"];

async function isReachable(database: ConfigData['database']): Promise<boolean> {
    let connection;
    try {
        connection = await mysql.createConnection(database?.mySQL!);
        await connection.end();
        return true;
    } catch (error) {
        return false;
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
};

const overwriteLastLine = (message: string) => {
    process.stdout.write(ansiEscapes.eraseLine);
    process.stdout.write(ansiEscapes.cursorLeft);
    process.stdout.write(message);
};

export async function initializeDatabase(config: ConfigData): Promise<db> {
    if (dbInstance !== null) {
        return dbInstance;
    }

    let dbPromise: Promise<QuickDB<any>> | SteganoDB | PallasDB | Promise<PallasDB>;
    let databasePath = `${process.cwd()}/src/files`;

    if (!fs.existsSync(databasePath)) {
        fs.mkdirSync(databasePath, { recursive: true });
    }

    switch (config.database?.method) {
        case 'JSON':
            dbPromise = new Promise<QuickDB>((resolve, reject) => {
                logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`.green);
                resolve(new QuickDB({ driver: new JSONDriver() }));
            });
            break;
        case 'MYSQL':
            dbPromise = new Promise<QuickDB>(async (resolve, reject) => {
                const connectionAvailable = await isReachable(config.database);

                if (!connectionAvailable) {
                    console.error(`${config.console.emojis.ERROR} >> Failed to connect to the MySQL database`);
                    process.exit(1)
                };

                logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`.green);

                const mysql = new MySQLDriver({
                    host: config.database?.mySQL?.host,
                    user: config.database?.mySQL?.user,
                    password: config.database?.mySQL?.password,
                    database: config.database?.mySQL?.database,
                    port: config.database?.mySQL?.port,
                });

                await mysql.connect();

                const db = new QuickDB({ driver: mysql });
                for (let table of tables) {
                    db.table(table);
                };
                resolve(db);
            });
            break;
        case 'POSTGRES':
            dbPromise = new Promise<QuickDB>(async (resolve, reject) => {
                // const connectionAvailable = await isReachable(config.database);

                // if (!connectionAvailable) {
                //     console.error(`${config.console.emojis.ERROR} >> Failed to connect to the Postgres database`);
                //     process.exit(1)
                // };

                logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`.green);

                const mysql = new PostgresDriver({
                    host: config.database?.mySQL?.host,
                    user: config.database?.mySQL?.user,
                    password: config.database?.mySQL?.password,
                    database: config.database?.mySQL?.database,
                    port: config.database?.mySQL?.port,
                });

                await mysql.connect();

                const db = new QuickDB({ driver: mysql });
                for (let table of tables) {
                    db.table(table);
                };
                resolve(db);
            });
            break;
        case 'POSTGRES2':
            dbPromise = new PallasDB({
                host: config.database?.mySQL?.host,
                username: config.database?.mySQL?.user,
                password: config.database?.mySQL?.password,
                database: config.database?.mySQL?.database,
                port: config.database?.mySQL?.port,
                dialect: "postgres",
                tables
            });

            logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`.green);
            break;
        case 'CACHED_POSTGRES':
            dbPromise = new Promise<QuickDB>(async (resolve, reject) => {
                logger.log(`${config.console.emojis.HOST} >> Initializing cached Postgres database setup (${config.database?.method}) !`.green);

                const postgres = new PostgresDriver({
                    host: config.database?.mySQL?.host,
                    user: config.database?.mySQL?.user,
                    password: config.database?.mySQL?.password,
                    database: config.database?.mySQL?.database,
                    port: config.database?.mySQL?.port,
                });

                await postgres.connect();
                const postgresDb = new QuickDB({ driver: postgres });
                const memoryDB = new QuickDB({ driver: new MemoryDriver() });

                for (const table of tables) {
                    const memoryTable = memoryDB.table(table);
                    const allData = await (postgresDb.table(table)).all();

                    for (const { id, value } of allData) {
                        await memoryTable.set(id, value);
                    }
                }

                const syncToPostgres = async () => {
                    for (const table of tables) {
                        const postgresTable = postgresDb.table(table);
                        const memoryTable = memoryDB.table(table);

                        const postgresData = await postgresTable.all();
                        const memoryData = await memoryTable.all();

                        const postgresMap = new Map(postgresData.map(item => [item.id, item.value]));
                        const memoryMap = new Map(memoryData.map(item => [item.id, item.value]));

                        for (const [id, value] of memoryMap) {
                            const postgresValue = postgresMap.get(id);
                            if (!postgresValue || JSON.stringify(postgresValue) !== JSON.stringify(value)) {
                                try {
                                    if (readOnlyTables.includes(table)) {
                                        for (const { id, value } of postgresData) {
                                            await memoryTable.set(id, value);
                                        }
                                    } else {
                                        await postgresTable.set(id, value);
                                    }
                                } catch (error) {
                                    logger.err(error as any);
                                }
                            }
                        }
                    }

                    overwriteLastLine(logger.returnLog(`${config.console.emojis.HOST} >> Synchronized memory database to Postgres !`));
                };

                setInterval(syncToPostgres, 60000 * 5);
                resolve(memoryDB);
            });
            break;
        case 'CACHED_POSTGRES2':
            dbPromise = new Promise<QuickDB>(async (resolve, reject) => {
                logger.log(`${config.console.emojis.HOST} >> Initializing cached Postgres database setup (${config.database?.method}) !`.green);

                const postgresDb = new PallasDB({
                    dialect: "postgres",
                    tables,
                    host: config.database?.mySQL?.host,
                    port: config.database?.mySQL?.port,
                    database: config.database?.mySQL?.database,
                    username: config.database?.mySQL?.user,
                    password: config.database?.mySQL?.password,
                });

                const memoryDB = new QuickDB({ driver: new MemoryDriver() });

                for (const table of tables) {
                    const memoryTable = memoryDB.table(table);
                    const allData = await (postgresDb.table(table)).all();

                    for (const { id, value } of allData) {
                        await memoryTable.set(id, value);
                    }
                }

                const syncToPostgres = async () => {
                    for (const table of tables) {
                        const postgresTable = postgresDb.table(table);
                        const memoryTable = memoryDB.table(table);

                        const postgresData = await postgresTable.all();
                        const memoryData = await memoryTable.all();

                        const postgresMap = new Map(postgresData.map(item => [item.id, item.value]));
                        const memoryMap = new Map(memoryData.map(item => [item.id, item.value]));

                        for (const [id, value] of memoryMap) {
                            const postgresValue = postgresMap.get(id);
                            if (!postgresValue || JSON.stringify(postgresValue) !== JSON.stringify(value)) {
                                try {
                                    if (readOnlyTables.includes(table)) {
                                        for (const { id, value } of postgresData) {
                                            await memoryTable.set(id, value);
                                        }
                                    } else {
                                        await postgresTable.set(id, value);
                                    }
                                } catch (error) {
                                    logger.err(error as any);
                                }
                            }
                        }
                    }

                    overwriteLastLine(logger.returnLog(`${config.console.emojis.HOST} >> Synchronized memory database to Postgres !`));
                };

                setInterval(syncToPostgres, 60000 * 5);
                resolve(memoryDB);
            });
            break;
        case 'SQLITE':
            dbPromise = new PallasDB({ dialect: "sqlite", tables: tables, storage: databasePath + "/db.sqlite" });
            logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`);
            break;
        case 'PNG':
            dbPromise = new SteganoDB(databasePath + '/db.png');
            logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`);
            break;
        case 'JSON2':
            dbPromise = new SteganoDB({ driver: "json", filePath: databasePath + '/db.json' });
            logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`);
            break;
        case 'CACHED_SQL':
            dbPromise = new Promise<QuickDB>(async (resolve, reject) => {
                const connectionAvailable = await isReachable(config.database);

                if (!connectionAvailable) {
                    console.error(`${config.console.emojis.ERROR} >> Failed to connect to the MySQL database`);
                    process.kill(1)
                };

                logger.log(`${config.console.emojis.HOST} >> Initializing cached database setup (${config.database?.method}) !`.green);

                const mysql = new MySQLDriver({
                    host: config.database?.mySQL?.host,
                    user: config.database?.mySQL?.user,
                    password: config.database?.mySQL?.password,
                    database: config.database?.mySQL?.database,
                    port: config.database?.mySQL?.port,
                });

                await mysql.connect();

                const mysqlDb = new QuickDB({ driver: mysql });
                const memoryDB = new QuickDB({ driver: new MemoryDriver() });

                for (const table of tables) {
                    const memoryTable = memoryDB.table(table);
                    const allData = await (mysqlDb.table(table)).all();
                    for (const { id, value } of allData) {
                        await memoryTable.set(id, value);
                    }
                }

                const syncToMySQL = async () => {
                    for (const table of tables) {
                        const mysqlTable = mysqlDb.table(table);
                        const memoryTable = memoryDB.table(table);
                        const allData = await memoryTable.all();
                        for (const { id, value } of allData) {
                            try {
                                await mysqlTable.set(id, value);
                            } catch (error) {
                                logger.err(error as any)
                            }
                        }
                    }

                    overwriteLastLine(logger.returnLog(`${config.console.emojis.HOST} >> Synchronized memory database to MySQL`))
                };

                setInterval(syncToMySQL, 60000 * 5);
                resolve(memoryDB);
            });
            break;
        default:
            dbPromise = new Promise<QuickDB>((resolve, reject) => {
                logger.log(`${config.console.emojis.HOST} >> Connected to the database (${config.database?.method}) !`.green);
                resolve(new QuickDB({ filePath: databasePath + '/db.sqlite' }));
            });
            break;
    }

    dbInstance = await dbPromise

    return dbInstance;
};

export function getDatabaseInstance(): db {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Call initializeDatabase first.');
    }
    return dbInstance;
};