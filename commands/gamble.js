const {SlashCommandBuilder,ButtonStyle, Component}=require('discord.js');
const {EmbedBuilder,ActionRowBuilder,ButtonBuilder}=require('@discordjs/builders');
const profileSchema=require('../models/profileSchema');
module.exports={
    data:new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble with your money')
    .addSubcommand((subcommand)=>
        subcommand.setName('three-doors')
                   .setDescription('Can double,half or lose your gamble')
                   .addIntegerOption((option)=>
                    option.setName('amount')
                           .setDescription('Choose the amount you want to gamble')
                           .setMaxValue(100)
                           .setMinValue(2)
                           .setRequired(true)
                )
    ),
    async execute(interaction,profileData){
        const {username,id}=interaction.user;
        const {balance}=profileData;

        const gambleCommand=interaction.options.getSubcommand();
        const gambleEmbed=new EmbedBuilder().setColor(0x00aa6d);

        if(gambleCommand==='three-doors'){
            const amount=interaction.options.getInteger('amount');

            if(balance<amount){
                await interaction.deferReply({ephemeral:true});
                return await interaction.editReply(`you don't have ${amount} to gamble with`);
            }

            await interaction.deferReply();

            const button1=new ButtonBuilder()
                .setCustomId('one')
                .setLabel('Door 1')
                .setStyle(ButtonStyle.Primary);
            const button2=new ButtonBuilder()
                .setCustomId('two')
                .setLabel('Door 2')
                .setStyle(ButtonStyle.Primary);
            const button3=new ButtonBuilder()
                .setCustomId('three')
                .setLabel('Door 3')
                .setStyle(ButtonStyle.Primary);
            const row=new ActionRowBuilder()
                .addComponents(button1,button2,button3);
            
            gambleEmbed.setTitle(`palying three doors for ${amount} coins`)
                .setFooter({text:'Each door has DOUBLE COINS, LOSE HALF, LOSE ALL'});
            await interaction.editReply({embeds:[gambleEmbed],components:[row]});

            const message=await interaction.fetchReply();

            const filter=(i)=>i.user.id===interaction.user.id;

            const collector=message.createMessageComponentCollector({
                filter,
                time:60000,
            });
            const double='DOUBLE COINS';
            const half='HALF COINS';
            const lose='LOSE ALL';

            const getAmount=(label, gamble)=>{
                let amount=-gamble;
                if(label===double){
                    amount=gamble;
                }
                else if(label===half){
                    amount=Math.round(gamble/2);
                }
                return amount;
            };

            let choice=null;

            collector.on('collect', async (i)=>{
                let options=[button1,button2,button3];

                const randIdxDouble=Math.floor(Math.random()*3);
                const doubleButton=options.splice(randIdxDouble,1)[0];
                doubleButton.setLabel(double).setDisabled(true);

                const randIdxHalf=Math.floor(Math.random()*3);
                const halfButton=options.splice(randIdxHalf,1)[0];
                halfButton.setLabel(half).setDisabled(true);

                const zeroButton=options[0];
                zeroButton.setLabel(lose).setDisabled(true);

                button1.setStyle(ButtonStyle.Secondary);
                button2.setStyle(ButtonStyle.Secondary);
                button3.setStyle(ButtonStyle.Secondary);

                if(i.customId==='one') choice=button1;
                else if(i.customId==='two') choice=button2;
                else if(i.customId==='three') choice=button3;

                choice.setStyle(ButtonStyle.Success);

                const label=choice.data.label;
                const amtchange=getAmount(label,amount);

                await profileSchema.findOneAndUpdate({userId:id},{
                    $inc:{
                        balance:amtchange,
                    }
                });
                if(label===double){
                    gambleEmbed
                        .setTitle('DOUBLED! you just doubled your coins')
                        .setFooter({text: `${username} gained ${amtchange} coins`})
                }
                else if(label===half){
                    gambleEmbed
                        .setTitle('HALFED! you just halfed your coins')
                        .setFooter({text: `${username} losed ${amtchange} coins`})
                }
                else if(label===lose){
                    gambleEmbed
                        .setTitle('OOF....! you just lost your gamble')
                        .setFooter({text: `${username} lost ${amtchange} coins`})
                }

                await i.update({embeds:[gambleEmbed],components:[row]});

                collector.stop();
            });
        }
    },
};