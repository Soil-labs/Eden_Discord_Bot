import { ChannelType, ForumChannel, ThreadChannel } from 'discord.js';

import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { CONTENT } from '../utils/const';
import { validForumTag } from '../utils/util';

export default new Event('threadCreate', (newThread: ThreadChannel, newlyCreated: Boolean) => {
	if (newlyCreated && myCache.myHases(['ChatThreads', 'Teams'])) {
		const { guildId, parentId, parent } = newThread;

		if (!parentId || !parent) return;
		if (parent?.type !== ChannelType.GuildForum) return;
		const tagId = validForumTag(newThread.parent as ForumChannel, CONTENT.CHAT_TAG_NAME);

		if (!tagId) return;
		const teamCache = myCache.myGet('Teams')[guildId];

		if (!teamCache) return;
		const teamForumChannelIds = Object.values(teamCache).map((team) => team.forumChannelId);

		if (teamForumChannelIds.length === 0) return;
		if (teamForumChannelIds.includes(parentId)) {
			// todo Warning: Hard to say which event, threadCreate and messageCreate, triggers first. Based on current observation, threadCreate first, then messageCreate
			if (!newThread?.appliedTags?.includes(tagId)) return;
			myCache.mySet('ChatThreads', {
				...myCache.myGet('ChatThreads'),
				[guildId]: [...myCache.myGet('ChatThreads')[guildId], newThread.id]
			});
		}
	}
});
