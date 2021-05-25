const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix'],
      category: 'utility',
      description: {
        content: 'Displays or changes the prefix for the server',
        usage: ['[prefix string]'],
        examples: ['*']
      },
      args: [
        {
          id: 'prefix'
        }
      ],
      channel: 'guild'
    });
  }

  async exec(message,args) {
    const old_prefix = this.client.settings.get(message.guild.id, "prefix", ".");
    if (!args.prefix || args.prefix == old_prefix) {
      return message.channel.send(`The current prefix is \`${old_prefix}\``);
    }
    
    else if (message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
      await this.client.settings.set(message.guild.id, "prefix", args.prefix);
      return message.channel.send(`Prefix changed from \`${old_prefix}\` to \`${args.prefix}\``);
    }

    return message.channel.send(`Sorry, you do not have the \`Administrator\` permisson.`);
  }
}

module.exports = PrefixCommand;