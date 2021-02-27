const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const moment = require('moment')

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
      category: 'util'
    });
  }

  async exec(message) {
    const embed = new MessageEmbed().setDescription('Pinging...').setColor(this.client.constants.infoEmbed);
    const m = await message.channel.send(embed);
    const newEmbed = new MessageEmbed().setDescription(`\uD83C\uDFD3 Latency: \`${moment.duration(moment(m.createdTimestamp).diff(moment(message.createdTimestamp))).as('milliseconds')}ms\` \n\uD83D\uDC93 Heartbeat: \`${this.client.ws.ping}ms\``).setColor(this.client.constants.infoEmbed);
    return m.edit(newEmbed);
  }
}

module.exports = PingCommand;