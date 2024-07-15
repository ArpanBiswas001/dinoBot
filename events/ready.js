const {Events,ActivityType}=require('discord.js');

module.exports={
    name:Events.ClientReady,
    once:true,
    execute(client){
        console.log(`ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Just Chilling!!!!..',{
            type:ActivityType.Listening});
    },
};