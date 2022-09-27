import { Message } from 'discord.js';
import { sprintf } from 'sprintf-js';
import { Button } from '../structures/Button';
import { myCache } from '../structures/Cache';
import { convertMsToTime } from '../utils/util';

export default new Button({
	customIds: ['end'],
	execute: async({ interaction }) => {
		if (!myCache.myHas('VoiceContexts'))
			return interaction.reply({
				content: 'Please try again later, auto onboarding is initing',
				ephemeral: true
			});

		const guildId = interaction.guild.id;
		const contexts = myCache.myGet('VoiceContexts');
		const guildVoiceContext = contexts[guildId];
		if (!guildVoiceContext || !guildVoiceContext.channelId)
			return interaction.reply({
				content: 'Cannot find this auto onboarding, please start a new one.',
				ephemeral: true
			});

		// <t:${timestampSec}:f>
		const { hostId, timestamp } = guildVoiceContext;
		const [startTimeStamp] = interaction.message.embeds[0].description.match(/<t:\d*:f>/);
		if (startTimeStamp.slice(3, -3) !== timestamp.toString())
			return interaction.reply({
				content: 'Cannot find this auto onboarding, please start a new one.',
				ephemeral: true
			});

		if (interaction.customId === 'end') {
			if (interaction.user.id !== hostId)
				return interaction.reply({
					content: 'Sorry, only the host is allowed to trigger this button',
					ephemeral: true
				});

			const message = interaction.message as Message;
			let button = message.components;
			button[0].components[0].disabled = true;
			button[0].components[1].disabled = true;

			let embeds = message.embeds;
			const title = `${interaction.guild.name} Onboarding Call Ended`;

			const difference = new Date().getTime() - timestamp * 1000;
			embeds[0].description += sprintf(
				'\n`%s` <@%s> ended this onboarding call.',
				convertMsToTime(difference),
				hostId
			);

			embeds[0].title = title;

			await message.edit({
				embeds: embeds,
				components: button
			});

			myCache.mySet('VoiceContexts', {
				...contexts,
				[guildId]: {
					messageId: null,
					messageLink: null,
					channelId: null,
					timestamp: null,
					hostId: null,
					attendees: null,
					roomId: null
				}
			});

			return interaction.reply({
				content: 'You have cancelled this auto onboarding',
				ephemeral: true
			});
		}
	}
});
