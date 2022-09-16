import { ChannelTypes } from 'discord.js/typings/enums';
import { Command } from '../structures/Command';
import { logger } from '../utils/logger';

export default new Command({
	name: 'onboard',
	description: 'Find & be found for opportunity',
	options: [
		{
			type: 'SUB_COMMAND',
			description: 'Onboard multiple new frens into Eden 🌳',
			name: 'member',
			options: [
				{
					type: 'STRING',
					description: "Member you'd like to onboard",
					required: true,
					name: 'frens'
				}
			]
		},
		{
			type: 'SUB_COMMAND',
			description: 'Automatically onboard members in a voice call',
			name: 'auto',
			options: [
				{
					type: 'CHANNEL',
					description: 'Onboarding voice channel',
					required: true,
					name: 'channel',
					channel_types: [ChannelTypes.GUILD_VOICE]
				}
			]
		},
		{
			type: 'SUB_COMMAND',
			description: 'Set up a channel to self-onboard.',
			name: 'room',
			options: [
				{
					type: 'CHANNEL',
					description: 'Choose a channel',
					required: true,
					name: 'channel',
					channel_types: [ChannelTypes.GUILD_VOICE]
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
