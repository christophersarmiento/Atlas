require('dotenv').config();
const model = require('./models/model');

const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, MongooseProvider } = require('discord-akairo');
const mongoose = require('mongoose');

class Atlas extends AkairoClient {
  constructor() {
    super({
      ownerID: process.env.OWNER_ID,
    }, {
      
    });

    this.settings = new MongooseProvider(model);

    this.constants = {
      infoEmbed: [155, 300, 200]
    }

    this.commandHandler = new CommandHandler(this, {
      directory: './commands/',
      prefix: (message) => {
        if (message.guild) {
          return this.settings.get(message.guild.id, 'prefix', '.');
        }
        return '.';
      },
      allowMention: true
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './inhibitors/'
    });
    
    this.listenerHandler = new ListenerHandler(this, {
      directory: './listeners/'
    });

    this.commandHandler.loadAll();
    
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);
    
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
  }

  async login(token) {
    await this.settings.init();
    return super.login(token);
  }
}

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to database');
  const client = new Atlas();
  client.login(process.env.DISCORD_TOKEN);
})
.catch((err) => console.error(err));


