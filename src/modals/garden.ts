import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import { GraphQL_CreateProjectUpdateInput } from '../graph/gql/result';
import { createProjectUpdate } from '../graph/mutation/createProjectUpdate.mutation';
import { myCache } from '../structures/Cache';
import { Modal } from '../structures/Modal';
import { GardenMemberId } from '../types/Cache';
import { LINK } from '../utils/const';
import { awaitWrap, checkGardenChannelPermission, getErrorReply } from '../utils/util';

export default new Modal({
	customId: 'update',
	execute: async ({ interaction }) => {
		const userId = interaction.user.id;
		const guildId = interaction.guild.id;
		const gardenUserIndentity: GardenMemberId = `${guildId}_${userId}`;
		const gardenContext = myCache.myGet('GardenContext');

		if (!gardenContext[gardenUserIndentity])
			return interaction.reply({
				content: 'Cannot find your record, please report to the admin.',
				ephemeral: true
			});
		const title = interaction.fields.getTextInputValue('garden_title').trim();
		const content = interaction.fields.getTextInputValue('garden_content').trim();

		const {
			generalChannelId,
			projectId,
			memberIds,
			teamIds,
			roleIds,
			tokenAmount,
			projectTitle,
			teamName,
			roleName,
			autoArchiveDuration
		} = gardenContext[gardenUserIndentity];

		await interaction.deferReply({ ephemeral: true });

		let generalChannel = interaction.guild.channels.cache.get(generalChannelId) as TextChannel;

		if (!generalChannel) {
			const { result, error } = await awaitWrap(
				interaction.guild.channels.fetch(generalChannelId)
			);

			if (error)
				return interaction.followUp({
					content: `Sorry, the general channel for ${teamName} is unfetchable.`
				});
			generalChannel = result as TextChannel;
		}

		const permissionCheck = checkGardenChannelPermission(
			generalChannel,
			interaction.guild.me.id
		);

		if (permissionCheck)
			return interaction.followUp({
				content: permissionCheck,
				ephemeral: true
			});

		const thread = await generalChannel.threads.create({
			name: title,
			autoArchiveDuration: autoArchiveDuration ?? 1440
		});
		let embedDescription = `\u200B\n**Project**: ${projectTitle}\n**Team**: ${teamName}\n**Role**: ${roleName}`;

		if (tokenAmount) embedDescription += `\n**Token Transferred**: \`${tokenAmount}\``;
		const memberIdsString = _.uniq([...memberIds, userId])
			.map((value) => `<@${value}>`)
			.toString();

		await thread.send({
			content: memberIdsString,
			embeds: [
				new MessageEmbed()
					.setAuthor({
						name: `@${interaction.member.displayName} -- Author`,
						iconURL: interaction.user.avatarURL()
					})
					.setDescription(embedDescription)
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setLabel('Garden Feed')
						.setEmoji('🔗')
						.setStyle('LINK')
						.setURL(LINK.GARDEN_FEED),
					new MessageButton()
						.setLabel('Garden Graph')
						.setEmoji('🔗')
						.setStyle('LINK')
						.setURL(LINK.GARDEN_GRAPH)
				)
			]
		});
		thread.send({
			content: `**Content**: \n${content}`
		});

		const gardenUpdateInform: GraphQL_CreateProjectUpdateInput = {
			projectID: projectId,
			memberID: memberIds,
			authorID: userId,
			teamID: teamIds,
			roleID: roleIds,
			title: title,
			content: content,
			serverID: [guildId]
		};

		gardenUpdateInform.threadDiscordID = sprintf(LINK.THREAD, {
			guildId: guildId,
			threadId: thread.id
		});

		if (tokenAmount) gardenUpdateInform.token = tokenAmount.toString();

		const { error } = await createProjectUpdate({
			fields: gardenUpdateInform
		});

		if (error) {
			thread.delete('GraphQL Error, cannot upload garden information');
			delete gardenContext[gardenUserIndentity];
			myCache.mySet('GardenContext', gardenContext);
			return interaction.followUp({
				content: getErrorReply({
					commandName: 'update',
					errorMessage: error
				})
			});
		}

		if (
			myCache.myHas('GuildSettings') &&
			myCache.myGet('GuildSettings')[guildId]?.forwardChannelId
		) {
			const forwardChannel = interaction.guild.channels.cache.get(
				myCache.myGet('GuildSettings')[guildId].forwardChannelId
			) as TextChannel;

			if (forwardChannel) {
				forwardChannel.send({
					embeds: [
						new MessageEmbed()
							.setAuthor({
								name: interaction.member.displayName,
								iconURL: interaction.user.avatarURL()
							})
							.setTitle(title)
							.setDescription(content)
							.addFields([
								{
									name: 'Members of Garden',
									value: memberIdsString
								}
							])
					],
					components: [
						new MessageActionRow().addComponents([
							new MessageButton()
								.setLabel('Jump to the thread')
								.setStyle('LINK')
								.setEmoji('🔗')
								.setURL(gardenUpdateInform.threadDiscordID)
						])
					]
				});
			}
		}

		delete gardenContext[gardenUserIndentity];
		myCache.mySet('GardenContext', gardenContext);

		return interaction.followUp({
			content: `Update the Secret Garden successfully! Check the thread <#${thread.id}>.`
		});
	}
});
