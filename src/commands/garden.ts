import {
	MessageActionRow,
	Modal,
	TextChannel,
	TextInputComponent,
	ThreadAutoArchiveDuration
} from 'discord.js';

import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { GardenInform } from '../types/Cache';
import { awaitWrap, checkGardenChannelPermission, validGarden } from '../utils/util';

export default new Command({
	name: 'garden',
	description: 'Report your project milestone.',
	options: [
		{
			type: 'STRING',
			description: 'Choose a project from the list',
			required: true,
			autocomplete: true,
			name: 'project'
		},
		{
			type: 'STRING',
			description: 'Choose a team from the list',
			required: true,
			autocomplete: true,
			name: 'team'
		},
		{
			type: 'STRING',
			description: 'Choose a role from the list',
			required: true,
			autocomplete: true,
			name: 'role'
		},
		{
			type: 'STRING',
			description: "Members you'd like to add",
			required: true,
			name: 'member'
		},
		{
			type: 'STRING',
			description: 'How long will this thread exist before being archived',
			name: 'archive_duration',
			choices: [
				{
					name: '3 days',
					value: '4320'
				},
				{
					name: '7 days',
					value: '10080'
				}
			]
		},
		{
			type: 'NUMBER',
			description: "Input the amount of token you'd like to send",
			name: 'token_amount'
		}
	],
	execute: async ({ interaction, args }) => {
		const guildId = interaction.guild.id;
		const userId = interaction.user.id;
		const [projectId, teamId, roleId, membersString, autoArchiveDuration, tokenAmount] = [
			args.getString('project'),
			args.getString('team'),
			args.getString('role'),
			args.getString('member').match(/<@!?[0-9]*?>/g),
			args.getString('archive_duration'),
			args.getInteger('token_amount')
		];

		const validResult = validGarden(guildId, projectId, teamId, roleId);

		if (typeof validResult === 'string')
			return interaction.reply({
				content: validResult,
				ephemeral: true
			});

		if (!membersString)
			return interaction.reply({
				content: 'Please input at least one member in this guild',
				ephemeral: true
			});

		const { roleName, projectTitle, teamName, categoryChannelId, generalChannelId } =
			validResult;

		let generalChannel = interaction.guild.channels.cache.get(generalChannelId) as TextChannel;

		if (!generalChannel) {
			const { result, error } = await awaitWrap(
				interaction.guild.channels.fetch(generalChannelId)
			);

			if (error)
				return interaction.reply({
					content: `Sorry, the general channel for ${teamName} is unfetchable.`,
					ephemeral: true
				});
			generalChannel = result as TextChannel;
		}
		const permissinChecking = checkGardenChannelPermission(
			generalChannel,
			interaction.guild.me.id
		);

		if (permissinChecking)
			return interaction.reply({
				content: permissinChecking,
				ephemeral: true
			});

		if (tokenAmount !== null && tokenAmount < 1)
			return interaction.reply({
				content: 'Token amount should be larger than 1',
				ephemeral: true
			});

		const members = membersString
			.map((value) => {
				let duplicate = value;

				if (duplicate.startsWith('<@') && duplicate.endsWith('>')) {
					duplicate = duplicate.slice(2, -1);

					if (duplicate.startsWith('!')) {
						duplicate = duplicate.slice(1);
					}
					const member = interaction.guild.members.cache.get(duplicate);

					if (member) {
						if (member.user.bot) return null;
						else return member.id;
					} else return null;
				}
				return null;
			})
			.filter((value) => value);

		if (members.length === 0)
			return interaction.reply({
				content: 'You need to input at least one member in this guid.',
				ephemeral: true
			});

		const gardenModal = new Modal()
			.setCustomId('update')
			.setTitle(`Share news to the secret garden!`);

		gardenModal.addComponents(
			new MessageActionRow<TextInputComponent>().addComponents(
				new TextInputComponent()
					.setCustomId('garden_title')
					.setRequired(true)
					.setPlaceholder('Enter title here')
					.setLabel('GARDERN TITLE')
					.setStyle('SHORT')
			),
			new MessageActionRow<TextInputComponent>().addComponents(
				new TextInputComponent()
					.setCustomId('garden_content')
					.setRequired(true)
					.setPlaceholder('Enter content here')
					.setLabel('GARDERN CONTENT')
					.setStyle('PARAGRAPH')
			)
		);
		const userCache: GardenInform = {
			categoryChannelId: categoryChannelId,
			generalChannelId: generalChannelId,
			projectId: projectId,
			projectTitle: projectTitle,
			memberIds: members,
			teamIds: [teamId],
			teamName: teamName,
			roleIds: [roleId],
			roleName: roleName,
			autoArchiveDuration: null,
			tokenAmount: null
		};

		if (autoArchiveDuration)
			userCache.autoArchiveDuration = Number(
				autoArchiveDuration
			) as ThreadAutoArchiveDuration;
		if (tokenAmount) userCache.tokenAmount = tokenAmount;

		myCache.mySet('GardenContext', {
			...myCache.myGet('GardenContext'),
			[`${guildId}_${userId}`]: userCache
		});

		// todo showModal is a reply
		await interaction.showModal(gardenModal);
		return await interaction.followUp({
			content: 'Please fill in the form to continue',
			ephemeral: true
		});
	}
});
