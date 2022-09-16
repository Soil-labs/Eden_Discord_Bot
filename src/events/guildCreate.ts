import { Guild } from 'discord.js';
import { Event } from '../structures/Event';

export default new Event('guildCreate', async (newGuild: Guild) => {
	if (newGuild.available) {
		console.log('12312');
	}
});
