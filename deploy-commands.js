require("dotenv").config();
const { REST, Routes } = require("discord.js");
const {
    CLIENT_ID: clientId,
    GUILD_ID: guildId,
    DISCORD_TOKEN: token,
} = process.env;
const fs = require("node:fs");
 
 
const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
 
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command && command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());  // Use .toJSON() to convert to plain object
        console.log(`Loaded command from file ${file}`);
    } else {
        console.error(`Error loading command from file ${file}: Invalid command structure.`);
        console.error(`command: ${JSON.stringify(command, null, 2)}`);
    }
}
 
// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);
 
// and deploy your commands!
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );
 
        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
 
        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();