const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const { Message } = require("discord.js");

class VersionCommand extends Command {
  constructor() {
    super("version", {
      aliases: ["version", "v"],
      category: "code",
      description: {
        content: "Display information about a language's runtime.",
        usage: ["<language>"],
        languages: {}
      },
      args: [
        {
          id: "language",
          type: "string"
        }
      ]
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
    if (!args.language) {
      var embed = new MessageEmbed()
        .setColor(this.client.constants.infoEmbed)
        .addField("Languages", `\`${Object.keys(this.description.languages).join("`, `")}\``, true)
        .setFooter(`For additional information about a language, do ${this.client.settings.get(message.guild.id, "prefix", ".")}version <language>`);
      return message.channel.send(embed);
    }
    var language = args.language;

    // If language arg is not a key in the languages object
    if (!Object.keys(this.description.languages).includes(language)) {
      var found = false;
      // Check aliases
      for (var runtime in this.description.languages) {
        var runtime_aliases = this.description.languages[runtime].aliases;
        if (runtime_aliases.includes(language)) {
          language = runtime;
          found = true;
          break;
        }
      }
      // If language arg is not found in aliases, throw an error
      if (!found) {
        var lanugage_error_embed = await this.client.error_message("Unsupported language.");
        lanugage_error_embed.setTitle("ERROR!");
        return message.channel.send(inavlid_embed);
      }
    }

    var embed = new MessageEmbed()
      .setTitle(language.charAt(0).toUpperCase() + language.slice(1))
      .addField("Version", `${this.description.languages[language].version}`)
      .addField("Aliases", `\`${this.description.languages[language].aliases.join("`, `")}\``, true)
      .setColor(this.client.constants.infoEmbed);

    return message.channel.send(embed);
  }
}

module.exports = VersionCommand;
