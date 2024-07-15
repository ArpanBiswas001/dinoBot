const {SlashCommandBuilder}=require('discord.js');
const openAI=require('../utils/openAi');
module.exports={
    data:new SlashCommandBuilder()
    .setName('advice')
    .setDescription('Get advice from chat gpt')
    .addStringOption((option)=>
        option
            .setName('question')
            .setDescription('Write your question that you want advice on')
            .setRequired(true)
    ),
    async execute(interaction){
        await interaction.deferReply();

        const question=interaction.options.getString('question');

        const message=[
            {
                role:'system',content:'You are a chatbot that gives helpful advice.Give your advice in 3 sentecce or less',
            },
            {
                role:'user',
                content:question
            },
        ];

        const completion=await openAI.chat.completions.create({
            model:'gpt-3.5-turbo',
            messages:message,
            temperature:0.7,
        });
        

        await interaction.editReply(completion.choices[0].message);
    },
};