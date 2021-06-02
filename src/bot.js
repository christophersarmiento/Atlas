const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const model = require(path.resolve(__dirname, "models/model.js"));

const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, MongooseProvider } = require("discord-akairo");
const mongoose = require("mongoose");
const { MessageEmbed } = require("discord.js");

class Atlas extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: process.env.OWNER_ID,
      },
      {}
    );

    this.settings = new MongooseProvider(model);

    this.constants = {
      infoEmbed: [155, 300, 200],
      errorEmbed: [255, 0, 0],
      successEmbed: [0, 255, 0],
    };

    this.failure = new MessageEmbed()
      .setColor(this.constants.errorEmbed)
      .setDescription("Uh oh! Something went wrong.");

    this.commandHandler = new CommandHandler(this, {
      directory: path.resolve(__dirname, "commands"),
      prefix: (message) => {
        if (message.guild) {
          return this.settings.get(message.guild.id, "prefix", ".");
        }
        return ".";
      },
      allowMention: true,
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.resolve(__dirname, "inhibitors"),
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: path.resolve(__dirname, "listeners"),
    });

    this.commandHandler.loadAll();

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
    });

    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
  }

  async error_message(message) {
    return new MessageEmbed()
      .setColor(this.constants.errorEmbed)
      .setDescription(message);
  }

  async login(token) {
    await this.settings.init();
    return super.login(token);
  }
}

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to database");
    const client = new Atlas();
    client.login(process.env.DISCORD_TOKEN);
  })
  .catch((err) => console.error(err));
