const { Events } = require("discord.js");
const profileSchema=require('../models/profileSchema');
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        
        let profileData;

        try {
            profileData=await profileSchema.findOne({userId:interaction.user.id});
            if(!profileData){
                profileData=await profileSchema.create({
                    userId:interaction.user.id,
                    serverId:interaction.guild.id
                });
            }
        } catch (error) {
            console.log(error);
        }

        const command = interaction.client.commands.get(interaction.commandName);
 
        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }
 
        try {
            await command.execute(interaction,profileData);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};