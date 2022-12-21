module.exports = {
    name: 'unblacklist',
    description: 'Unblacklist a typed member',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'The user you want to unblacklist (you need the operator permission)',
            required: true
        }
    ],
    run: async (client, interaction) => {
        const db = require('quick.db')
        const { Client, Intents, Collection, MessageEmbed, Permissions } = require('discord.js');
        let owner_pp_user = db.fetch(`owner_${interaction.user.id}`)
    
        if(!owner_pp_user || owner_pp_user === null || owner_pp_user === false){
    
    
            const block_antiowner = new MessageEmbed()
            .setTitle(":no_entry: Your are not owner !")
            .setDescription("**"+interaction.user.username+"** you cannot use this command with your current privilege !")
            .setTimestamp()
            .setColor("#2f3136")
            .setFooter(`${interaction.user.username}`)
            return interaction.reply({embeds: [block_antiowner]})
        }
    
        const member = interaction.options.getUser('member')
               if (!member) return interaction.reply({content: "type a user you want to unblacklist"})
               let fetched = db.fetch(`blacklist_${member.id}`)
    
    
          if(!fetched) {
             return interaction.reply(`<@${member.id}> was not blacklisted`)
         }


        try{
            let bannedMember = await client.users.fetch(member.user.id)
            if(!bannedMember){ return interaction.reply(`I couldn't find the user`)}
              interaction.guild.members.unban(bannedMember)
              db.delete(`blacklist_${member.id}`);

              console.log(`<@${bannedMember.id}> **is unblacklisted from this server!**`)
              return interaction.reply(`<@${member.id}> is not longer blacklisted'`)

          }catch(e){
                  db.delete(`blacklist_${member.id}`);
                  return interaction.reply("❌ Is now unlacklisted, Can't unban this member here, missing permission or already unban?")
          }
        

      const filter = (interaction) => interaction.user.id === interaction.member.id;
      }}

  