import { Command } from '../structures/Command';
import { logger } from '../utils/logger';

export default new Command({
	name: 'invite',
	description: 'Invite a fren to join Eden 🌳',
    options: [
        {
            type: 'USER',
            description: 'The member you\'d like to support',
            name: 'fren',
            required: true
        }
    ],
	execute: async ({ interaction }) => {
		return interaction.reply({
			content: 'Pong'
		});
	}
});
