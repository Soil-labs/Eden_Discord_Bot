import { Message } from 'discord.js';
import { sprintf } from 'sprintf-js';
import { Button } from '../structures/Button';
import { myCache } from '../utils/cache';
import { convertMsToTime } from '../utils/util';

export default new Button({
	customIds: ['onboard', 'end'],
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

		// if (interaction.customId == this.customId[0]){
		//     const attendees = guildVoiceContext.attendees;

		//     if (!attendees.includes(interaction.user.id)) return interaction.reply({
		//         content: "Sorry, you did not join in this onboarding call.",
		//         ephemeral: true
		//     })
		//     await interaction.deferReply({ ephemeral: true });

		//     const member = interaction.user;

		//     const roomLink = sprintf(CONSTANT.LINK.ROOM, {
		//         roomId: roomId,
		//     })

		//     return interaction.followUp({
		//         embeds: [
		//             new MessageEmbed()
		//                 .setTitle("Join the Party🎊")
		//                 .setDescription(sprintf("Hey <@%s>! I'm an Eden 🌳 bot helping <@%s> with this onboarding call! Click [here](<%s>) to claim a ticket and join the onboarding Party Page!",
		//                     interaction.user.id, hostId, roomLink))
		//         ]
		//     })
		// }

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
