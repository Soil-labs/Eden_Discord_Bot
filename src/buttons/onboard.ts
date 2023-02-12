import { Message } from 'discord.js';
import { sprintf } from 'sprintf-js';

import { Button } from '../structures/Button';
import { myCache } from '../structures/Cache';
import { ButtonCustomIdEnum } from '../types/Button';
import { defaultGuildVoiceContext } from '../utils/const';
import { convertMsToTime } from '../utils/util';

export default new Button({
	customIds: [ButtonCustomIdEnum.EndOnboarding],
	execute: async ({ interaction }) => {
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
			const buttonJson = message.components[0].toJSON();

			buttonJson.components[0].disabled = true;
			buttonJson.components[1].disabled = true;

			const embedsJson = message.embeds[0].toJSON();
			const title = `${interaction.guild.name} Onboarding Call Ended`;

			const difference = new Date().getTime() - timestamp * 1000;

			embedsJson.description += sprintf(
				'\n`%s` <@%s> ended this onboarding call.',
				convertMsToTime(difference),
				hostId
			);

			embedsJson.title = title;

			await message.edit({
				embeds: [embedsJson],
				components: [buttonJson]
			});

			myCache.mySet('VoiceContexts', {
				...contexts,
				[guildId]: defaultGuildVoiceContext
			});

			return interaction.reply({
				content: 'You have cancelled this auto onboarding',
				ephemeral: true
			});
		}
	}
});
