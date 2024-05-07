const http = require('http');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

http
.createServer(function(request, response) {
  response.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' })
  response.end(`${client.user.tag} is ready!\n導入サーバー:${client.guilds.cache.size}\nユーザー:${client.users.cache.size}`)
})
.listen(3000)

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles){
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if('data' in command && 'execute' in command){
    client.commands.set(command.data.name, command);
  }else{
    console.log(`[WARNING]  ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`);
  }
}

client.on(Events.InteractionCreate, async interaction => {
  if(!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if(!command){
    console.error(` ${interaction.commandName} というコマンドは存在しません。`);
    return;
  }
  try{
    await command.execute(interaction);
  }catch(error){
    console.error(error);
    await interaction.reply({ content: 'コマンドを実行中にエラーが発生しました。', ephemeral: true });
  }
});

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
