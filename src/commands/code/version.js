const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");

class VersionCommand extends Command {
  constructor() {
    super("version", {
      aliases: ["version", "v"],
      category: "code",
      description: {
        content: "Display information about a language's runtime.",
        usage: ["<language>"],
        languages: {},
      },
      args: [
        {
          id: "language",
          type: "string",
        },
      ],
    });
    this.get_langs();
  }

  async get_langs() {
    await axios.get("https://emkc.org/api/v2/piston/runtimes").then((response) => {
      response.data.forEach((runtime) => {
        this.description.languages[runtime.language] = { version: null, aliases: runtime.aliases };
        this.description.languages[runtime.language].version = runtime.version;
      });
    });
  }

  async exec(message, args) {
    var language = args.language;
    
    var embed = new MessageEmbed().setTitle(language.charAt(0).toUpperCase() + language.slice(1))
    .addField("Version" , `${this.description.languages[language].version}`)
    .addField("Aliases", `\`${this.description.languages[language].aliases.join("`, `")}\``, true)
    .setColor(this.client.constants.infoEmbed);
    
    return message.channel.send(embed);
  }
}

module.exports = VersionCommand;
