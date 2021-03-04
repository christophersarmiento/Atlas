const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

let emojis = new Map();
emojis.set('utility', '🔧');

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help','h'],
      category: 'utility',
      description: {
        content: 'Displays a list of all available commands or detailed information about a specific command.',
        usage: ['[command]']
      },
      args: [
        {
          id: 'command',
          type: 'commandAlias'
        }
      ]
    });
  }


  exec(message, command) {  
    command = command.command;

    if (command) {
      const embed = new MessageEmbed()
      .setColor(this.client.constants.infoEmbed)
      .setTitle(`${command.aliases[0]}`)
      .setDescription(`${command.description.content ? command.description.content : ''} ${command.description.ownerOnly ? '\n**[Owner Only]**': ''}`);

      if (command.description.usage){
        embed.addField('Usage', `\`${command.aliases[0] + ' ' +  command.description.usage.join(' ')}\``)
      }
      else {
        embed.addField('Usage', `\`${command.aliases[0]}\``)
      }
      
      if (command.description.examples && command.description.examples.length) {
        embed.addField('Examples', `\`${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `)}\``, true);
      }
    
      if (command.aliases.length > 1){
        embed.addField('Aliases', `\`${command.aliases.join('`, `')}\``, true);
      }

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
        .setColor(this.client.constants.infoEmbed)
        .setTitle('Command List')
        .setFooter(`For additional information about a command, do ${this.client.settings.get(message.guild.id, 'prefix', '.')}help <command>`);

    for (const category of this.handler.categories.values()) {
      embed.addField(`${emojis.get(category.id)} ${category.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`, `${category.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``).join(', ')}`);
    }
    
    return message.channel.send(embed); 
  }
}

module.exports = HelpCommand;