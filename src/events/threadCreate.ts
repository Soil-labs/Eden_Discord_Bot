import { ThreadChannel } from 'discord.js';

import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';

export default new Event('threadCreate', (newThread: ThreadChannel, newlyCreated: Boolean) => {
	if (newlyCreated && myCache.myHas('ChatThreads')) {
		const { guildId, parentId } = newThread;

		if (!parentId) return;

		const chatChannelId = myCache.myGet('Servers')?.[guildId]?.channelChatID;

		if (!chatChannelId) return;
		if (parentId === chatChannelId) {
			myCache.mySet('ChatThreads', {
				...myCache.myGet('ChatThreads'),
				[guildId]: [...myCache.myGet('ChatThreads')[guildId], newThread.id]
			});
		}
	}
});
