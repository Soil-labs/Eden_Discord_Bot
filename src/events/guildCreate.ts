import { Guild } from 'discord.js';
import { updateServer } from '../graph/mutation/updateServer.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { templateGuildInform } from '../types/Cache';
import { logger } from '../utils/logger';

export default new Event('guildCreate', async (newGuild: Guild) => {
	// todo handle possible errors
	if (newGuild.available && myCache.myHas('Servers')) {
		const guildId = newGuild.id;
		const guildInform = myCache.myGet('Servers')[guildId];
		if (!guildInform) {
			const [result, error] = await updateServer({
				fields: {
					...templateGuildInform,
					_id: guildId,
					name: newGuild.name
				}
			});
			if (error) {
				return logger.error(
					`${newGuild.name} was created, but cannot upload its permission information. Reason: ${error}`
				);
			}

			myCache.mySet('Servers', {
				...myCache.myGet('Servers'),
				[guildId]: {
					...templateGuildInform
				}
			});
		}
	}
});
