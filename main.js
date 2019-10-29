/*	GulagBot v0.0.1
	(c) 2019 Henning Emil Bøjer Bach
*/

//Require Discord.js
const Discord = require('discord.js');

//Require settings.json
const settings = require("./settings.json");

const client = new Discord.Client();

let CEGuild = null;

let radioChannel = null;
let radioStream = null;
let dispatcher = null;

client.on("ready", () => {
	console.log("Event: ready");

	console.log(`I am ${client.user.tag}`);

	if (settings.presence)
		client.user.setPresence(settings.presence);
	
	CEGuild = client.guilds.get("575052713239511080");
	
	if (CEGuild.available) {
		console.log(`${CEGuild.name} (${CEGuild.id}) connected`);
	} else {
		return;
	}
});

client.on("rateLimit", info => {
	console.log("rateLimit");
});

client.on("message", message => {
	if (!message.author.bot) {

		if (message.guild == null || message.guild.id != CEGuild.id) {
			//I am somewhere where I shouldn't be
			message.channel.send("where am i? (I should be in Communist Enthusiasts)");
			console.log(`WARN: Bot outside of Communist Enthusiasts!
	${message.author.tag} contacted bot in DMs`);
			return;
		}
		
		switch (message.content.toLowerCase().split(" ")[0]) {
			case "!radio":
				console.log(`Radio triggered by ${message.author.nickname || message.author.username}`);
				radioChannel = CEGuild.channels.find(val => val.name === "Soviet Radio");
				radioChannel.join()
					.then(connection => {
						radioStream = connection;
						console.log("Joined radio channel");
						dispatcher = connection.playFile("/home/henning/Musik/National Anthem of the soviet union - Red Army Choir-BulFwGSi8bc.mp3");
						
					});
				message.delete();
				break;
			case "!quit":
				//Stop playing
				console.log(`Quit triggered by ${message.author.nickname || message.author.username}`);
				console.log("Leaving radio channel");
				(dispatcher != null) && dispatcher.end();
				radioChannel.leave();
				message.delete();
				break;
			case "!gulag":
				if (message.mentions.everyone) {
					message.channel.send("YOU CANNOT SEND THEM TO THE GULAG!");
					break;
				}
				
				var toGulag = message.mentions.members.first();
				if (toGulag.user.id == message.author.id) {
					message.channel.send(`HEY EVERYONE! ${message.author.nickname || message.author.username} IS AN IDIOT!`);
					break;
				} else {
					if (toGulag.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
						message.channel.send(`YOU CANNOT SEND A SUPERIOR TO THE GULAG, ${message.author.nickname || message.author.username}!`);
						break;
					}
				}

				toGulag.setRoles(["638310306182987779"])
						.catch(console.error);
				message.channel.send(`${toGulag.user.nickname || toGulag.user.username} IS GOING TO THE GULAG!`);
				break;
			case "!pardon":
				if (message.mentions.everyone) {
					message.channel.send("YOU CANNOT PARDON THEM!");
					break;
				}

				var toPardon = message.mentions.members.first();
				if (toPardon.user.id == message.author.id) {
					if (!message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
						message.channel.send("NICE TRY CAPITALIST PIG!");
						break;
					}
				}

				toPardon.setRoles(["638666668830228480"])
					.catch(console.error);
				message.channel.send(`${toPardon.user.nickname || toPardon.user.username} IS A FRIEND OF THE SOVIET UNION AGAIN!`);
				break;
		}
	}
})

console.log("GulagBot v0.0.1");

client.login(settings.token);

