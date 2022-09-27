import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { Auto } from '../structures/AutoComplete';
import { ProjectId, RoleValueType, TeamId, TeamValueType } from '../types/Cache';
import { myCache } from '../structures/Cache';
import { NUMBER } from '../utils/const';

export default new Auto({
	correspondingCommandName: 'update',
	execute: ({ interaction }) => {
		const guildId = interaction.guild.id;
		const { name, value } = interaction.options.getFocused(true);
		if (!myCache.myHas('ProjectTeamRole') || !myCache.myGet('ProjectTeamRole')[guildId])
			return interaction.respond([]);

		const projectTeamRoleInGuild = myCache.myGet('ProjectTeamRole')[guildId];
		const resolvedProject: ProjectId = interaction.options.getString('project');
		const resolvedTeam: TeamId = interaction.options.getString('team');

		if (name === 'project') {
			const filtered: Array<ApplicationCommandOptionChoiceData> = Object.keys(
				projectTeamRoleInGuild
			)
				.filter((projectId) => {
					return projectTeamRoleInGuild[projectId].projectTitle
						.toLowerCase()
						.startsWith(value.toLowerCase());
				})
				.map((projectId) => ({
					name: projectTeamRoleInGuild[projectId].projectTitle,
					value: projectId
				}))
				.slice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);

			if (filtered.length === 0) {
				return interaction.respond([]);
			} else {
				return interaction.respond(filtered);
			}
		}

		if (name === 'team') {
			const teams = projectTeamRoleInGuild?.[resolvedProject]?.teams;
			if (!teams) return interaction.respond([]);

			const teamFilter: Array<ApplicationCommandOptionChoiceData> = Object.keys(teams)
				.filter((teamId) => {
					return teams[teamId].teamName.toLowerCase().startsWith(value.toLowerCase());
				})
				.map((teamId) => {
					return {
						name: teams[teamId].teamName,
						value: teamId
					};
				})
				.slice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);

			if (teamFilter.length === 0) {
				return interaction.respond([]);
			} else {
				return interaction.respond(teamFilter);
			}
		}
		if (name === 'role') {
			const roles =
				projectTeamRoleInGuild?.[resolvedProject]?.['teams']?.[resolvedTeam]?.['roles'];
			if (!roles) return interaction.respond([]);
			const roleFilter: Array<ApplicationCommandOptionChoiceData> = Object.keys(roles)
				.filter((roleId) => {
					return roles[roleId].roleName.toLowerCase().startsWith(value.toLowerCase());
				})
				.map((roleId) => {
					return {
						name: roles[roleId].roleName,
						value: roleId
					};
				})
				.slice(0, NUMBER.AUTOCOMPLETE_OPTION_LENGTH);
			if (roleFilter.length === 0) {
				return interaction.respond([]);
			} else {
				return interaction.respond(roleFilter);
			}
		}
	}
});
