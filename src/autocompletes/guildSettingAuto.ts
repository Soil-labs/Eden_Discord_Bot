import { Auto } from '../structures/AutoComplete';
import { GuildInform } from '../types/Cache';
import { myCache } from '../utils/cache';
import { logger } from '../utils/logger';

export default new Auto({
	CorrespondingCommandName: 'guild',
	execute: ({ interaction }) => {
		const guildId = interaction.guild.id;
		const { name, value } = interaction.options.getFocused(true);
		if (!myCache.has('Guilds')) return interaction.respond([]);
		const guildInform: GuildInform = myCache.get('Guilds')[guildId];

		let filter: Array<any> = [];
		switch (name) {
			case 'role': {
				const currentRoles = guildInform.permission.adminRole;
				filter = currentRoles
					.map((roleId) => ({
						name: interaction.guild.roles.cache.get(roleId)?.name,
						value: roleId
					}))
					.filter((res) => res.name.includes(value.toString()));
				break;
			}
			case 'member': {
				const currentMembers = guildInform.permission.adminMember;
				filter = currentMembers
					.map((memberId) => ({
						name: interaction.guild.members.cache.get(memberId)?.displayName,
						value: memberId
					}))
					.filter((res) => res.name.includes(value.toString()));
				break;
			}
			case 'command': {
				const currentCommands = guildInform.permission.adminCommand;
				filter = currentCommands
					.filter((command) => command.includes(value.toString()))
					.map((command) => ({
						name: command,
						value: command
					}));
				break;
			}
			case 'address': {
				const currentAddresses = guildInform.proxyContract;
				filter = currentAddresses
					.filter((addr) => addr.includes(value.toString()))
					.map((addr) => ({
						name: addr,
						value: addr
					}));
			}
		}
		if (filter.length === 0) return interaction.respond([]);
		else return interaction.respond(filter);
	}
});
