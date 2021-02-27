const { Inhibitor } = require('discord-akairo');

class DenylistInhibitor extends Inhibitor {
  constructor() {
    super('denylist', {
      reason: 'denylist'
    })
  }

  exec(message) {
    const denylist = [];
    return denylist.includes(message.author.id);
  }
}

module.exports = DenylistInhibitor;