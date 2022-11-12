import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';

import { addEndorsement } from '../graph/mutation/addEndorsement.mutation';
import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { Command } from '../structures/Command';
import { LINK } from '../utils/const';
import { getErrorReply, updateMemberCache, validMember } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: 'endorse',
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
					commandName: 'endorse',
					errorMessage: error
				})
			});
		}

		const endorseResults = result.addEndorsement.endorsements.reduce((pre, cur) => {
			const endorseInform = `**Endorser**: <@${
				cur.endorser._id
			}>\n**ARWeave Credentail**: [Explorer Link](<${
				LINK.ARWEAVE_EXPLORER + cur.arweaveTransactionID
			}>)\n`;

			return pre + endorseInform;
		}, '');

		return interaction.followUp({
			content: `You have successfully endorse ${member.username}!`,
			embeds: [
				new EmbedBuilder()
					.setTitle(`${member.username} Endorsement Record`)
					.setDescription(endorseResults)
			]
		});
	}
});
