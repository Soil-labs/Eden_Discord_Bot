import { ApplicationCommandType } from 'discord.js';

import { Command } from '../structures/Command';

export default new Command({
	name: 'collab',
	description: 'Find a right member to coop with you.',
	type: ApplicationCommandType.ChatInput,
	execute: ({ interaction }) => {
		return interaction.reply({
			content:
				'Find somebody to collaborate with [here](https://eden-alpha-develop.vercel.app/test/user).',
			ephemeral: true
		});
	}
});
