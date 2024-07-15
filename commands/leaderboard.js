const {SlashCommandBuilder}=require('discord.js');
const profileSchema=require('../models/profileSchema');
const {EmbedBuilder}=require('@discordjs/builders');

module.exports={
    data:new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('shows leader board top 10'),
    async execute(interaction,profileData){
        await interaction.deferReply();

        const {username,id}=interaction.user;
        const {balance}=profileData;

        let leaderBoardEmbed=new EmbedBuilder()
            .setTitle('**Top 10 Coin Earners**')
            .setColor(0x45d6fd)
            .setFooter({text:'you are not ranked yet'});

        const members=await profileSchema.find().sort({balance:-1}).catch((error)=>{console.log(error)});

        const memberIdx=members.findIndex((member)=>member.userId===id);

        leaderBoardEmbed.setFooter({text:`${username}, you're rank #${memberIdx+1} with ${balance}`});

        const topTen=members.slice(0,10);

        let desc="";
        for(let i=0;i<topTen.length;i++){
            let {user}=await interaction.guild.members.fetch(topTen[i].userId);
            if(!user)
                return;
            let userBalance=topTen[i].balance;
            desc+=`**${i+1}. ${user.username}:** ${userBalance} coins\n`
        }
        if(desc!==""){
            leaderBoardEmbed.setDescription(desc);
        }

        await interaction.editReply({embeds:[leaderBoardEmbed]});
    },
};