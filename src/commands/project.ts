import { Command } from '../structures/Command';
import { logger } from '../utils/logger';

export default new Command({
	name: 'project',
	description: 'Explore projects',
	options: [
		{
			type: 'SUB_COMMAND',
			description: 'Launch a project in the community',
			name: 'new'
		},
		{
			type: 'SUB_COMMAND',
			description: 'See key updates of a specific project',
			name: 'activity',
			options: [
				{
					type: 'STRING',
					description: 'Choose the project you are interested in',
					required: true,
					name: 'project_name'
				}
			]
		}
	],
	execute: async ({ interaction }) => {
		return interaction.reply({
			content: 'Pong'
		});
	}
});
