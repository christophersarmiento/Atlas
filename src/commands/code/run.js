const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

class ExecuteCommand extends Command {
  constructor() {
    super("execute", {
      aliases: ["execute", "exec", "run"],
      category: "code",
      description: {
        content: "Execute code",
        usage: [
          "<language>\n[command line arguments] (1 per line)\n`\u200b`\u200b`\u200b\n<code>\n`\u200b`\u200b`\u200b\n[standard input]",
        ],
        languages: {},
      },
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

  async exec(message) {
    // If a codeblock is not detected
    if (message.content.split('```').length-1 != 2) {
      var inavlid_embed = await this.client.error_message("Invalid format.");
      inavlid_embed.setTitle("ERROR!");
      inavlid_embed.setFooter("Missing codeblock?");
      return message.channel.send(inavlid_embed);
    }
    
    let pattern = new RegExp(
      "(exec|execute|run)\\s+(?<language>\\S*)\\s*(?<args>([^\\n\\r\\f\\v]*\n)*)?```(?<syntax>\\S+)?\\s*(?<code>(.*\\s*)*)\\s*```"
    );
    
    let matches = pattern.exec(message.content);
    
    let query = {
      language: matches.groups.language.trim().toLowerCase(),
      version: "*",
      files: [{ content: matches.groups.code.trim() }],
      syntax: matches.groups.syntax == undefined ? "" : matches.groups.syntax.trim(),
      args: matches.groups.args == undefined ? [] : matches.groups.args.trim().split("\n"),
      stdin: "",
      log: 0,
    };

    if (!Object.keys(this.description.languages).includes(query.language)) {
      var lanugage_error_embed = await this.client.error_message("Unsupported language.");
      lanugage_error_embed.setTitle("ERROR!");
      return message.channel.send(inavlid_embed);
    }
    
    const response = await axios.post("https://emkc.org/api/v2/piston/execute",query);
    
    // If there is no output
    if (!response.data.run.output) {
      const no_output_embed = new MessageEmbed()
        .setColor(this.client.constants.successEmbed)
        .setTitle("Output")
        .setURL("https://github.com/engineer-man/piston")
        .setDescription("**No output.**")
        .setFooter(
          `${query.language} ${this.description.languages[query.language].version} • Executed in ${moment
            .duration(moment().diff(moment(message.createdTimestamp)))
            .as("milliseconds")}ms.`
        );
      return message.channel.send(no_output_embed);
    }

    var output = response.data.run.output.trim().split('\n');
    var lines = output.length;

    // Check if output exceeds embed character limit, or is longer than 10 lines
    if (lines > 10 || response.data.run.output.length > 1995) {
      // Truncate output to 10 lines
      output = output.slice(0, 11).join("\n");

      var file = fs.createWriteStream(path.resolve(__dirname, '../../../temp/full_output.txt'));
      var file_content = response.data.run.output.trim();

      // Limit file size to 8MB
      if (file_content.length > 8388608) {
        file_content = file_content.substring(0, 8388608);
      }

      file.write(response.data.run.output.trim());
      file.end();

      // Truncate output for embed
      if (output.length > 1995) {
        output = output.substring(0,1995);
      }
    }
    else {
      output = response.data.run.output.trim();
    }

    const embed = new MessageEmbed()
      .setColor(this.client.constants.successEmbed)
      .setTitle("Output")
      .setURL("https://github.com/engineer-man/piston")
      .setDescription(
        `\`\`\`${output}\`\`\`${
          lines > 10 || response.data.run.output.length > 1995
            ? `\n**Output exceeded character or line limit.**`
            : ``
        }`
      )
      .setFooter(
        `${query.language.charAt(0).toUpperCase() + query.language.slice(1)} ${
          this.description.languages[query.language].version
        } • Executed in ${moment
          .duration(moment().diff(moment(message.createdTimestamp)))
          .as("milliseconds")}ms.`
      );

    await message.channel.send(embed);

    // If there is a output file, send it
    if (lines > 10 || response.data.run.output.length > 1995){
      await message.channel.send("Full output available here:", {
        files: [path.resolve(__dirname, "../../../temp/full_output.txt")],
      });
    }
  }
}

module.exports = ExecuteCommand;
