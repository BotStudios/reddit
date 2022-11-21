const { Intents, Client, MessageAttachment, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas')


const url = (subreddit) => `https://reddit.com/r/${subreddit}.json?t=week`;
const fetchReddit = async (subreddit) => {
    const { data } = (await axios.get(url(subreddit))).data;
    const children = data.children;
    if(!data || !children) throw new Error();
    const main = (children[Math.floor(Math.random() * children.length)]).data;
    const image = await loadImage(main.is_video ? main.thumbnail : main.url);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return await canvas.createPNGStream();
}

client.once("ready", () => console.log(client.user.tag));

client.on("interactionCreate", async interaction => {
    if(interaction.commandName != "reddit")return;
    await interaction.deferReply({ ephemeral: true });
    try {
    const name = interaction.options.getString("subreddit");
    if(!name)return;
    const reddit = await fetchReddit(name);
    const attachment = new MessageAttachment(reddit, 'img.png');
    await interaction.editReply({  embeds: [new MessageEmbed().setImage("attachment://img.png")] , files: [attachment]})
    }catch(e) {
        console.log(e)
        await interaction.editReply({ embeds: [new MessageEmbed().setDescription("Subreddit does not exist")] })
    }
})

client.login(TOKEN)

const { REST } = require('@discordjs/rest'); 
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders')

function deploy(client) {
const rest = new REST({ version: '9' }).setToken(client.token);
const commands = [
    new SlashCommandBuilder()
    .setName('reddit')
    .setDescription('Reddit Post')
    .addStringOption(option => option.setName('subreddit').setDescription(`Subreddit name`).setRequired(true))
];
;(async () => {
    try {
      console.log('Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();
}
