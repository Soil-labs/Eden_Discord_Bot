import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	ForumChannel,
	GuildMember,
	Message,
	MessageCreateOptions,
	MessageType
} from 'discord.js';
import { sprintf } from 'sprintf-js';

import { GraphQL_AddMessageInput } from '../graph/gql/result';
import { addMessage } from '../graph/mutation/addMessage.mutation';
import { updateChatReply } from '../graph/mutation/updateChatReply.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { FORUM_TAG, LINK } from '../utils/const';
import { logger } from '../utils/logger';
import { awaitWrap, getTagName, ParseMemberFromString } from '../utils/util';

export default new Event('messageCreate', async (message: Message) => {
	if (!myCache.myHases(['ChatThreads', 'Servers'])) return;
	const { guildId, author, channelId, content, channel } = message;

	if (
		!author.bot &&
		(message.type === MessageType.Default || message.type === MessageType.Reply)
	) {
		if (content) {
			const mentionedMembers = message.mentions.members;
			const fields: GraphQL_AddMessageInput = {
				creator: author.id,
				mentioned: [],
				message: content,
				serverID: guildId
			};

			if (mentionedMembers.size !== 0) {
				fields.mentioned = mentionedMembers.map((m) => m.id);
			}

			await addMessage({
				fields
			});
		}
	}

	if (author.bot && channel.type === ChannelType.PublicThread) {
		const mentionedMember = message.mentions.members;

		// If invitee = inviter, this workflow won's be triggered, because the size is 1
		if (mentionedMember.size === 0 || mentionedMember.size !== 2) return;

		const [inviterMember, inviteeMember] = ParseMemberFromString(content, message.guild);

		if (!inviterMember || !inviteeMember) return;
		const isChatThread = myCache.myGet('ChatThreads')?.[guildId]?.includes(channelId);
		const isForumChatThread =
			myCache.myGet('Servers')?.[guildId]?.forumChatID === channel?.parentId;
		const dmReplies = [..._dmRepliesMap].filter(
			([value]) =>
				value.isChatThread === isChatThread && value.isForumChatThread === isForumChatThread
		);

		// Special case: ChatForum is equal to ServerForum
		// todo unexpected triggered when garden is created with only two mentioned users 
		if (dmReplies.length === 0) {
			return logger.warn('ChatForum is equal to ServerForum');
		}

		const dmReply = dmReplies[0][1](
			inviteeMember,
			inviterMember,
			getTagName(channel.parent as ForumChannel, channel.appliedTags[0]),
			channel.id
		);
		const threadId = sprintf(LINK.THREAD, {
			guildId: guildId,
			threadId: message.hasThread ? message.thread.id : message.channelId
		});
		const buttonComponent = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setLabel('Link to the post')
				.setStyle(ButtonStyle.Link)
				.setEmoji('🔗')
				.setURL(threadId)
		]);

		dmReply.inviteeReply.components = [buttonComponent];
		dmReply.inviterReply.components = [buttonComponent];

		const inviterDmChannel = await inviterMember.createDM();
		const inviteeDmChannel = await inviteeMember.createDM();

		await awaitWrap(inviterDmChannel.send(dmReply.inviterReply));
		await awaitWrap(inviteeDmChannel.send(dmReply.inviteeReply));
	}

	// Update current chat information to backend for AI usage
	const { id: userId } = author;

	await updateChatReply({
		fields: {
			threadID: channelId,
			receiverReply: true,
			replyUserID: userId
		}
	});
});

const _dmRepliesMap: Array<
	[
		{
			isChatThread: boolean;
			isForumChatThread: boolean;
		},
		(
			invitee: GuildMember,
			inviter: GuildMember,
			tagName: FORUM_TAG,
			channelId: string
		) => {
			inviteeReply: MessageCreateOptions;
			inviterReply: MessageCreateOptions;
		}
	]
> = [
	[
		{ isChatThread: true, isForumChatThread: false },
		(invitee, inviter) => ({
			inviteeReply: {
				embeds: [
					new EmbedBuilder()
						.setTitle(`You received an invitation to a conversation!`)
						.setDescription(
							`<@${inviter.id}> is willing to talk with you about a project.`
						)
				]
			},
			inviterReply: {
				embeds: [
					new EmbedBuilder()
						.setTitle(`You successfully invited <@${invitee.displayName}> to a talk`)
						.setDescription(`Keep eyes on the channel and happy connect!`)
				]
			}
		})
	],
	[
		{ isChatThread: false, isForumChatThread: true },
		(invitee, inviter, tagName, channelId) => {
			const title =
				tagName === FORUM_TAG.ServerForumUserIntroduction
					? {
							inviter: `You successfully sent your introduction to ${invitee.displayName}`,
							invitee: `You received an introduction from ${inviter.displayName}`
					  }
					: tagName === FORUM_TAG.ServerForumProjectInterest
					? {
							inviter: `You successfully showed your interest to ${invitee.displayName}'s project`,
							invitee: `${inviter.displayName} is interested in your project`
					  }
					: {
							inviter: `You successfully submitted your application to ${invitee.displayName}'s project`,
							invitee: `You received an application from ${inviter.displayName}`
					  };
			const descriptionPreix = `**Post Created**: <#${channelId}>\n\n`;
			const description =
				tagName === FORUM_TAG.ServerForumUserIntroduction
					? {
							inviter: `Hope you have a good talk soon.`,
							invitee: `Go to the post through the following button and make your choice!`
					  }
					: tagName === FORUM_TAG.ServerForumProjectInterest
					? {
							inviter: `Tips: Tell what kind of skills you master at to increase the possibility of be accepted by the project champion.`,
							invitee: `Go to the post through the following button and make your choice!`
					  }
					: {
							inviter: `Hope your application is accepted soon!`,
							invitee: `Go to the post through the following button and make your choice!`
					  };

			return {
				inviteeReply: {
					embeds: [
						new EmbedBuilder()
							.setTitle(title.invitee)
							.setDescription(descriptionPreix + description.invitee)
							.setThumbnail(inviter.displayAvatarURL())
					]
				},
				inviterReply: {
					embeds: [
						new EmbedBuilder()
							.setTitle(title.inviter)
							.setDescription(descriptionPreix + description.inviter)
							.setThumbnail(invitee.displayAvatarURL())
					]
				}
			};
		}
	]
];
