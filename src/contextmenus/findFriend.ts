import { MessageEmbed } from 'discord.js';
import { sprintf } from 'sprintf-js';
import { findMember } from '../graph/query/findMember.query';
import { ContextMenu } from '../structures/ContextMenu';
import { LINK, NUMBER } from '../utils/const';
import { getErrorReply, validMember } from '../utils/util';

export default new ContextMenu({
	type: 'USER',
	name: 'Read my profile',
	execute: async ({ interaction }) => {
		const frenUser = interaction.guild.members.cache.get(interaction.targetId);
		const guildId = interaction.guild.id;
		if (!frenUser)
			return interaction.reply({
				content: 'Sorry, we cannot fetch you in this guild.',
				ephemeral: true
			});

		if (frenUser.user.bot)
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
		const [userDetail, error] = await findMember({
			fields: {
				_id: frenUser.id
			}
		});

		if (error)
			return interaction.followUp({
				content: getErrorReply({
					commandName: interaction.commandName,
					errorMessage: error
				})
			});

		console.log(frenUser.avatarURL());
		const userEmbed = new MessageEmbed()
			.setTitle(sprintf('@%s - Personal Tagline', frenUser.displayName))
			.setThumbnail(frenUser.user.avatarURL());

		const skillNames = userDetail.findMember.skills
			.map((value) =>
				value.skillInfo.name ? `${value.skillInfo.name}` : 'Unknown skill name '
			)
			.slice(0, NUMBER.DISPLAY_SKILL_NUMBER);
		let topSkills: string;
		if (skillNames.length === 0) topSkills = 'No skill';
		else topSkills = skillNames.toString();

		const projects = userDetail.findMember.projects
			.map((value) => (value.info.title ? `${value.info.title}` : 'Unknown project name '))
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
				sprintf(LINK.USER, frenUser.id),
				frenUser.id
			)
		);

		return interaction.followUp({
			embeds: [userEmbed]
		});
	}
});
