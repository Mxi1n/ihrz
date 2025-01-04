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
import { OwnIhrzCluster, ClusterMethod } from "../functions/apiUrlParser.js";
import { axios } from "../functions/axios.js";
import logger from "../logger.js";
class OwnIHRZ {
    client;
    constructor(client) {
        this.client = client;
    }
    async Startup_Cluster() {
        this.client.config.core.cluster.forEach(async (x, index) => {
            await axios.post(OwnIhrzCluster({
                cluster_method: ClusterMethod.StartupCluster,
                cluster_number: index
            }), { adminKey: this.client.config.api.apiToken });
        });
    }
    // Working
    async Startup_Container() {
        var table_1 = this.client.db.table("OWNIHRZ");
        (await table_1.all()).forEach(async (owner_one) => {
            var cluster_ownihrz = owner_one.value;
            for (let owner_id in cluster_ownihrz) {
                for (let bot_id in cluster_ownihrz[owner_id]) {
                    if (cluster_ownihrz[owner_id][bot_id].PowerOff || !cluster_ownihrz[owner_id][bot_id].Code)
                        continue;
                    let response = await axios.get(OwnIhrzCluster({
                        cluster_method: ClusterMethod.StartupContainer,
                        cluster_number: parseInt(cluster_ownihrz[owner_id][bot_id].Cluster),
                        bot_id
                    }));
                    logger.log(response.data);
                }
            }
            ;
        });
    }
    ;
    // Working
    async ShutDown(cluster_id, id_to_bot, modifyDb) {
        axios.get(OwnIhrzCluster({
            cluster_method: ClusterMethod.ShutdownContainer,
            cluster_number: cluster_id,
            bot_id: id_to_bot,
            forceDatabaseSet: modifyDb
        })).then(response => {
            logger.log(response.data);
        }).catch(error => { logger.err(error); });
        return 0;
    }
    ;
    // Working
    async PowerOn(cluster_id, id_to_bot) {
        axios.get(OwnIhrzCluster({
            cluster_method: ClusterMethod.PowerOnContainer,
            cluster_number: cluster_id,
            bot_id: id_to_bot,
        })).then(response => {
            logger.log(response.data);
        }).catch(error => { logger.err(error); });
        return 0;
    }
    ;
    // Working
    async Delete(cluster_id, id_to_bot) {
        axios.get(OwnIhrzCluster({
            cluster_method: ClusterMethod.DeleteContainer,
            cluster_number: cluster_id,
            bot_id: id_to_bot,
        })).then(response => {
            logger.log(response.data);
        }).catch(error => { logger.err(error); });
        return 0;
    }
    ;
    // Working
    async QuitProgram() {
        for (const [index, cluster] of this.client.config.core.cluster.entries()) {
            await axios.post(OwnIhrzCluster({
                cluster_method: ClusterMethod.ShutDownCluster,
                cluster_number: index
            }), { adminKey: this.client.config.api.apiToken });
        }
    }
    async Change_Token(cluster_id, botId, bot_token) {
        axios.get(OwnIhrzCluster({
            cluster_method: ClusterMethod.ChangeTokenContainer,
            cluster_number: cluster_id,
            bot_id: botId,
            discord_bot_token: bot_token
        }))
            .then(async () => {
        })
            .catch(error => {
            logger.err(error);
        });
        return;
    }
    ;
    async Create_Container(cluster_id, botData) {
        return await axios.post(OwnIhrzCluster({
            cluster_method: ClusterMethod.CreateContainer,
            cluster_number: cluster_id,
        }), botData, {
            headers: {
                'Accept': 'application/json'
            }
        });
    }
    ;
    async Active_Intents(token) {
        try {
            const response = await fetch("https://discord.com/api/v10/applications/@me", {
                method: "PATCH",
                headers: {
                    Authorization: "Bot " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ flags: 565248 }),
            });
            return await response.json();
        }
        catch (err) {
            logger.err(err);
        }
    }
    ;
    async Get_Bot(discord_bot_token) {
        return await axios.get('https://discord.com/api/v10/applications/@me', {
            headers: {
                Authorization: `Bot ${discord_bot_token}`
            }
        });
    }
    ;
    async Change_Owner(cluster_id, botId, OwnerData) {
        return await axios.post(OwnIhrzCluster({
            cluster_method: ClusterMethod.ChangeOwnerContainer,
            cluster_number: cluster_id,
        }), {
            adminKey: this.client.config.api.apiToken,
            botId,
            OwnerData
        }, { headers: { 'Accept': 'application/json' } });
    }
    async Change_Time(cluster_id, botId, data) {
        return await axios.post(OwnIhrzCluster({
            cluster_method: ClusterMethod.ChangeExpireTime,
            cluster_number: cluster_id,
        }), {
            adminKey: this.client.config.api.apiToken,
            botId,
            data
        }, { headers: { 'Accept': 'application/json' } });
    }
    async GetOwnersList() {
        let ownihrzTable = this.client.db.table("OWNIHRZ");
        let ownihrzData = await ownihrzTable.get("CLUSTER");
        const owners = [];
        for (const botGroup of Object.values(ownihrzData)) {
            for (const botInstance of Object.values(botGroup)) {
                if (!owners.includes(botInstance.OwnerOne)) {
                    owners.push(botInstance.OwnerOne);
                }
                if (botInstance.OwnerTwo && !owners.includes(botInstance.OwnerTwo)) {
                    owners.push(botInstance.OwnerTwo);
                }
            }
        }
        return owners;
    }
}
export { OwnIHRZ };
