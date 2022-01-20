const { Listener } = require("discord-akairo");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");
const axios = require("axios");

class TikTokListener extends Listener {
  constructor() {
    super("message", {
      emitter: "client",
      event: "message"
    });
  }

  embed_tt(url, message, loading_message, retry_button, button_filter, retry_count = 0) {
    axios
      .get("https://dev.360noscope.com/api/v1/metadata/tiktok?url=" + encodeURIComponent(url))
      .then((response) => {
        axios.get(response.data.itemInfo.itemStruct.video.downloadAddr, { responseType: "arraybuffer", headers: response.headers }).then((r) => {
          message.channel.send({ files: [{ attachment: r.data, name: response.data.itemInfo.itemStruct.id + ".mp4" }] });
        });
        loading_message.delete();
      })
      .catch((err) => {
        console.log(err);
        if (retry_count >= 1) {
          loading_message.edit("Sorry, could not load TikTok. (" + err + ")");
        } else {
          loading_message.edit("Uh oh! Something went wrong.", retry_button);
        }

        const collector = loading_message.createButtonCollector(button_filter, { time: 30000 });

        collector.on("collect", async (button) => {
          loading_message.edit("<a:loading:852240089765380096>");
          retry_count++;
          this.embed_tt(url, message, loading_message, retry_button, button_filter, retry_count);
          button.defer();
        });
      });
  }

  exec(message) {
    const regex = /https?:\/\/(vm.|www.)?tiktok.com\/\S+/g;
    const retry_button = new MessageButton().setEmoji("🔄").setStyle("grey").setID("retry");
    const button_filter = (b) => {
      return b.clicker.user.id == message.author.id;
    };

    var links = message.content.match(regex);

    if (links && !message.author.bot) {
      message.channel.send("<a:loading:852240089765380096>").then((loading_message) => {
        links.forEach(async (link) => {
          this.embed_tt(link, message, loading_message, retry_button, button_filter);
        });
      });
    } else {
      return;
    }
  }
}

module.exports = TikTokListener;
