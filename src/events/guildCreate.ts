import { Guild } from 'discord.js';
import { myCache } from '../structures/Cache';
import { Event } from '../structures/Event';

export default new Event('guildCreate', async (newGuild: Guild) => {
	// todo handle possible errors
	if (newGuild.available && myCache.myHas('Servers')) {
		// const guildId = newGuild.id;
		// const guildInform = myCache.myGet('Servers')[guildId];
		// if (!guildInform){

		// }
		// const guildPermissionInform = {
		// 	adminID: [],
		// 	adminRoles: [],
		// 	adminCommands: []
		// };
		// let cached;
		// if (myCache.has('server')) {
		// 	cached = {
		// 		...myCache.get('server'),
		// 		[guild.id]: guildPermissionInform
		// 	};
		// } else cached[guild.id] = guildPermissionInform;

		// const [result, error] = await updateServer({
		// 	guildId: guild.id,
		// 	guildName: guild.name,
		// 	...guildPermissionInform
		// });

		// if (error)
		// 	return logger.error(
		// 		`${guild.name} was created, but cannot upload its permission information. Reason: ${error}`
		// 	);

		// myCache.set('server', cached);
	}
});
