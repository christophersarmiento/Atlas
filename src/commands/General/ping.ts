import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationCommandType, EmbedBuilder, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: "Displays Atlas's heartbeat and latency.",
	aliases: ['pong']
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});

		// Register context menu command available from any message
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.Message
		});

		// Register context menu command available from any user
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User
		});
	}

	// Message command
	public override async messageRun(message: Message) {
		const embed = new EmbedBuilder().setDescription('Pinging...').setColor([155, 300, 200]);
		const msg = await send(message, { embeds: [embed] });
		const newEmbed = new EmbedBuilder()
			.setDescription(
				`\uD83C\uDFD3 Latency: \`${msg.createdTimestamp - message.createdTimestamp}ms\` \n\uD83D\uDC93 Heartbeat: \`${this.container.client.ws.ping}ms\``
			)
			.setColor([155, 300, 200]);

		return msg.edit({ embeds: [newEmbed] });
	}

	// slash command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new EmbedBuilder().setDescription('Pinging...').setColor([155, 300, 200]);
		const msg = await interaction.reply({ embeds: [embed], ephemeral: true, fetchReply: true });

		if (isMessageInstance(msg)) {
			const newEmbed = new EmbedBuilder()
				.setDescription(
					`\uD83C\uDFD3 Latency: \`${msg.createdTimestamp - interaction.createdTimestamp}ms\` \n\uD83D\uDC93 Heartbeat: \`${this.container.client.ws.ping}ms\``
				)
				.setColor([155, 300, 200]);
			return interaction.editReply({ embeds: [newEmbed] });
		}

		return interaction.editReply('Failed to retrieve ping :(');
	}

	// context menu command
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		const embed = new EmbedBuilder().setDescription('Pinging...').setColor([155, 300, 200]);
		const msg = await interaction.reply({ embeds: [embed], ephemeral: true, fetchReply: true });

		if (isMessageInstance(msg)) {
			const newEmbed = new EmbedBuilder()
				.setDescription(
					`\uD83C\uDFD3 Latency: \`${msg.createdTimestamp - interaction.createdTimestamp}ms\` \n\uD83D\uDC93 Heartbeat: \`${this.container.client.ws.ping}ms\``
				)
				.setColor([155, 300, 200]);
			return interaction.editReply({ embeds: [newEmbed] });
		}

		return interaction.editReply('Failed to retrieve ping :(');
	}
}
