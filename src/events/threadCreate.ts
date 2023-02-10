import { ChannelType, ForumChannel, ThreadChannel } from 'discord.js';

import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { FORUM_TAG } from '../utils/const';
import { getTagId } from '../utils/util';

export default new Event('threadCreate', (newThread: ThreadChannel, newlyCreated: Boolean) => {
	if (newlyCreated && myCache.myHases(['ChatThreads', 'Teams', 'Servers'])) {
		const { guildId, parentId, parent } = newThread;

		if (!parentId || !parent) return;
		if (parent?.type !== ChannelType.GuildForum) return;

		// Server forum post is created
		if (parentId === myCache.myGet('Servers')?.[guildId]?.forumChatID) {
			// todo: In case, more actions are needed here in the future
			return;
		} else {
			// Chat post is created
			const tagId = getTagId(newThread.parent as ForumChannel, FORUM_TAG.Chat);

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
	}
});
