import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ComponentType,
	ForumChannel,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ThreadAutoArchiveDuration,
	UserSelectMenuBuilder
} from 'discord.js';

import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { GardenInform } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import { NUMBER } from '../utils/const';
import { awaitWrap, checkForumPermission, validGarden } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Garden,
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
		const [projectId, teamId, roleId, autoArchiveDuration, tokenAmount] = [
			args.getString('project'),
			args.getString('team'),
			args.getString('role'),
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
		await interaction.deferReply({ ephemeral: true });
		const expire = Math.floor(new Date().getTime() / 1000) + NUMBER.USER_SELECT_IN_SEC;
		const replyMsg = await interaction.followUp({
			content: `Please select at least one user you would like to mention. This component will expire <t:${expire}:R>`,
			components: [
				new ActionRowBuilder<UserSelectMenuBuilder>().addComponents([
					new UserSelectMenuBuilder()
						.setCustomId('user_collection')
						.setPlaceholder('Please choose at least one user from the list')
						.setMinValues(1)
						.setMaxValues(25)
				])
			],
			fetchReply: true,
			ephemeral: true
		});

		const collector = replyMsg.createMessageComponentCollector({
			componentType: ComponentType.UserSelect,
			time: NUMBER.USER_SELECT_IN_SEC * 1000,
			max: 1
		});

		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				await interaction.editReply({
					content: `Sorry, timeout! Please run </garden:${interaction.commandId}> again.`,
					components: []
				});
			} else {
				const userSelectInteraction = collected.first();
				const selectedUserIds = userSelectInteraction.users.map((user) => user.id);

				if (!selectedUserIds.includes(interaction.user.id)) {
					selectedUserIds.push(interaction.user.id);
				}
				const mentionUserContent = selectedUserIds.map((id) => `<@${id}>`).toString();

				await interaction.editReply({
					content: `Thanks for using garden command. Users to be mentioned: \n${mentionUserContent}\nPlease fill in the form to set up your garden update.`,
					components: []
				});
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
					memberIds: selectedUserIds,
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

				return userSelectInteraction.showModal(gardenModal);
			}
		});
	}
});
