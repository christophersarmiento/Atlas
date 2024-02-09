import "./lib/setup";
import "dotenv/config";
import chalk from "chalk";

import { LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";

const client = new SapphireClient({
  defaultPrefix: "!",
  regexPrefix: /^(hey +)?bot[,! ]/i,
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug
  },
  shards: "auto",
  intents: [
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true
});

const main = async () => {
  try {
    client.logger.info(chalk.blue(`[DEBUG] logging in with token: ${process.env.DISCORD_TOKEN}`));
    await client.login(process.env.DISCORD_TOKEN);
    client.logger.info(chalk.cyan(`[DEBUG] successfully logged in with client:`), client);
  } catch (error) {
    client.logger.fatal(error);
    await client.destroy();
    process.exit(1);
  }
};

void main();
