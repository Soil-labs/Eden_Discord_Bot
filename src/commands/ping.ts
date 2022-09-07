import { Command } from '../structures/Command';
import { logger } from '../utils/logger';

export default new Command({
	name: 'ping',
	description: 'Ping Pong Command',
	execute: async ({ interaction }) => {
		return interaction.reply({
			content: "Pong"
		})
	}
});
