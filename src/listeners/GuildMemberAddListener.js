const { Listener } = require("discord-akairo");

class GuildMemberAddListener extends Listener {
  constructor() {
    super("guildMemberAdd", {
      emitter: "client",
      event: "guildMemberAdd",
    });
  }

  exec(member) {
    const client = this.client;
    console.log(`${member.user.tag} joined ${member.guild.name}`);
  }
}

module.exports = GuildMemberAddListener;
