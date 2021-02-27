const { Command } = require('discord-akairo');
const moment = require('moment')

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping']
    });
  }

  exec(message) {
    return message.channel.send('Pinging...').then((m) => { m.edit(`\uD83C\uDFD3 Pong! \`${moment.duration(moment(m.createdTimestamp).diff(moment(message.createdTimestamp))).as('milliseconds')}ms\` \n \u23F1 API Latency: \`${this.client.ws.ping}ms\``)})
  }
}

module.exports = PingCommand;