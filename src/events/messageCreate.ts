import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
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
					new MessageEmbed().setTitle(
						`You received an invitation to a conversation!`
					).setDescription(`<@${senderId}> is willing to talk with you about a project.`)
				],
				components: [
					new MessageActionRow<MessageButton>().addComponents([
						new MessageButton()
							.setLabel('Read more')
							.setStyle('LINK')
							.setEmoji('🔗')
							.setURL(threadId)
					])
				]
			})
		);

		if (error) return;
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
