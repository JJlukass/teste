const fs = require("fs")

module.exports = async (client) => {

const SlashsArray = []

  fs.readdir(`./SlashCommands`, (error, folder) => {
  folder.forEach(subfolder => {
fs.readdir(`./SlashCommands/${subfolder}/`, (error, files) => { 
  files.forEach(files => {
      
  if(!files?.endsWith('.js')) return;
  files = require(`../SlashCommands/${subfolder}/${files}`);
  if(!files?.name) return;
  client.slashCommands.set(files?.name, files);
   
  SlashsArray.push(files)
  });
    });
  });
});
  client.on("ready", async () => {
    await client.application.commands.set(SlashsArray)
    });
};