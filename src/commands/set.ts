import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	EmbedBuilder,
	TextChannel
} from 'discord.js';
import { getApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { sprintf } from 'sprintf-js';

import { updateServer } from '../graph/mutation/updateServer.mutation';
import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { GuildInform, GuildSettingInform, MemberId } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import {
	COMMADN_CHOICES,
	CONTENT,
	FirestoneChannelOptionName,
	FirestoneChanneOptionNameToDbPropery,
	GraphQLChannelOptionName,
	GraphQLChanneOptionNameToDbPropery
} from '../utils/const';
import { checkTextChannelPermission, getErrorReply, readGuildInform } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Set,
	description: 'Set Eden',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'role',
			description: 'Moderate admin role',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'add',
					description: 'Add an admin role',
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							name: 'role',
							description: 'Choose the role as an admin one',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'remove',
					description: 'Remove an admin role',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'role',
							description: "Choose the role you'd like to remove from the whitelist",
							required: true,
							autocomplete: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'member',
			description: 'Moderate admin member',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'add',
					description: 'Add an admin member',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'member',
							description: 'Choose a member',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'remove',
					description: 'Remove an admin member',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'member',
							description:
								"Choose the member you'd like to remove from the whitelist",
							required: true,
							autocomplete: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'command',
			description: 'Moderate admin command',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'add',
					description: 'Add an admin command',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'command',
							description: 'Choose the command as an admin one',
							required: true,
							choices: COMMADN_CHOICES
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'remove',
					description: 'Remove an admin command',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'command',
							description:
								"Choose the command you'd like to remove from the whitelist",
							required: true,
							autocomplete: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'channel',
			description: 'Set up different channels',
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: FirestoneChannelOptionName.Birthday,
					description: 'Choose a text channel for birthday notification.',
					channelTypes: [ChannelType.GuildText]
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: FirestoneChannelOptionName.GardenForward,
					description:
						'Choose a text channel, where people receive the latest news from Garden.',
					channelTypes: [ChannelType.GuildForum]
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: GraphQLChannelOptionName.Chat,
					description:
						'Choose a channel for talent discussion, where champions talk with .',
					channelTypes: [ChannelType.GuildText]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'read',
			description: 'Read current settings'
		}
	],
	execute: async ({ interaction, args }) => {
		const subCommandName = args.getSubcommand();
		const guildId = interaction.guild.id;

		if (!myCache.myHas('Servers') || !myCache.myGet('Servers')[guildId])
			return interaction.reply({
				content: 'Cannot find server admin information, please contact admin.',
				ephemeral: true
			});
		const guildInform = myCache.myGet('Servers')[guildId];

		if (subCommandName === 'read') {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${interaction.guild.name} Dashboard`)
						.addFields(readGuildInform(guildInform, guildId))
				],
				ephemeral: true
			});
		}

		if (subCommandName === 'channel') {
			const channelOptions = args.data[0].options;

			if (channelOptions.length === 0) {
				return interaction.reply({
					content: 'Sorry, you have to choose at least one options.',
					ephemeral: true
				});
			}
			await interaction.deferReply({ ephemeral: true });
			const failReplyArray: Array<string> = [];
			const successReplyArray: Array<string> = [];
			const botId = interaction.guild.members.me.id;

			const firestoneTobeUpdated: GuildSettingInform =
				myCache.myGet('GuildSettings')[guildId];
			let firestoneTobeUpdatedFlag = false;
			const graphqlTobeUpdated = myCache.myGet('Servers')[guildId];
			let graphqlTobeUpdatedFlag = false;

			for (const option of channelOptions) {
				const { name: channelOptionName } = option;
				const targetChannel = option.channel as TextChannel;
				const { id: channelId } = targetChannel;
				const permissinChecking = checkTextChannelPermission(targetChannel, botId);

				if (permissinChecking) {
					failReplyArray.push(
						sprintf(CONTENT.CHANNEL_SETTING_FAIL_REPLY, {
							targetChannelId: channelId,
							setChannelName: 'birthday',
							reason: permissinChecking
						})
					);
					continue;
				}
				const firestoenProperty = FirestoneChanneOptionNameToDbPropery[channelOptionName];
				const graphqlProperty = GraphQLChanneOptionNameToDbPropery[channelOptionName];

				if (firestoenProperty) {
					firestoneTobeUpdated[firestoenProperty] = channelId;
					firestoneTobeUpdatedFlag = true;
				} else {
					graphqlTobeUpdated[graphqlProperty] = channelId;
					graphqlTobeUpdatedFlag = true;
				}

				successReplyArray.push(
					sprintf(CONTENT.CHANNEL_SETTING_SUCCESS_REPLY, {
						targetChannelId: channelId,
						setChannelName: targetChannel.name
					})
				);
			}

			if (firestoneTobeUpdatedFlag) {
				const db = getFirestore(getApp());

				await setDoc(doc(db, 'Guilds', guildId), firestoneTobeUpdated, { merge: true });
				myCache.mySet('GuildSettings', {
					...myCache.myGet('GuildSettings'),
					[guildId]: firestoneTobeUpdated
				});
			}
			if (graphqlTobeUpdatedFlag) {
				const { error } = await updateServer({
					fields: {
						_id: guildId,
						...graphqlTobeUpdated
					}
				});

				if (error) {
					return interaction.followUp({
						content: getErrorReply({
							commandName: interaction.commandName,
							subCommandName: subCommandName,
							errorMessage: error
						})
					});
				}
				myCache.mySet('Servers', {
					...myCache.myGet('Servers'),
					[guildId]: graphqlTobeUpdated
				});
			}

			const successReply = successReplyArray.reduce((pre, cur) => {
				return pre + cur + '\n';
			}, '');
			const failReply = failReplyArray.reduce((pre, cur) => {
				return pre + cur + '\n';
			}, '');

			return interaction.followUp({
				content: successReply + failReply
			});
		}

		const commandGroupName = args.getSubcommandGroup();
		const { adminID, adminCommands, adminRoles } = guildInform;
		let toBeCached: GuildInform;
		let successReply: string;

		if (commandGroupName === 'member') {
			let toBeCachedAdminMember: Array<MemberId>;

			if (subCommandName === 'add') {
				const member = args.getUser('member');

				if (member.bot)
					return interaction.reply({
						content: 'Sorry, you cannot choose a bot.',
						ephemeral: true
					});
				if (adminID.includes(member.id))
					return interaction.reply({
						content: `\`${member.username}\` has been added to the admin group`,
						ephemeral: true
					});
				toBeCachedAdminMember = [...adminID, member.id];
				successReply = `\`${member.username}\` has been added to the admin group`;
			} else {
				const memberId = args.getString('member');

				if (!adminID.includes(memberId))
					return interaction.reply({
						content: 'Please check your input, the member you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminMember = adminID.filter((value) => value !== memberId);
				const memberObj = interaction.guild.members.cache.get(memberId);

				successReply = `\`${memberObj?.displayName}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminID: toBeCachedAdminMember
			};
		}

		if (commandGroupName === 'role') {
			let toBeCachedAdminRole: Array<string>;

			if (subCommandName === 'add') {
				const role = args.getRole('role');

				if (adminRoles.includes(role.id))
					return interaction.reply({
						content: `\`${role.name}\` has been added to the admin group`,
						ephemeral: true
					});
				toBeCachedAdminRole = [...adminRoles, role.id];
				successReply = `\`${role.name}\` has been added to the admin group`;
			} else {
				const roleId = args.getString('role');

				if (!adminRoles.includes(roleId))
					return interaction.reply({
						content: 'Please check your input, the role you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminRole = adminRoles.filter((value) => value !== roleId);
				const roleObj = interaction.guild.roles.cache.get(roleId);

				successReply = `\`${roleObj?.name}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminRoles: toBeCachedAdminRole
			};
		}

		if (commandGroupName === 'command') {
			const commandName = args.getString('command');
			let toBeCachedAdminCommands: Array<string>;

			if (subCommandName === 'add') {
				if (adminCommands.includes(commandName))
					return interaction.reply({
						content: `\`${commandName}\` has been added to the admin group`,
						ephemeral: true
					});
				if (adminID.length === 0 && adminRoles.length === 0) {
					return interaction.reply({
						content:
							'Sorry, you cannot add this command to admin command group without setting `admin member` or `admin role`',
						ephemeral: true
					});
				}
				toBeCachedAdminCommands = [...adminCommands, commandName];
				successReply = `\`${commandName}\` has been added to the admin group`;
			} else {
				if (!adminCommands.includes(commandName))
					return interaction.reply({
						content:
							'Please check your input, the command you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminCommands = adminCommands.filter((value) => value !== commandName);
				successReply = `\`${commandName}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminCommands: toBeCachedAdminCommands
			};
		}

		await interaction.deferReply({ ephemeral: true });

		const { error } = await updateServer({
			fields: {
				...toBeCached,
				_id: guildId,
				name: interaction.guild.name
			}
		});

		if (error) {
			return interaction.followUp({
				content: getErrorReply({
					commandName: interaction.commandName,
					subCommandName: subCommandName,
					errorMessage: error
				})
			});
		}

		myCache.mySet('Servers', {
			...myCache.myGet('Servers'),
			[guildId]: toBeCached
		});

		return interaction.followUp({
			content: successReply
		});
	}
});
