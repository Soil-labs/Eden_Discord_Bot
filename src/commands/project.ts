import { MessageEmbed } from 'discord.js';
import { sprintf } from 'sprintf-js';

import { findProject } from '../graph/query/findProject.query';
import { Command } from '../structures/Command';
import { LINK } from '../utils/const';
import { getErrorReply, validProject } from '../utils/util';

export default new Command({
	name: 'project',
	description: 'Explore projects',
	options: [
		{
			type: 'SUB_COMMAND',
			description: 'Launch a project in the community',
			name: 'new'
		},
		{
			type: 'SUB_COMMAND',
			description: 'See key updates of a specific project',
			name: 'activity',
			options: [
				{
					type: 'STRING',
					description: 'Choose the project you are interested in',
					required: true,
					name: 'project_name'
				}
			]
		}
	],
	execute: async ({ interaction, args }) => {
		const subCommandName = args.getSubcommand();
		const guildId = interaction.guild.id;

		if (subCommandName === 'new') {
			const launchProjectLink = sprintf(LINK.LAUNCH_PROJECT, guildId);

			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Let's BUIDL!🤩")
						.setDescription(
							`🚀Click [here](${launchProjectLink}) to launch a new project`
						)
				],
				ephemeral: true
			});
		}

		if (subCommandName === 'project') {
			const projectId = args.getString('project_name');

			if (!validProject(projectId, guildId))
				return interaction.reply({
					content: 'Sorry, we cannot find information of this project.',
					ephemeral: true
				});

			await interaction.deferReply({ ephemeral: true });
			const { result, error } = await findProject({
				fields: { _id: projectId }
			});

			if (error)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						subCommandName: subCommandName,
						errorMessage: error
					})
				});

			const projectName = result.findProject.title ?? 'Unknown Project';
			const projectLink = sprintf(LINK.PROJECT_TWEET, projectId);
			const championMember = interaction.guild.members.cache.get(
				result.findProject.champion._id
			);
			// let championName: string;

			// if (!championMember)
			// 	championName = result.findProject.champion.discordName ?? 'Unknown Champion';
			// else championName = `<@${championMember.id}>`;
			const projectEmbed = new MessageEmbed()
				.setTitle(`@${projectName}`)
				.setDescription(
					sprintf(
						'💪**Champion**: %s\n\n✅**Status**: %s\n\n👨‍👩‍👧‍👦 **Open Roles**: %d\n\n🔗 Click [here](%s) to see more activity',
						championMember,
						'@NEW | @RUNNING',
						result.findProject.role.length,
						projectLink
					)
				);

			return interaction.followUp({
				content: `Here's key info for @${projectName}`,
				embeds: [projectEmbed]
			});
		}
	}
});
