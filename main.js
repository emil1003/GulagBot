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

let gulagRole = null;
let farmerRole = null;

client.on("ready", () => {
	console.log("Event: ready");

	console.log(`I am ${client.user.tag}`);

	if (settings.presence)
		client.user.setPresence(settings.presence);

	CEGuild = client.guilds.find(val => val.name === "Communism Enthusiasts");

	if (CEGuild.available) {
		console.log(`${CEGuild.name} (${CEGuild.id}) connected`);
	} else {
		return;
	}

	radioChannel = CEGuild.channels.find(val => val.name === "Soviet Radio");

	//Load roles
	gulagRole = CEGuild.roles.find(val => val.name === "Gulag");
	farmerRole = CEGuild.roles.find(val => val.name === "Farmers");
});

client.on("rateLimit", info => {
	console.log("Event: rateLimit");
});

client.on("message", message => {
	console.log("Event: message");
	if (!message.author.bot) {

		if (message.guild == null || message.guild.id != CEGuild.id) {
			//I am somewhere where I shouldn't be
			message.channel.send("where am i? (I should be in Communism Enthusiasts)");
			console.log(`WARN: Bot outside of Communism Enthusiasts!
	${message.author.tag} contacted bot in DMs`);
			return;
		}

		switch (message.content.toLowerCase().split(" ")[0]) {
			case "!radio":
				console.log(`Radio triggered by ${message.author.nickname || message.author.username}`);
				radioChannel.join()
					.then(connection => {
						radioStream = connection;
						console.log("Joined radio channel");

						if (settings.ussrAnthemPath.startsWith("http://") || settings.ussrAnthemPath.startsWith("https://")) {
							dispatcher = connection.playArbitraryInput(settings.ussrAnthemPath);
						} else {
							dispatcher = connection.playFile(settings.ussrAnthemPath);
						}

						var embed = new Discord.RichEmbed()
								.setTitle("SOVIET RADIO IS NOW OPEN!")
								.setDescription("COME AND LISTEN! (OR GO TO THE GULAG)");
						//message.channel.send(embed);
					})
					.catch(error => {
						console.log(error);
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

				if (toGulag == null)
					break;

				if (toGulag.user.id == message.author.id) {
					message.channel.send(`HEY EVERYONE! ${message.author.nickname || message.author.username} IS AN IDIOT!`);
					break;
				} else {
					if (toGulag.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
						message.channel.send(`YOU CANNOT SEND A SUPERIOR TO THE GULAG, ${message.author.nickname || message.author.username}!`);
						break;
					}
				}

				toGulag.setRoles([gulagRole])
						.catch(console.error);
				message.channel.send(`${toGulag.user.nickname || toGulag.user.username} IS GOING TO THE GULAG!`);
				break;
			case "!pardon":
				if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
					if (message.mentions.everyone) {
							//Pardon all
							
							CEGuild.members.every(member => {
								if (member.roles.find(val => val.name === gulagRole.name) != null) {
									member.setRoles([farmerRole]);
								}
								return true;
						});

						message.channel.send("YOU GET A PARDON, YOU GET A PARDON, EVERYONE GETS A PARDON!");
						break;
					} else {
						var toPardon = message.mentions.members.first();

						if (toPardon == null)
							break;

						toPardon.setRoles([farmerRole])
							.catch(console.error);
						message.channel.send(`${toPardon.user.nickname || toPardon.user.username} IS A FRIEND OF THE SOVIET UNION AGAIN!`);
					}
				} else {
					message.channel.send("NICE TRY CAPITALIST PIG!");
				}
				break;
			case "!food":
				message.channel.send(`YOU HAVE ALREADY EXCEEDED YOUR MONTHLY ALLOWANCE, ${message.author.nickname || message.author.username}!`);
				break;
		}
	}
})

settings.debug && client.on("debug", data => {
	console.log(data);
});

console.log("GulagBot v0.0.1");

client.login(settings.token);

