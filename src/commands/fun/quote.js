const path = require("path");
const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const paginator = require(path.resolve(__dirname, "../../utilities/pagination"));

class QuoteCommand extends Command {
  constructor() {
    super("quote", {
      aliases: ["quote", "q"],
      category: "fun",
      description: {
        content: "Displays a random quote from the server.",
        usage: ["add <quote>", "remove <quote number>", "<quote number>", "search <query>", "list"],
        examples: ['add "The unexamined life is not worth living." - Socrates', "remove 12", "2", "search socrates", "list"]
      },
      args: [
        {
          id: "add",
          type: "string",
          match: "flag",
          flag: "add"
        },
        {
          id: "list",
          type: "string",
          match: "flag",
          flag: "list"
        },
        {
          id: "remove",
          type: "string",
          match: "flag",
          flag: "remove"
        },
        {
          id: "search",
          type: "string",
          match: "flag",
          flag: "search"
        },
        {
          id: "purge",
          type: "string",
          match: "flag",
          flag: "purge"
        },
        {
          id: "index",
          type: "integer",
          index: 0
        },
        {
          id: "quote",
          type: "string",
          match: "rest"
        }
      ],
      channel: "text"
    });
  }

  async exec(message, args) {
    // Pull quotes from datbase
    let allQuotes = this.client.settings.get(message.guild.id, "quotes");
    if (allQuotes == undefined) {
      allQuotes = [];
    }

    // Add quote
    if (args.add && !args.remove && !args.list && !args.index && !args.search && !args.purge) {
      // If caller does not have Mangage Message Permissions
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }

      // If user did not suppy a quote to add
      if (!args.quote) {
        return message.channel.send("Please add a search query.");
      }

      // Add quote to array and update database
      let quote = args.quote.trim();
      allQuotes.push(quote);
      this.client.settings
        .set(message.guild.id, "quotes", allQuotes)
        .then(() => {
          let msg = new MessageEmbed()
            .setColor(this.client.constants.successEmbed)
            .setDescription(quote)
            .setTitle("Added Quote!")
            .setFooter(`#${allQuotes.length} of ${allQuotes.length}`);
          return message.channel.send(msg);
        })
        .catch((error) => {
          console.error(error);
          return message.channel.send(this.client.failure);
        });
    }

    // List quotes
    if (args.list && !args.add && !args.remove && !args.index && !args.search && !args.purge) {
      // If there are no quotes in the server
      if (allQuotes.length <= 0) {
        return message.channel.send("There are no quotes for this server yet!");
      }
      // Paginate quotes
      paginator(allQuotes, 10, 1, this.client.constants.infoEmbed, message, "Quotes");
    }

    // Remove quote
    if (args.remove && !args.add && !args.list && args.index && !args.search && !args.purge) {
      // If caller does not have manage messages permission
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }
      if (args.index) {
        let index = args.index - 1;
        // If index is in range
        if (index >= 0 && index < allQuotes.length) {
          // Remove the specified index and update database
          allQuotes.splice(index, 1);
          this.client.settings
            .set(message.guild.id, "quotes", allQuotes)
            .then(() => {
              message.react("✅");
            })
            .catch((error) => {
              console.error(error);
              return message.channel.send(this.client.failure);
            });
        } else {
          // If specified index is out of range
          return message.channel.send(`Please enter a number between 1 and ${allQuotes.length}`);
        }
      }
    }

    // Search quotes
    if (args.search && !args.add && !args.remove && !args.list && !args.index && !args.purge) {
      // If no search query is specified
      if (!args.quote) {
        return message.channel.send("Please add a search query.");
      }

      // Filter quotes that match the regex query
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));

      // If there are quotes matching the search query
      if (matches.length > 0) {
        // Paginate the results
        paginator(matches, 10, 1, this.client.constants.infoEmbed, message, `${matches.length} Matching Quotes`, allQuotes);
      } else {
        // If there are no matching quotes
        let msg = new MessageEmbed().setColor(this.client.constants.infoEmbed).setDescription(`Could not find any quotes matching \`${args.quote}\``).setTitle("404!");
        return message.channel.send(msg);
      }
    }

    // Purge quotes
    if (args.purge && !args.add && !args.remove && !args.list && !args.index && !args.search) {
      // If caller does not have manage messages permission
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }
      // If no search query is specified
      if (!args.quote) {
        return message.channel.send("Please add a search query.");
      }

      // Filter quotes that match the regex query
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));

      // If there are quotes matching the search query
      if (matches.length > 0) {
        // Paginate the results, and confirm the user wants to remove them from the database
        paginator(matches, 10, 1, this.client.constants.infoEmbed, message, `${matches.length} Matching Quotes`, allQuotes, true, this.client);
      } else {
        // If there are no matching quotes
        let msg = new MessageEmbed().setColor(this.client.constants.infoEmbed).setDescription(`Could not find any quotes matching \`${args.quote}\``).setTitle("404!");
        return message.channel.send(msg);
      }
    }

    // Quote by index
    if (args.index && !args.add && !args.remove && !args.list && !args.search && !args.purge) {
      // Decrement the index to match the 0 indexing of the array
      let index = args.index - 1;

      // If the index is in range of the quote array
      if (index >= 0 && index < allQuotes.length) {
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(allQuotes[index])
          .setTitle("Quote")
          .setFooter(`#${args.index} of ${allQuotes.length}`);

        return message.channel.send(msg);
      } else {
        // If there are no quotes in the server
        if (allQuotes.length == 0) {
          message.channel.send("There are no quotes for this server yet!");
        } else {
          // If the specified index is out of range
          message.channel.send(`Please enter a number between 1 and ${allQuotes.length}`);
        }
      }
    }

    // Random quote
    if (!args.add && !args.remove && !args.list && !args.index && !args.search && !args.purge) {
      // If the server has quotes
      if (allQuotes.length != 0) {
        // Generate a random integer and pull the corresponding quote
        let randIndex = Math.floor(Math.random() * allQuotes.length);
        let randomQuote = allQuotes[randIndex];
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(randomQuote)
          .setTitle("Quote")
          .setFooter(`#${randIndex + 1} of ${allQuotes.length}`);

        return message.channel.send(msg);
      } else {
        // If there are no quotes in the server
        return message.channel.send("There are no quotes for this server yet!");
      }
    }
  }
}

module.exports = QuoteCommand;
