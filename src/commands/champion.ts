import { MessageEmbed } from 'discord.js';
import { Command } from '../structures/Command';
import { LINK } from '../utils/const';
import { logger } from '../utils/logger';

export default new Command({
	name: 'champion',
	description: 'Manage your project',
	execute: async ({ interaction }) => {
		const replyEmbed = new MessageEmbed()
			.setTitle('Champion Dashboard 🏆')
			.setDescription(`Manage your projects [here](${LINK.DASHBOARD})`);

		return interaction.reply({
			embeds: [replyEmbed],
			ephemeral: true
		});
	}
});
