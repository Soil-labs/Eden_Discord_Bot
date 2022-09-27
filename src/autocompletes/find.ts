import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { Auto } from '../structures/AutoComplete';
import { myCache } from '../structures/Cache';
import { NUMBER } from '../utils/const';

export default new Auto({
	correspondingCommandName: 'find',
	execute: ({ interaction }) => {
		const guildId = interaction.guild.id;
		const { name, value } = interaction.options.getFocused(true);
		let filter: Array<ApplicationCommandOptionChoiceData> = [];
		switch (name) {
			case 'project': {
				if (!myCache.myHas('Projects')) return interaction.respond([]);
				const projectInform = myCache.myGet('Projects')[guildId];
				filter = Object.keys(projectInform)
					.filter((projectId) =>
						projectInform[projectId].title
							.toLocaleLowerCase()
							.startsWith(value.toLocaleLowerCase())
					)
					.map((projectId) => ({
						name: projectInform[projectId].title,
						value: projectId
					}))
					.slice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);
				break;
			}
			case 'skill_1':
			case 'skill_2':
			case 'skill_3':
			case 'skill_4': {
				if (!myCache.myHas('Skills')) return interaction.respond([]);
				const skillCache = myCache.myGet('Skills');
				filter = Object.keys(skillCache)
					.filter((skillId) =>
						skillCache[skillId].name
							.toLocaleLowerCase()
							.startsWith(value.toLocaleLowerCase())
					)
					.map((skillId) => ({
						name: skillCache[skillId].name,
						value: skillId
					}))
					.slice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);
				break;
			}
		}
		if (filter.length === 0) return interaction.respond([]);
		else return interaction.respond(filter);
	}
});
