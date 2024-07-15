const {SlashCommandBuilder}=require('discord.js');
const parseMiliSecond=require('parse-ms-2');
const profileSchema=require('../models/profileSchema');
const {dailyMin,dailyMax}=require('../globalValues.json');
module.exports={
    data:new SlashCommandBuilder()
    .setName('daily')
    .setDescription('reedem free coins daily'),
    async execute(interaction,profileData){
        const {id}=interaction.user;
        const {dailyLastUsed}=profileData;

        const cooldown=86400000;

        const timeLeft=cooldown-(Date.now()-dailyLastUsed);
        if(timeLeft>0){
            await interaction.deferReply({
                ephemearl:true
            })
            const {hours,minutes,seconds}=parseMiliSecond(timeLeft);

            await interaction.editReply(`Claim your next daily in ${hours} hrs ${minutes} min ${seconds} sec`);
        }

        await interaction.deferReply();

        const randomAmt=Math.floor(
            Math.random()*(dailyMax-dailyMin+1)+dailyMin
        );

        try {
            await profileSchema.findOneAndUpdate(
                {userId:id},
                {
                    $set:{
                        dailyLastUsed:Date.now(),
                    },
                    $inc:{
                        balance:randomAmt
                    }
                }
            )
        } catch (error) {
            console.log(errro);
        }

        await interaction.editReply(`you redeemed ${randomAmt} coins!`);
    },
};