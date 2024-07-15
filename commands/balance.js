const {SlashCommandBuilder}=require('discord.js');

module.exports={
    data:new SlashCommandBuilder()
    .setName('balance')
    .setDescription('shows balance'),
    async execute(interaction,profileData){
        const {balance}=profileData;
        const username=interaction.user.username;
        await interaction.reply(`${username} has balance ${balance} coins`);
    },
};