import { Guild } from 'discord.js';
import { getApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

import { updateServer } from '../graph/mutation/updateServer.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { templateGuildInform, templateGuildSettingInform } from '../types/Cache';
import { logger } from '../utils/logger';

export default new Event('guildCreate', async (newGuild: Guild) => {
	// todo handle possible errors
	try {
		if (newGuild.available && myCache.myHas('Servers')) {
			const guildId = newGuild.id;
			const guildInform = myCache.myGet('Servers')[guildId];

			if (!guildInform) {
				const { error } = await updateServer({
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

				await setDoc(doc(getFirestore(getApp()), 'Guilds', guildId), {
					...templateGuildSettingInform
				});

				myCache.mySet('Servers', {
					...myCache.myGet('Servers'),
					[guildId]: {
						...templateGuildInform
					}
				});

				myCache.mySet('GuildSettings', {
					...myCache.myGet('GuildSettings'),
					[guildId]: {
						...templateGuildSettingInform
					}
				});
			}
		}
	} catch (error) {
		logger.error(
			`Error occurs when event \`guildCreate\`. Error Detail: ${error?.message}. Error Stack: ${error?.stack}`
		);
	}
});
