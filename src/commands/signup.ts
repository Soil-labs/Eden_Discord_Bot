import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { sprintf } from 'sprintf-js';

import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { updateMember } from '../graph/mutation/updateMember.mutation';
import { Command } from '../structures/Command';
import { CONTENT, LINK } from '../utils/const';
import { getErrorReply, updateMemberCache, validMember } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: 'signup',
	description: 'join Eden 🌳 to find projects you love',
	execute: async ({ interaction }) => {
		const user = interaction.user;
		const guildId = interaction.guild.id;
		const validResult = validMember(user.id, guildId);

		const inform = {
			_id: user.id,
			discordName: user.username,
			discriminator: user.discriminator,
			discordAvatar: user.displayAvatarURL()
		};

		await interaction.deferReply({ ephemeral: true });

		if (validResult) {
			const { error } = await updateMember({
				fields: inform
			});

			if (error)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: error
					})
				});
		} else {
			const { error } = await addNewMember({
				fields: {
					...inform,
					invitedBy: user.id,
					serverID: guildId
				}
			});

			if (error)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: error
					})
				});
		}

		updateMemberCache({
			userId: user.id,
			name: user.username,
			guildId: guildId
		});

		const replyEmbed = new EmbedBuilder()
			.setTitle("Hooray! You're about to join Eden 🌳")
			.setDescription(sprintf(CONTENT.ONBOARD_SELF, { onboardLink: LINK.SIGNUP }));

		return interaction.followUp({
			embeds: [replyEmbed]
		});
	}
});
