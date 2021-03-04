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
          id: 'prefix',
          default: '.'
        }
      ],
      channel: 'guild'
    });
  }

  async exec(message,args) {
    const old_prefix = this.client.settings.get(message.guild.id, 'prefix', '.');
    await this.client.settings.set(message.guild.id, 'prefix', args.prefix);
    return message.channel.send(`Prefix changed from \`${old_prefix}\` to \`${args.prefix}\``)
  }
}

module.exports = PrefixCommand;