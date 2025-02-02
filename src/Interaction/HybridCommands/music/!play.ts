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
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildMember,
    InteractionEditReplyOptions,
    Message,
    MessagePayload,
    MessageReplyOptions,
    time,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData';
import maskLink from '../../../core/functions/maskLink.js';
import { Command } from '../../../../types/command';

import { SearchResult } from 'lavalink-client/dist/types';

import { SubCommand } from '../../../../types/command';

export const subCommand: SubCommand = {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, args?: string[]) => {

        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

        let voiceChannel = (interaction.member as GuildMember).voice.channel;

        if (interaction instanceof ChatInputCommandInteraction) {
            var query = interaction.options.getString("title")!;
        } else {
            
            var query = client.method.longString(args!, 0)!
        }

        if (!voiceChannel) {
            await client.method.interactionSend(interaction, { content: lang.p_not_in_voice_channel });
            return;
        };

        if (!client.func.isAllowedLinks(query)) {
            return client.method.interactionSend(interaction, { content: lang.p_not_allowed })
        };

        let res: SearchResult | undefined;
        let node;

        for (let _node of client.player.nodeManager.nodes.values()) {
            if (_node.connected === false) continue;

            res = await _node?.search({ query }, interaction.member.user)

            if (res?.tracks.length! > 0) {
                node = _node;
                break;
            }
        }

        let player = client.player.createPlayer({
            guildId: interaction.guildId as string,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channelId,
            selfDeaf: true,
            selfMute: false,
            node
        });

        if (!res || res.tracks.length === 0) {
            let results = new EmbedBuilder()
                .setTitle(lang.p_embed_title)
                .setColor('#ff0000')
                .setTimestamp();

            await client.method.interactionSend(interaction, { embeds: [results] });
            return;
        }

        res.tracks.forEach((t) => {
            t.info.title = maskLink(t.info.title);
        });

        if (!player.connected) {
            await player.connect();
        }

        await player.queue.add(res.loadType === "playlist" ? res.tracks : res.tracks[0]);

        if (!player.playing) {
            await player.play();
        }

        let channel = interaction.guild.channels.cache.get(player.textChannelId as string);

        (channel as BaseGuildTextChannel).send({
            embeds: [
                new EmbedBuilder()
                    .setColor(2829617)
                    .setDescription(lang.event_mp_audioTrackAdd
                        .replace("${client.iHorizon_Emojis.icon.Music_Icon}", client.iHorizon_Emojis.icon.Music_Icon)
                        .replace("${track.title}", res.tracks[0].info.title as string)
                    )
            ]
        });

        let yes = res.tracks[0];

        function timeCalcultator() {
            let totalDurationMs = yes.info.duration;
            let totalDurationSec = Math.floor(totalDurationMs! / 1000);
            let hours = Math.floor(totalDurationSec / 3600);
            let minutes = Math.floor((totalDurationSec % 3600) / 60);
            let seconds = totalDurationSec % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        let embed = new EmbedBuilder()
            .setDescription(`**${yes.info.title}**`)
            .setColor('#00cc1a')
            .setTimestamp()
            .setFooter({ text: lang.p_duration + `${timeCalcultator()}` })
            .setThumbnail(yes.info.artworkUrl as string);

        const i = await client.method.interactionSend(interaction, {
            content: lang.p_loading_message
                .replace("${client.iHorizon_Emojis.icon.Timer}", client.iHorizon_Emojis.icon.Timer)
                .replace("{result}", res.loadType === "playlist" ? 'playlist' : 'track')
            , embeds: [embed]
        });

        function deleteContent() {
            i.edit({ content: null });
        }

        await client.db.push(`${player.guildId}.MUSIC_HISTORY.buffer`,
            `[${(new Date()).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}: PLAYED]: { ${res.tracks[0].requester} - ${res.tracks[0].info.title as string} | ${res.tracks[0].info.uri} } by ${res.tracks[0].requester}`);
        await client.db.push(`${player.guildId}.MUSIC_HISTORY.embed`,
            `${time(new Date(), 'R')}: ${player.queue.current?.requester} - ${player.queue.current?.info.title} | ${player.queue.current?.info.uri} by ${player.queue.current?.requester}`
        );

        setTimeout(deleteContent, 3000);
        return;
    },
};