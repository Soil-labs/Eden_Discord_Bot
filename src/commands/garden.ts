import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ForumChannel,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ThreadAutoArchiveDuration
} from 'discord.js';

import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { GardenInform } from '../types/Cache';
import { awaitWrap, checkForumPermission, validGarden } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: 'garden',
	description: 'Report your project milestone.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			description: 'Choose a project from the list',
			required: true,
			autocomplete: true,
			name: 'project'
		},
		{
			type: ApplicationCommandOptionType.String,
			description: 'Choose a team from the list',
			required: true,
			autocomplete: true,
			name: 'team'
		},
		{
			type: ApplicationCommandOptionType.String,
			description: 'Choose a role from the list',
			required: true,
			autocomplete: true,
			name: 'role'
		},
		{
			type: ApplicationCommandOptionType.String,
			description: "Members you'd like to add",
			required: true,
			name: 'member'
		},
		{
			type: ApplicationCommandOptionType.String,
			description: 'How long will this thread exist before being archived',
			name: 'archive_duration',
			choices: [
				{
					name: '1 days',
					value: ThreadAutoArchiveDuration.OneDay.toString()
				},
				{
					name: '7 days',
					value: ThreadAutoArchiveDuration.OneWeek.toString()
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Number,
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

		if (typeof validResult === 'string') {
			return interaction.reply({
				content: validResult,
				ephemeral: true
			});
		}
		if (!membersString) {
			return interaction.reply({
				content: 'Please input at least one member in this guild',
				ephemeral: true
			});
		}

		const { roleName, projectTitle, teamName, categoryChannelId, forumChannelId } = validResult;

		let forumChannel = interaction.guild.channels.cache.get(forumChannelId) as ForumChannel;

		if (!forumChannel) {
			const { result, error } = await awaitWrap(
				interaction.guild.channels.fetch(forumChannelId)
			);

			if (error)
				return interaction.reply({
					content: `Sorry, the general channel for ${teamName} is unfetchable.`,
					ephemeral: true
				});
			forumChannel = result as ForumChannel;
		}
		const permissinChecking = checkForumPermission(
			forumChannel,
			interaction.guild.members.me.id
		);

		if (permissinChecking) {
			return interaction.reply({
				content: permissinChecking,
				ephemeral: true
			});
		}
		const tagId = forumChannel.availableTags.filter((tag) => tag.name === roleName)?.[0]?.id;

		if (!tagId) {
			return interaction.reply({
				content: `Sorry, I cannot find the right tag in <#${forumChannelId}>. Please inform our admin.`,
				ephemeral: true
			});
		}

		if (tokenAmount !== null && tokenAmount < 1) {
			return interaction.reply({
				content: 'Token amount should be larger than 1',
				ephemeral: true
			});
		}

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

		if (members.length === 0) {
			return interaction.reply({
				content: 'You need to input at least one member in this guid.',
				ephemeral: true
			});
		}

		const gardenModal = new ModalBuilder()
			.setCustomId('update')
			.setTitle(`Share news to the secret garden!`);

		gardenModal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId('garden_title')
					.setRequired(true)
					.setPlaceholder('Enter title here')
					.setLabel('GARDERN TITLE')
					.setStyle(TextInputStyle.Short)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId('garden_content')
					.setRequired(true)
					.setPlaceholder('Enter content here')
					.setLabel('GARDERN CONTENT')
					.setStyle(TextInputStyle.Paragraph)
			)
		);
		const userCache: GardenInform = {
			categoryChannelId: categoryChannelId,
			forumChannelId: forumChannelId,
			projectId: projectId,
			projectTitle: projectTitle,
			memberIds: members,
			teamIds: [teamId],
			teamName: teamName,
			roleIds: [roleId],
			roleName: roleName,
			tagId: tagId,
			autoArchiveDuration: null,
			tokenAmount: null
		};

		if (autoArchiveDuration) {
			userCache.autoArchiveDuration = Number(
				autoArchiveDuration
			) as ThreadAutoArchiveDuration;
		} else {
			userCache.autoArchiveDuration = ThreadAutoArchiveDuration.ThreeDays;
		}
		if (tokenAmount) userCache.tokenAmount = tokenAmount;

		myCache.mySet('GardenContext', {
			...myCache.myGet('GardenContext'),
			[`${guildId}_${userId}`]: userCache
		});

		await interaction.showModal(gardenModal);
		return await interaction.followUp({
			content: 'Please fill in the form to continue',
			ephemeral: true
		});
	}
});
