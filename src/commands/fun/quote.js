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

  async slice_quotes(quotes, page_index) {
    var page = quotes.slice(10 * (page_index - 1), 10 * page_index);
    page = page.map((q) => `\`${quotes.indexOf(q) + 1}.\` ${q}`);
    page = page.join("\n");
    return page;
  }

  async exec(message, args) {
    let allQuotes = this.client.settings.get(message.guild.id, "quotes");
    if (allQuotes == undefined) {
      allQuotes = [];
    }

    // add quote
    if (args.add && !args.remove && !args.list && !args.index && !args.search && !args.purge) {
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }
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

    // list quotes
    if (args.list && !args.add && !args.remove && !args.index && !args.search && !args.purge) {
      if (allQuotes.length <= 0) {
        return message.channel.send("There are no quotes for this server yet!");
      }
      paginator(allQuotes, 10, 1, this.client.constants.infoEmbed, message, "Quotes");
    }

    // quote remove
    if (args.remove && !args.add && !args.list && args.index && !args.search && !args.purge) {
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }
      if (args.index != undefined) {
        let index = args.index - 1;
        if (index >= 0 && index < allQuotes.length) {
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
          return message.channel.send(`Please enter a number between 1 and ${allQuotes.length}`);
        }
      } else {
        console.log("args index not found");
      }
      return;
    }

    // quote search
    if (args.search && !args.add && !args.remove && !args.list && !args.index && !args.purge) {
      if (!args.quote) {
        return message.channel.send("Please add a search query.");
      }
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));
      if (matches.length > 0) {
        paginator(matches, 10, 1, this.client.constants.infoEmbed, message, `${matches.length} Matching Quotes`, allQuotes);
      } else {
        let msg = new MessageEmbed().setColor(this.client.constants.infoEmbed).setDescription(`Could not find any quotes matching \`${args.quote}\``).setTitle("404!");
        return message.channel.send(msg);
      }
    }

    // quote purge
    if (args.purge && !args.add && !args.remove && !args.list && !args.index && !args.search) {
      if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry, you do not have the \`Manage Messages\` permisson.`);
      }
      if (!args.quote) {
        return message.channel.send("Please add a search query.");
      }
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));
      if (matches.length > 0) {
        paginator(matches, 10, 1, this.client.constants.infoEmbed, message, `${matches.length} Matching Quotes`, allQuotes, true, this.client);
      } else {
        let msg = new MessageEmbed().setColor(this.client.constants.infoEmbed).setDescription(`Could not find any quotes matching \`${args.quote}\``).setTitle("404!");
        return message.channel.send(msg);
      }
    }

    // quote by index
    if (args.index && !args.add && !args.remove && !args.list && !args.search && !args.purge) {
      let index = args.index - 1;
      if (index >= 0 && index < allQuotes.length) {
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(allQuotes[index])
          .setTitle("Quote")
          .setFooter(`#${args.index} of ${allQuotes.length}`);

        return message.channel.send(msg);
      } else {
        if (allQuotes.length == 0) {
          message.channel.send("There are no quotes for this server yet!");
        } else {
          message.channel.send(`Please enter a number between 1 and ${allQuotes.length}`);
        }
      }
    }

    // random quote
    if (!args.add && !args.remove && !args.list && !args.index && !args.search && !args.purge) {
      let randIndex = Math.floor(Math.random() * allQuotes.length);
      let randomQuote = allQuotes[randIndex];

      if (allQuotes.length != 0) {
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(randomQuote)
          .setTitle("Quote")
          .setFooter(`#${randIndex + 1} of ${allQuotes.length}`);

        return message.channel.send(msg);
      } else {
        return message.channel.send("There are no quotes for this server yet!");
      }
    }
  }
}

module.exports = QuoteCommand;
