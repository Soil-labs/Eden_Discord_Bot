import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

import { addEndorsement } from '../graph/mutation/addEndorsement.mutation';
import { Command } from '../structures/Command';
import { LINK } from '../utils/const';
import { getErrorReply } from '../utils/util';

export default new Command({
	name: 'endorse',
	description: 'Endorse you friends, help them grow up and find a good match.',
	options: [
		{
			name: 'friend',
			description: 'The member you are willing to endorse.',
			type: ApplicationCommandOptionTypes.USER,
			required: true
		},
		{
			name: 'comment',
			description: 'Tell us how good this member is',
			type: ApplicationCommandOptionTypes.STRING,
			required: true
		}
	],
	execute: async ({ interaction, args }) => {
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

		// todo fail to check if this endorser in this guild
		const endorseResults = result.addEndorsement.endorsements.reduce((pre, cur) => {
			const endorseInform = `**Endorser**: <@${
				cur.endorser
			}>\n**ARWeave Credentail**: [Explorer Link](<${
				LINK.ARWEAVE_EXPLORER + cur.arweaveTransactionID
			}>)\n`;

			return pre + endorseInform;
		}, '');

		return interaction.followUp({
			content: `You have successfully endorse ${member.username}!`,
			embeds: [
				new MessageEmbed().setTitle('ARWeave Information').setDescription(endorseResults)
			]
		});
	}
});
