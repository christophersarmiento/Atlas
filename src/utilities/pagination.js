const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

// Used to format a page of quotes for the embed
async function slice_quotes(quotes, page_index, og = null) {
  var page = quotes.slice(10 * (page_index - 1), 10 * page_index);
  if (!og) {
    return page.map((q) => `\`${quotes.indexOf(q) + 1}.\` ${q}`).join("\n");
  }
  return page.map((q) => `\`${og.indexOf(q) + 1}.\` ${q}`).join("\n");
}

// Used to udate the page of quotes based
async function update_page(button, embed, array, index, max, row, og = null) {
  embed.setDescription(await slice_quotes(array, index, og));
  embed.setFooter(`Page ${index}/${max}`);

  await button.message.edit({ embed: embed, components: [row] });
}

// Used to delete quotes from the database
async function purge_quotes(client, matches, og, message) {
  matches.forEach((q) => {
    og.splice(og.indexOf(q), 1);
  });
  client.settings
    .set(message.guild.id, "quotes", og)
    .then(() => message.channel.send(`Successfully removed ${matches.length} quotes`).then((m) => m.delete({ timeout: 3000 })))
    .catch(() => {
      message.channel.send(client.failure);
    });
}

module.exports = async function paginate(array, elements_per_page, starting_page, color, message, title, og = null, purge = false, client = null) {
  // Ignore messages not containing integers and messages from everyone except the caller
  const message_filter = (m) => {
    var pattern = new RegExp("^\\d+$", "i");
    return pattern.test(m.content) && m.author == message.author.id;
  };

  // Ignore button clicks from everyone except the caller
  const button_filter = (b) => {
    return b.clicker.user.id == message.author.id;
  };

  var max_pages = Math.ceil(array.length / elements_per_page);
  var page = await slice_quotes(array, starting_page, og);

  var embed = new MessageEmbed().setTitle(title).setDescription(page).setFooter(`Page ${starting_page}/${max_pages}`).setColor(color);

  // Define buttons for interaction
  const next_button = new MessageButton().setEmoji("▶️").setStyle("grey").setID("next");
  const prev_button = new MessageButton().setEmoji("◀️").setStyle("grey").setID("prev");
  const jump_button = new MessageButton().setEmoji("🔼").setStyle("grey").setID("jump");
  const exit_button = new MessageButton().setEmoji("🗑️").setStyle("red").setID("exit");
  const confirm_button = new MessageButton().setEmoji("✔️").setLabel("Remove Quotes").setStyle("green").setID("confirm");
  var row = new MessageActionRow().addComponents([prev_button, jump_button, next_button, exit_button]);
  if (purge) {
    row.addComponent(confirm_button);
  }

  page_index = starting_page;
  message.channel.send({ embed: embed, components: [row] }).then((m) => {
    const collector = m.createButtonCollector(button_filter, { time: 30000 });

    collector.on("collect", async (button) => {
      if (button.replied) {
        button.reply.delete();
      }
      switch (button.id) {
        case "next":
          // Reset the page to 1 if it's on the last page
          page_index >= max_pages ? (page_index = 1) : page_index++;

          update_page(button, embed, array, page_index, max_pages, row, og);
          collector.resetTimer();
          button.defer();
          break;
        case "prev":
          // Set the page to the last page if it's on the first page
          page_index <= 1 ? (page_index = max_pages) : page_index--;

          update_page(button, embed, array, page_index, max_pages, row, og);
          collector.resetTimer();
          button.defer();
          break;
        case "jump":
          // Prompt user for a page to jump to
          button.reply.send(`What page would you like to jump to?`).then(() => {
            message.channel.awaitMessages(message_filter, { max: 1, time: 5000 }).then(async (collected) => {
              // Cast the specified page to an int and round it
              var input = Math.round(Number(collected.first().content));
              // If specified page is the current page, do nothing
              if (input == page_index) {
                button.defer();
              } else {
                // If the specified page is out of range
                if (input < 1 || input > max_pages) {
                  message.channel.send(`Please enter a number between 1 and ${max_pages}.`).then((m) => m.delete({ timeout: 5000 }));
                  await button.reply.delete();
                  await collected.first().delete();
                } else {
                  // If the specified page is valid, update the page
                  page_index = input;

                  update_page(button, embed, array, page_index, max_pages, row, og);
                  collector.resetTimer();
                  collected.first().delete();
                  button.reply.delete();
                }
              }
            });
          });
          break;
        case "exit":
          // Stop checking for interactions and delete the message
          await collector.stop();
          break;
        case "confirm":
          // If user confirms the quote purge,then remove the matching quotes from the database
          purge_quotes(client, array, og, message);
          if (!button.replied) {
            await button.defer();
          }
          await collector.stop();
          break;
      }
    });

    collector.on("end", () => {
      m.delete();
    });
  });
};
