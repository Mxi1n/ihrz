const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require('ms')
const {
  Client,
  Intents,
  Collection,
  EmbedBuilder,
  Permissions,
  ApplicationCommandType,
  PermissionsBitField,
  ApplicationCommandOptionType
} = require('discord.js');

const yaml = require('js-yaml'), fs = require('fs');
module.exports = {
  name: 'weekly',
  description: 'Earn your weekly gain from you work',
  run: async (client, interaction) => {
    let fileContents = fs.readFileSync(process.cwd()+"/files/lang/en-US.yml", 'utf-8');
    let data = yaml.load(fileContents)
    
    let timeout = 604800000
    let amount = 1000
    let weekly = await db.get(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.weekly`);

    if (weekly !== null && timeout - (Date.now() - weekly) > 0) {
      let time = ms(timeout - (Date.now() - weekly));

      interaction.reply({ content: data.weekly_cooldown_error
        .replace(/\${time}/g, time)
      })
    } else {
      let embed = new EmbedBuilder()
        .setAuthor({ name: data.weekly_embed_title, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        .setColor("#a4cb80")
        .setDescription(data.weekly_embed_description)
        .addFields({ name: data.weekly_embed_fields, value: `${amount}🪙` })


      interaction.reply({ embeds: [embed] })
      return await db.add(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.money`, amount),
        await db.set(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.weekly`, Date.now()),
        filter = (interaction) => interaction.user.id === interaction.member.id;
    }
  }
}