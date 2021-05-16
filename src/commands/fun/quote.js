const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const Pagination = require("discord-paginationembed");

// TODO: manage permissions for certain arguments
class QuoteCommand extends Command {
  constructor() {
    super("quote", {
      aliases: ["quote", "q"],
      category: "fun",
      description: {
        content:
          "Displays a random quote from the server.",
        usage: ["add <quote>", "remove <quote number>", "<quote number>", "search <query>", "list"],
        examples: [
          'add "The unexamined life is not worth living." - Socrates',
          "remove 12",
          "2",
          "search socrates",
          "list",
        ],
      },
      args: [
        {
          id: "add",
          type: "string",
          match: "flag",
          flag: "add",
        },
        {
          id: "list",
          type: "string",
          match: "flag",
          flag: "list",
        },
        {
          id: "remove",
          type: "string",
          match: "flag",
          flag: "remove",
        },
        {
          id: "search",
          type: "string",
          match: "flag",
          flag: "search",
        },
        {
          id: "purge",
          type: "string",
          match: "flag",
          flag: "purge",
        },
        {
          id: "index",
          type: "integer",
          index: 0,
        },
        {
          id: "quote",
          type: "string",
          match: "rest",
        },
      ],
      channel: "text",
    });
  }

  async exec(message, args) {
    let allQuotes = this.client.settings.get(message.guild.id, "quotes");
    if (allQuotes == undefined) {
      allQuotes = [];
    }

    // add quote
    if (args.add && !args.remove && !args.list && !args.index && !args.search && !args.purge) {
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
      if (allQuotes.length != 0) {
        const QuoteList = new Pagination.FieldsEmbed()
          .setArray(allQuotes)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel)
          .setElementsPerPage(10)
          .setPage(1)
          .setPageIndicator("footer")
          .setDeleteOnTimeout(true)
          .formatField("Quotes", (i) => `\`${allQuotes.indexOf(i) + 1}.\` ${i}`);

        QuoteList.embed.setColor(this.client.constants.infoEmbed);
        await QuoteList.build();
      } else {
        message.channel.send("There are no quotes for this server yet!");
      }
    }

    // quote remove
    if (args.remove && !args.add && !args.list && args.index && !args.search && !args.purge) {
      if (args.index != undefined) {
        console.log("triggered");
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
      }
      else {
        console.log("args index not found");
      }
      return;
    }

    // quote search
    if (args.search && !args.add && !args.remove && !args.list && !args.index && !args.purge) {
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));
      if (matches.length > 0) {
        let QuoteList = new Pagination.FieldsEmbed()
          .setArray(matches)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel)
          .setElementsPerPage(10)
          .setPage(1)
          .setPageIndicator("footer")
          .setDeleteOnTimeout(true)
          .formatField(`${matches.length} Matching Quotes`, (i) => `\`${allQuotes.indexOf(i) + 1}.\` ${i}`);

        QuoteList.embed.setColor(this.client.constants.infoEmbed);

        await QuoteList.build();
      } else {
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(`Could not find any quotes matching \`${args.quote}\``)
          .setTitle("404!");
        return message.channel.send(msg);
      }
    }

    // quote purge
    if (args.purge && !args.add && !args.remove && !args.list && !args.index && !args.search) {
      let query = new RegExp(`${args.quote}`, "i");
      let matches = allQuotes.filter((q) => query.test(q));
      if (matches.length > 0) {
        let QuoteList = new Pagination.FieldsEmbed()
          .setArray(matches)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel)
          .setElementsPerPage(10)
          .setPage(1)
          .setPageIndicator("footer")
          .formatField("Quotes", (i) => `\`${allQuotes.indexOf(i) + 1}.\` ${i}`)
          .setContent(`React with ✅ to remove all ${matches.length} matches`)
          .setEmojisFunctionAfterNavigation(true)
          .setTimeout(300000)
          .setDeleteOnTimeout(true)
          .addFunctionEmoji("✅", (_) => {
            matches.forEach((q) => {
              allQuotes.splice(allQuotes.indexOf(q), 1);
            });
            this.client.settings
              .set(message.guild.id, "quotes", allQuotes)
              .then(() =>
                message.channel
                  .send(`Successfully removed ${matches.length} quotes`)
                  .then((m) => m.delete({ timeout: 3000 }))
              )
              .catch(() => {
                message.channel.send(this.client.failure);
              });
          });

        QuoteList.embed.setColor(this.client.constants.infoEmbed);

        await QuoteList.build();
      } else {
        let msg = new MessageEmbed()
          .setColor(this.client.constants.infoEmbed)
          .setDescription(`Could not find any quotes matching \`${args.quote}\``)
          .setTitle("404!");
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
