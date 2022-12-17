import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';
import _ from 'lodash';

import { addEndorsement } from '../graph/mutation/addEndorsement.mutation';
import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { Command } from '../structures/Command';
import { CommandNameEmun } from '../types/Command';
import { LINK } from '../utils/const';
import { getErrorReply, updateMemberCache, validMember } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Endorse,
	description: 'Endorse you friends, help them grow up and find a good match.',
	options: [
		{
			name: 'friend',
			description: 'The member you are willing to endorse.',
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: 'comment',
			description: 'Tell us how good this member is',
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	execute: async ({ interaction, args }) => {
		const { guildId } = interaction;
		const member = args.getUser('friend');
		const comment = args.getString('comment');

		if (member.id === interaction.user.id) {
			return interaction.reply({
				content:
					'Sorry, you cannot endorse yourself. Try to ask your friends to prove your abilities!',
				ephemeral: true
			});
		}

		await interaction.deferReply({ ephemeral: true });

		const isNewInviter = validMember(member.id, guildId);

		if (!isNewInviter) {
			const { error: inviteError } = await addNewMember({
				fields: {
					_id: member.id,
					discordName: member.username,
					discriminator: member.discriminator,
					discordAvatar: member.displayAvatarURL(),
					invitedBy: interaction.user.id,
					serverID: guildId
				}
			});

			if (inviteError)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: inviteError
					})
				});

			updateMemberCache({
				userId: member.id,
				name: member.username,
				guildId: guildId
			});
		}

		const { result, error } = await addEndorsement({
			fields: {
				endorserID: interaction.user.id,
				endorseeID: member.id,
				endorsementMessage: comment
			}
		});

		if (error) {
			return interaction.followUp({
				content: getErrorReply({
					commandName: interaction.commandName,
					errorMessage: error
				})
			});
		}

		let curEndorseArLink = LINK.ARWEAVE_EXPLORER;
		const curEndorse = _.last(result.addEndorsement.endorsements);

		if (curEndorse?.arweaveTransactionID) {
			curEndorseArLink += curEndorse?.arweaveTransactionID;
		}
		return interaction.followUp({
			content: `You have successfully endorse ${member.username}!\nhttps://eden-alpha-develop.vercel.app/profile/${member.username}`,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel('Check it on Arweave')
						.setStyle(ButtonStyle.Link)
						.setEmoji('🔗')
						.setURL(curEndorseArLink)
				])
			]
		});
	}
});
