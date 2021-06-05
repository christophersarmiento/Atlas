const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class DeleteCommand extends Command {
  constructor() {
    super("delete", {
      aliases: ["delete", "purge"],
      category: "utility",
      userPermissions: ["MANAGE_MESSAGES"],
      clientPermissions: ["MANAGE_MESSAGES"],
      description: {
        content: "Deletes a specified amount of messages in a channel.",
        usage: ["<1-99>"],
        examples: ["10"]
      },
      args: [
        {
          id: "amount",
          type: "integer",
          prompt: {
            start: (message) => message.reply("how many messages would you like to delete?"),
            retry: (message) => message.reply("please provide a valid integer.")
          }
        }
      ],
      channel: "text"
    });
  }

  async exec(message, args) {
    const amount = args.amount;
    if (amount < 1 || amount > 99) {
      return message.reply("you can only delete between 1 and 99 messages at a time.");
    }

    try {
      message.channel.bulkDelete(amount + 1, true).then((msgs) => {
        let embed = new MessageEmbed().setColor(this.client.constants.successEmbed).setDescription(`${msgs.size} ${msgs.size > 1 ? "messages were" : "message was"} deleted`);
        return message.channel.send(embed).then((sent) => sent.delete({ timeout: 3000 }));
      });
    } catch {
      return message.channel.send(this.client.failure).then((sent) => sent.delete({ timeout: 3000 }));
    }
  }
}

module.exports = DeleteCommand;
