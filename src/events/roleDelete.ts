import { Role } from 'discord.js';

import { updateServer } from '../graph/mutation/updateServer.mutation';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';
import { logger } from '../utils/logger';

export default new Event('roleDelete', async (role: Role) => {
	if (!myCache.myHasAll()) return;

	const { id: roleId, guild } = role;
	const { id: guildId } = guild;
	const roleInform = myCache.myGet('Servers')?.[guildId]?.adminRoles;

	if (!roleInform || roleInform.length === 0) return;

	const index = roleInform.indexOf(roleId);

	if (index !== -1) {
		roleInform.splice(index, 1);
		const { error } = await updateServer({
			fields: {
				adminRoles: roleInform,
				_id: guildId
			}
		});

		if (!error) {
			myCache.mySet('Servers', {
				...myCache.myGet('Servers'),
				[guildId]: {
					...myCache.myGet('Servers')![guildId],
					adminRoles: roleInform
				}
			});
		} else {
			logger.error(error);
		}
	}
});
