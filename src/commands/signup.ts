import { Command } from '../structures/Command';
import { logger } from '../utils/logger';

export default new Command({
	name: 'signup',
	description: 'join Eden 🌳 to find projects you love',
	execute: async ({ interaction }) => {
		return interaction.reply({
			content: 'Pong'
		});
	}
});
