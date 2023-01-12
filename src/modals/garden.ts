import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ForumChannel,
	ThreadAutoArchiveDuration
} from 'discord.js';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import { GraphQL_CreateProjectUpdateInput } from '../graph/gql/result';
import { createProjectUpdate } from '../graph/mutation/createProjectUpdate.mutation';
import { myCache } from '../structures/Cache';
import { Modal } from '../structures/Modal';
import { GardenMemberId } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import { LINK } from '../utils/const';
import { awaitWrap, checkForumPermission, getErrorReply } from '../utils/util';

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
			forumChannelId,
			projectId,
			memberIds,
			teamIds,
			roleIds,
			tokenAmount,
			projectTitle,
			teamName,
			roleName,
			autoArchiveDuration,
			tagId
		} = gardenContext[gardenUserIndentity];

		await interaction.deferReply({ ephemeral: true });

		let forumChannel = interaction.guild.channels.cache.get(forumChannelId) as ForumChannel;

		if (!forumChannel) {
			const { result, error } = await awaitWrap(
				interaction.guild.channels.fetch(forumChannelId)
			);

			if (error) {
				return interaction.followUp({
					content: `Sorry, the general channel for ${teamName} is unfetchable.`
				});
			}
			forumChannel = result as ForumChannel;
		}

		const permissionCheck = checkForumPermission(forumChannel, interaction.guild.members.me.id);

		if (permissionCheck) {
			return interaction.followUp({
				content: permissionCheck,
				ephemeral: true
			});
		}

		let embedDescription = `\u200B\n**Project**: ${projectTitle}\n**Team**: ${teamName}\n**Role**: ${roleName}`;

		if (tokenAmount) embedDescription += `\n**Token Transferred**: \`${tokenAmount}\``;
		const memberIdsString = _.uniq([...memberIds, userId])
			.map((value) => `<@${value}>`)
			.toString();

		const thread = await forumChannel.threads.create({
			name: title,
			message: {
				content: memberIdsString,
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: `@${interaction.member.displayName} -- Author`,
							iconURL: interaction.user.avatarURL()
						})
						.setDescription(embedDescription)
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel('Garden Feed')
							.setEmoji('🔗')
							.setStyle(ButtonStyle.Link)
							.setURL(LINK.GARDEN_FEED),
						new ButtonBuilder()
							.setLabel('Garden Graph')
							.setEmoji('🔗')
							.setStyle(ButtonStyle.Link)
							.setURL(LINK.GARDEN_GRAPH),
						new ButtonBuilder()
							.setCustomId('expired_post')
							.setLabel('Archive this thread')
							.setStyle(ButtonStyle.Danger)
							.setEmoji('🗃️')
					)
				]
			},
			appliedTags: [tagId],
			autoArchiveDuration,
			reason: 'Garden Created'
		});

		await thread.send({
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
			await thread.delete('GraphQL Error, cannot upload garden information');
			delete gardenContext[gardenUserIndentity];
			myCache.mySet('GardenContext', gardenContext);
			return interaction.followUp({
				content: getErrorReply({
					commandName: CommandNameEmun.Garden,
					errorMessage: error
				})
			});
		}

		if (
			myCache.myHas('GuildSettings') &&
			myCache.myGet('GuildSettings')[guildId]?.forwardForumChannelId
		) {
			let forwardForumChannel = interaction.guild.channels.cache.get(
				myCache.myGet('GuildSettings')[guildId].forwardForumChannelId
			) as ForumChannel;
			const permissinChecking = checkForumPermission(
				forwardForumChannel,
				interaction.guild.members.me.id
			);

			if (forwardForumChannel && !permissinChecking) {
				const tags = forwardForumChannel.availableTags.filter(
					(tag) => tag.name === teamName
				);

				if (tags.length === 0) {
					forwardForumChannel = await forwardForumChannel.setAvailableTags([
						{
							name: teamName
						},
						...forwardForumChannel.availableTags
					]);
					const tagId = forwardForumChannel.availableTags.filter(
						(tag) => tag.name === teamName
					)[0].id;

					forwardForumChannel.threads.create({
						name: `${teamName} Updates`,
						message: {
							content:
								'This post is for the team updates. **DO NOT SEND OTHER MESSAGES EXCEPT BOT.**',
							embeds: [
								new EmbedBuilder()
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
								new ActionRowBuilder<ButtonBuilder>().addComponents([
									new ButtonBuilder()
										.setLabel('Join our party')
										.setStyle(ButtonStyle.Link)
										.setEmoji('🔗')
										.setURL(gardenUpdateInform.threadDiscordID)
								])
							]
						},
						appliedTags: [tagId],
						autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
					});
				} else {
					const tagId = tags[0].id;
					const postsWithTag = forwardForumChannel.threads.cache.filter((post) =>
						post?.appliedTags?.includes(tagId)
					);

					if (postsWithTag.size === 0) {
						forwardForumChannel.threads.create({
							name: `${teamName} Updates`,
							message: {
								content:
									'This post is for the team updates. **DO NOT SEND OTHER MESSAGES EXCEPT BOT.**',
								embeds: [
									new EmbedBuilder()
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
									new ActionRowBuilder<ButtonBuilder>().addComponents([
										new ButtonBuilder()
											.setLabel('Join our party')
											.setStyle(ButtonStyle.Link)
											.setEmoji('🔗')
											.setURL(gardenUpdateInform.threadDiscordID)
									])
								]
							},
							appliedTags: [tagId],
							autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
						});
					} else {
						const targetPost = postsWithTag.first();

						targetPost.send({
							embeds: [
								new EmbedBuilder()
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
								new ActionRowBuilder<ButtonBuilder>().addComponents([
									new ButtonBuilder()
										.setLabel('Join our party')
										.setStyle(ButtonStyle.Link)
										.setEmoji('🔗')
										.setURL(gardenUpdateInform.threadDiscordID)
								])
							]
						});
					}
				}
			}
		}

		delete gardenContext[gardenUserIndentity];
		myCache.mySet('GardenContext', gardenContext);

		return interaction.followUp({
			content: `Update the Secret Garden successfully! Check the thread <#${thread.id}>.`
		});
	}
});
