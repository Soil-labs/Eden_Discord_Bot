import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import { findMember } from '../graph/query/findMember.query';
import { recommendProjectsToMember } from '../graph/query/findProjects_RecommendedToUser.query';
import { Command } from '../structures/Command';
import { CommandNameEmun } from '../types/Command';
import { CONTENT, EMBED_COLOR, LINK, NUMBER } from '../utils/const';
import { getErrorReply, validMember, validSkill } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Find,
	description: 'Find matches for a person with similar skillsets',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Find projects that match your profile',
			name: 'project'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Find member profiles in the community',
			name: 'person',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					description: 'Pick up your fren',
					name: 'fren',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Find members with a particular set of skills',
			name: 'skill',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'Choose a skill',
					name: 'skill_1',
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.String,
					description: 'Choose a skill',
					name: 'skill_2',
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.String,
					description: 'Choose a skill',
					name: 'skill_3',
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.String,
					description: 'Choose a skill',
					name: 'skill_4',
					autocomplete: true
				}
			]
		}
	],
	execute: async ({ interaction, args }) => {
		const subCommandName = args.getSubcommand();
		const guildId = interaction.guild.id;

		if (subCommandName === 'project') {
			await interaction.deferReply({ ephemeral: true });

			const { result: matchResult, error } = await recommendProjectsToMember({
				fields: {
					memberID: interaction.user.id,
					serverID: [guildId]
				}
			});

			if (error)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: error,
						subCommandName: subCommandName
					})
				});

			const fieldContents = matchResult.findProjects_RecommendedToUser
				.sort((first, second) => {
					return second.matchPercentage - first.matchPercentage;
				})
				.slice(0, NUMBER.MATCH_NUMBER)
				.reduce(
					(pre, match) => {
						pre.matchField += sprintf('%d%%\n', match.matchPercentage);
						pre.projectField += `${match.projectData.title}\n`;
						const skillNames = match.role.skills
							.slice(0, NUMBER.DISPLAY_SKILL_NUMBER)
							.map((value) => `${value.skillData.name} `)
							.toString();

						pre.skillField += sprintf('%s: %s', match.role.title, skillNames);
						return pre;
					},
					{
						matchField: '',
						projectField: '',
						skillField: ''
					}
				);
			let embedDescription: string;
			const fields = [];
			// todo contents for non-matching

			if (!fieldContents.matchField) {
				embedDescription = sprintf(CONTENT.MATCH_PROJECT, LINK.PROJECT_ALL);
			} else {
				embedDescription = sprintf(CONTENT.MATCH_PROJECT, LINK.PROJECT_ALL);
				fields.push(
					{
						name: 'Match 🤝',
						value: fieldContents.matchField,
						inline: true
					},
					{
						name: 'Project 🌳',
						value: fieldContents.projectField,
						inline: true
					},
					{
						name: 'Skill 🛠️',
						value: fieldContents.skillField,
						inline: true
					}
				);
			}
			const authorName = `@${interaction.user.username} - Project Matching Results`;

			return interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Projects handpicked for you from Eden🪄')
						.setDescription(embedDescription)
						.setAuthor({ name: authorName, iconURL: interaction.user.avatarURL() })
						.setColor(EMBED_COLOR)
						.addFields(fields)
				]
			});
		}

		if (subCommandName === 'person') {
			const frenUser = args.getUser('fren');

			if (frenUser.bot)
				return interaction.reply({
					content: 'Sorry, you cannot choose a bot.',
					ephemeral: true
				});

			const member = validMember(frenUser.id, guildId);

			if (!member)
				return interaction.reply({
					content: 'Sorry, we cannot find information of this user.',
					ephemeral: true
				});

			await interaction.deferReply({ ephemeral: true });
			const { result: userDetail, error } = await findMember({
				fields: {
					_id: frenUser.id
				}
			});

			if (error)
				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						errorMessage: error,
						subCommandName: subCommandName
					})
				});

			const userEmbed = new EmbedBuilder()
				.setTitle(sprintf('@%s - Personal Tagline', frenUser.username))
				.setThumbnail(frenUser.avatarURL());

			const skillNames = userDetail.findMember.skills
				.map((value) =>
					value.skillInfo.name ? `${value.skillInfo.name}` : 'Unknown skill name '
				)
				.slice(0, NUMBER.DISPLAY_SKILL_NUMBER);
			let topSkills: string;

			if (skillNames.length === 0) topSkills = 'No skill';
			else topSkills = skillNames.toString();

			const projects = userDetail.findMember.projects
				.map((value) =>
					value.info.title ? `${value.info.title}` : 'Unknown project name '
				)
				.slice(0, NUMBER.DISPLAY_SKILL_NUMBER);
			let projectNames: string;

			if (projects.length === 0) projectNames = 'No project';
			else projectNames = projects.toString();

			userEmbed.setDescription(
				sprintf(
					"🛠**Skills**: %s\n\n🗓️**Availability**: %f h/week\n\n🌳**Projects**: %s\n\n🔗Click [here](%s) to see <@%s>'s profile",
					topSkills,
					userDetail.findMember.hoursPerWeek ?? 0,
					projectNames,
					'https://eden-alpha-develop.vercel.app/test/user',
					frenUser.id
				)
			);

			return interaction.followUp({
				embeds: [userEmbed]
			});
		}

		if (subCommandName === 'skill') {
			const skills = _.uniq(
				[
					args.getString('skill_1'),
					args.getString('skill_2'),
					args.getString('skill_3'),
					args.getString('skill_4')
				].filter((value) => validSkill(value))
			);

			if (skills.length === 0)
				return interaction.reply({
					content: 'Please choose at least one valid option',
					ephemeral: true
				});

			return interaction.reply({
				content: 'Work in progress, wait for update from backend.',
				ephemeral: true
			});

			// await interaction.deferReply({
			// 	ephemeral: true
			// });

			// const { result: matchResult, error } = await matchMemberToSkills({
			// 	fields: {
			// 		serverID: [guildId],
			// 		skillsID: skills
			// 	}
			// });

			// if (error)
			// 	return interaction.followUp({
			// 		content: sprintf(ERROR_REPLY.GRAPHQL, {
			// 			action: `${interaction.commandName} ${subCommandName}`,
			// 			errorMessage: `\`${error}\``
			// 		})
			// 	});

			// if (matchResult.matchMembersToSkills.length === 0)
			// 	return interaction.followUp({
			// 		content: 'Sorry, I cannot find a member with these skills'
			// 	});

			// // todo shall we exclude myself now?
			// const fieldContents = matchResult.matchMembersToSkills
			// 	.filter((skill) => skill.member._id !== interaction.user.id)
			// 	.sort((first, second) => {
			// 		return second.matchPercentage.totalPercentage - first.matchPercentage.totalPercentage;
			// 	})
			// 	.slice(0, NUMBER.DISPLAY_SKILL_NUMBER)
			// 	.reduce(
			// 		(pre, skill) => {
			// 			const memberInGuild = interaction.guild.members.cache.get(skill.member._id);

			// 			pre.nameField +=
			// 				(memberInGuild ? `<@${skill.member._id}>` : skill.member.discordName) +
			// 				'\n';
			// 			pre.matchField +=
			// 				(memberInGuild
			// 					? sprintf(
			// 							'[%d%%](%s)',
			// 							skill.matchPercentage,
			// 							sprintf(LINK.USER, skill.member._id)
			// 					  )
			// 					: sprintf('%d%%', skill.matchPercentage)) + `\n`;
			// 			const topSkill = skill.commonSkills
			// 				.map((value) => value.name + ' ')
			// 				.splice(0, NUMBER.DISPLAY_COMMON_SKILL_NUMBER);
			// 			// todo how to handle no common skill? I mean contents

			// 			pre.skillField +=
			// 				(topSkill.length ? topSkill.toString() : 'No common skill') + '\n';

			// 			return pre;
			// 		},
			// 		{
			// 			matchField: '',
			// 			nameField: '',
			// 			skillField: ''
			// 		}
			// 	);
			// const fields: Array<EmbedFieldData> = [];

			// if (fieldContents.matchField) {
			// 	fields.push(
			// 		{
			// 			name: 'Match 🤝',
			// 			value: fieldContents.matchField,
			// 			inline: true
			// 		},
			// 		{
			// 			name: 'Member 🧙',
			// 			value: fieldContents.nameField,
			// 			inline: true
			// 		},
			// 		{
			// 			name: 'Skill 🛠️',
			// 			value: fieldContents.skillField,
			// 			inline: true
			// 		}
			// 	);
			// }

			// const authorName = `@${interaction.user.username} - Skill Matching Results`;
			// const avatarURL = interaction.user.avatarURL();
			// const userId = interaction.user.id;

			// return interaction.followUp({
			// 	embeds: [
			// 		new EmbedBuilder()
			// 			.setTitle('All the people with your requested skills')
			// 			.setAuthor({
			// 				name: authorName,
			// 				iconURL: avatarURL,
			// 				url: sprintf(LINK.USER, userId)
			// 			})
			// 			.setColor(EMBED_COLOR)
			// 			.addFields(fields)
			// 	]
			// });
		}
	}
});
