const {SlashCommandBuilder}=require('discord.js');
const profileSchema=require('../models/profileSchema');
module.exports={
    data:new SlashCommandBuilder()
    .setName('donate')
    .setDescription('donaet your coins to another userr')
    .addUserOption((option)=>
        option
            .setName('user')
            .setDescription('The user you want to donate to')
            .setRequired(true)
    ).addIntegerOption((option)=>
        option  
            .setName('amount')
            .setDescription('The amount of coins you want to donate')
            .setRequired(true)
    ),
    async execute(interaction,profileData){
        const receiveUser=interaction.options.getUser('user');
        const donateAmt=interaction.options.getInteger('amount');

        const {balance}=profileData;

        if(balance<donateAmt){
            await interaction.deferReply({ephemeral:true});
            return await interaction.editReply(`you do not have ${donateAmt} coins in your balance`);
        }

        const reciveUserData=await profileSchema.findOneAndUpdate(
            {
                userId:receiveUser.id,
            },
            {
                $inc:{
                    balance:donateAmt,
                },
            }
        );
        if(!reciveUserData){
            return await interaction.editReply(`${receiveUser.username} is not in the server`);
        }
        await interaction.deferReply();

        await profileSchema.findOneAndUpdate(
            {
                userId:interaction.user.id,
            },
            {
                $inc:{
                    balance:-donateAmt,
                }
            }
        );
        interaction.editReply(`you have donated ${donateAmt} coins to ${receiveUser.username}`);
    },
};