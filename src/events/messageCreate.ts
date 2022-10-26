import { Message } from 'discord.js';

import { updateChatReply } from '../graph/mutation/updateChatReply.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';

export default new Event('messageCreate', async (message: Message) => {
	if (!myCache.myHases(['ChatThreads', 'Servers'])) return;
	const { guildId, author, channelId } = message;

	if (author.bot) return;
	const guildInform = myCache.myGet('ChatThreads')[guildId];

	if (!guildInform.includes(channelId)) return;
	const { id: userId } = author;

	const { result, error } = await updateChatReply({
		fields: {
			threadID: channelId,
			receiverReply: true,
			replyUserID: userId
		}
	});

	console.log(result, error);
});
