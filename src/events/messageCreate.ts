import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from 'discord.js';
import { sprintf } from 'sprintf-js';

import { updateChatReply } from '../graph/mutation/updateChatReply.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { LINK } from '../utils/const';
import { awaitWrap } from '../utils/util';

export default new Event('messageCreate', async (message: Message) => {
	if (!myCache.myHases(['ChatThreads', 'Servers'])) return;
	const { guildId, author, channelId, content } = message;
	const guildInform = myCache.myGet('ChatThreads')[guildId];

	if (!guildInform.includes(channelId)) return;
	if (author.bot) {
		let matchResults = content.match(/<@!?\d+>/g);

		if (!matchResults) return;
		matchResults = matchResults.map((result) => {
			if (result.slice(2, -1).startsWith('!')) {
				return result.slice(3, -1);
			} else {
				return result.slice(2, -1);
			}
		});
		if (matchResults.length !== 2) return;
		const [receiverId, senderId] = matchResults;

		const receiver = message.guild.members.cache.get(receiverId);

		if (!receiver) return;
		const DMChannel = await receiver.createDM();
		const threadId = sprintf(LINK.THREAD, {
			guildId: guildId,
			threadId: message.hasThread ? message.thread.id : message.channelId
		});
		const { error } = await awaitWrap(
			DMChannel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`You received an invitation to a conversation!`)
						.setDescription(
							`<@${senderId}> is willing to talk with you about a project.`
						)
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setLabel('Read more')
							.setStyle(ButtonStyle.Link)
							.setEmoji('🔗')
							.setURL(threadId)
					])
				]
			})
		);

		if (error) return;

		const sender = message.guild.members.cache.get(senderId);

		if (!sender) return;
		const senderDMChannel = await sender.createDM();

		const { error: senderError } = await awaitWrap(
			senderDMChannel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`You successfully invited ${receiver.displayName} to a talk`)
						.setDescription(`Keep eyes on the channel and happy connect!`)
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setLabel('Read more')
							.setStyle(ButtonStyle.Link)
							.setEmoji('🔗')
							.setURL(threadId)
					])
				]
			})
		);

		if (senderError) return;
	}

	const { id: userId } = author;

	await updateChatReply({
		fields: {
			threadID: channelId,
			receiverReply: true,
			replyUserID: userId
		}
	});
});
