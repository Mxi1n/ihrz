const { Client, Intents, Collection, MessageEmbed, Permissions} = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unban banned user in the guild !',
  options: [
    {
        name: 'userid',
        type: 'STRING',
        description: 'The id of the user you wan\'t to unban !',
        required: true
    },
    {
      name: 'reason',
      type: 'STRING',
      description: 'The reason for unbanning this user.',
      required: false
  }
],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({content: "❌ | You don't have permission to unban members."});
    if (!interaction.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {return interaction.reply({content: `❌ | I don't have permission.`})}//pas les perms pour horizon C
    const userID = interaction.options.getString('userid');
    let reason = interaction.options.getString('reason');
    if(!reason) reason = "No reason was provided."

    await interaction.guild.bans.fetch()
        .then(async bans => {
            if (bans.size == 0) return await interaction.reply({content: "❌ | **There is nobody banned from this server !**"});
            let bannedID = bans.find(ban => ban.user.id == userID);
            if(!bannedID) return await interaction.reply({content: `❌ | **The ID stated is not banned from this server** !`});
            await interaction.guild.bans.remove(userID, reason).catch(err => console.error(err));
            await interaction.reply({content: `<@${userID}> is now unbanned from this server !`})
        })
        .catch(err => console.error(err));

        try{
          logEmbed = new MessageEmbed().setColor("PURPLE").setTitle("Test Logs")
                          .setDescription(`<@${interaction.user.id}> test des truc mdrr`)
                  let logchannel = interaction.guild.channels.cache.find(channel => channel.name === 'ihorizon-logs');
                  if(logchannel) { logchannel.send({embeds: [logEmbed]}) }
                  }catch(e) { console.error(e) };
}}