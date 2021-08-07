const { Listener } = require("discord-akairo");
const tiktok = require("tiktok-scraper");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const axios = require("axios");

class TikTokListener extends Listener {
  constructor() {
    super("message", {
      emitter: "client",
      event: "message"
    });
  }

  exec(message) {
    const regex = /https?:\/\/(vm.|www.)?tiktok.com\/\S+/g;

    var links = message.content.match(regex);

    if (links && !message.author.bot) {
      links.forEach(async (link) => {
        tiktok.getVideoMeta(link).then((response) => {
          axios.get(response.collector[0].videoUrl, { responseType: "arraybuffer", headers: response.headers }).then((r) => {
            message.channel.send({ files: [{ attachment: r.data, name: response.collector[0].id + ".mp4" }] });
          });
        });
      });
    } else {
      return;
    }
  }
}

module.exports = TikTokListener;
