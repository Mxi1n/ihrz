import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Client,
    GuildMember,
    Message,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { SubCommandArgumentValue } from '../../../core/functions/method';
import { DatabaseStructure } from '../../../../types/database_structure';
import { readFileSync } from 'fs';
import path from 'path';
import {
    calculateActiveChannels,
    calculateActiveVoiceChannels,
    calculateMessageTime,
    calculateVoiceActivity,
    getChannelMessagesCount,
    getChannelMinutesCount,
    getChannelName,
} from "../../../core/functions/userStatsUtils.js";

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction | Message, data: LanguageData, command: SubCommandArgumentValue, execTimestamp?: number, args?: string[]) => {
        // Guard's Typing
        if (!client.user || !interaction.guild || !interaction.channel) return;

        let leaderboardData: {
            member: GuildMember,
            dailyMessages: number,
            weeklyMessages: number,
            monthlyMessages: number,
            dailyVoiceActivity: number,
            weeklyVoiceActivity: number,
            monthlyVoiceActivity: number
        }[] = [];

        const nowTimestamp = Date.now();
        const dailyTimeout = 86_400_000; // 24 hours in ms
        const weeklyTimeout = 604_800_000; // One week in ms
        const monthlyTimeout = 2_592_000_000; // One month in ms

        const res = await client.db.get(`${interaction.guildId}.STATS`) as DatabaseStructure.GuildStats | null;

        let memberStats: {
            [memberId: string]: {
                dailyMessages: number,
                weeklyMessages: number,
                monthlyMessages: number,
                dailyVoice: number,
                weeklyVoice: number,
                monthlyVoice: number
            }
        } = {};

        let channelStats: {
            [channelId: string]: {
                dailyMessages: number,
                weeklyMessages: number,
                monthlyMessages: number,
                dailyVoice: number,
                weeklyVoice: number,
                monthlyVoice: number
            }
        } = {};

        let allMessages: DatabaseStructure.StatsMessage[] = [];
        let allVoiceActivities: DatabaseStructure.StatsVoice[] = [];

        for (let memberId in res?.USER) {
            let userData = res.USER[memberId];
            let dailyMessages = 0, weeklyMessages = 0, monthlyMessages = 0;
            let dailyVoice = 0, weeklyVoice = 0, monthlyVoice = 0;

            allMessages = [...allMessages, ...userData.messages || []];
            allVoiceActivities = [...allVoiceActivities, ...userData.voices || []];

            let member = interaction.guild.members.cache.get(memberId);

            userData.messages?.forEach(message => {
                if (nowTimestamp - message.sentTimestamp <= dailyTimeout) {
                    dailyMessages++;
                }
                if (nowTimestamp - message.sentTimestamp <= weeklyTimeout) {
                    weeklyMessages++;
                }
                if (nowTimestamp - message.sentTimestamp <= monthlyTimeout) {
                    monthlyMessages++;
                }
            });

            userData.voices?.forEach(voice => {
                let voiceDuration = voice.endTimestamp - voice.startTimestamp;
                if (nowTimestamp - voice.endTimestamp <= dailyTimeout) {
                    dailyVoice += voiceDuration;
                }
                if (nowTimestamp - voice.endTimestamp <= weeklyTimeout) {
                    weeklyVoice += voiceDuration;
                }
                if (nowTimestamp - voice.endTimestamp <= monthlyTimeout) {
                    monthlyVoice += voiceDuration;
                }
            });

            leaderboardData.push({
                member: member!,
                dailyMessages: dailyMessages,
                weeklyMessages: weeklyMessages,
                monthlyMessages: monthlyMessages,
                dailyVoiceActivity: dailyVoice,
                weeklyVoiceActivity: weeklyVoice,
                monthlyVoiceActivity: monthlyVoice
            });

            memberStats[memberId] = { dailyMessages, weeklyMessages, monthlyMessages, dailyVoice, weeklyVoice, monthlyVoice };
        }

        function topThree(obj: { [key: string]: { [statKey: string]: number } }, key: string) {
            return Object.entries(obj)
                .sort(([, a], [, b]) => (b[key] as number) - (a[key] as number))
                .slice(0, 3)
                .map(([id, stats]) => ({ id, ...(stats as object) }));
        }

        let [firstActiveChannel, secondActiveChannel, thirdActiveChannel] = topThree(channelStats, 'dailyMessages').map(item => item.id)
        let [firstActiveVoiceChannel, secondActiveVoiceChannel, thirdActiveVoiceChannel] = topThree(channelStats, 'dailyVoice').map(item => item.id);

        var htmlContent = readFileSync(path.join(process.cwd(), 'src', 'assets', 'guildStatsLeaderboard.html'), 'utf-8');

        htmlContent = htmlContent
            .replaceAll('{header_h1_value}', data.header_h1_value)
            .replaceAll("{guild_pfp}", interaction.guild.iconURL({ size: 512 }) || client.user.displayAvatarURL({ size: 512 }))
            .replaceAll("{author_username}", interaction.guild.name)
            .replaceAll('{top_message_users}', leaderboardData.map((user, index) => `
            <div class="list-item">
                <span>${index + 1}. @${user.member.user.username}</span>
                <span>1d: ${user.dailyMessages} ${data.messages_word}, 7d: ${user.weeklyMessages} ${data.messages_word}, 30d: ${user.monthlyMessages} ${data.messages_word}</span>
            </div>
        `).join(''))
            .replaceAll('{top_text_channels}', `
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, firstActiveChannel)}</span>
                <span>${getChannelMessagesCount(firstActiveChannel, allMessages)} ${data.messages_word}</span>
            </div>
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, secondActiveChannel)}</span>
                <span>${getChannelMessagesCount(secondActiveChannel, allMessages)} ${data.messages_word}</span>
            </div>
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, thirdActiveChannel)}</span>
                <span>${getChannelMessagesCount(thirdActiveChannel, allMessages)} ${data.messages_word}</span>
            </div>
        `)
            .replaceAll('{top_voice_channels}', `
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, firstActiveVoiceChannel)}</span>
                <span>${getChannelMinutesCount(firstActiveVoiceChannel, allVoiceActivities)} ${data.minutes_word}</span>
            </div>
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, secondActiveVoiceChannel)}</span>
                <span>${getChannelMinutesCount(secondActiveVoiceChannel, allVoiceActivities)} ${data.minutes_word}</span>
            </div>
            <div class="list-item">
                <span># ${getChannelName(interaction.guild, thirdActiveVoiceChannel)}</span>
                <span>${getChannelMinutesCount(thirdActiveVoiceChannel, allVoiceActivities)} ${data.minutes_word}</span>
            </div>
        `);

        const image = await client.method.imageManipulation.html2Png(htmlContent, {
            width: 1280,
            height: 720,
            scaleSize: 2,
            elementSelector: '.container',
            omitBackground: true,
            selectElement: true,
        });

        const attachment = new AttachmentBuilder(image, { name: 'leaderboard.png' });

        await client.method.interactionSend(interaction, { files: [attachment] });
    },
};