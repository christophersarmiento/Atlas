const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix'],
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
    console.log(this.client.settings);
    return message.reply(`Prefix changed from \`${old_prefix}\` to \`${args.prefix}\``)
  }
}

module.exports = PrefixCommand;