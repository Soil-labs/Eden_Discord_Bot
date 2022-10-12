import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { updateServer } from '../graph/mutation/updateServer.mutation';
import { Command } from '../structures/Command';
import { GuildInform, MemberId, readGuildInform } from '../types/Cache';
import { myCache } from '../structures/Cache';
import { COMMADN_CHOICES, CONTENT } from '../utils/const';
import { checkTextChannelPermission, getErrorReply } from '../utils/util';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { sprintf } from 'sprintf-js';

export default new Command({
	name: 'set',
	description: 'Set Eden',
	options: [
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'role',
			description: 'Moderate admin role',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'add',
					description: 'Add an admin role',
					options: [
						{
							type: 'ROLE',
							name: 'role',
							description: 'Choose the role as an admin one',
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'remove',
					description: 'Remove an admin role',
					options: [
						{
							type: 'STRING',
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
			type: 'SUB_COMMAND_GROUP',
			name: 'member',
			description: 'Moderate admin member',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'add',
					description: 'Add an admin member',
					options: [
						{
							type: 'USER',
							name: 'member',
							description: 'Choose a member',
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'remove',
					description: 'Remove an admin member',
					options: [
						{
							type: 'STRING',
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
			type: 'SUB_COMMAND_GROUP',
			name: 'command',
			description: 'Moderate admin command',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'add',
					description: 'Add an admin command',
					options: [
						{
							type: 'STRING',
							name: 'command',
							description: 'Choose the command as an admin one',
							required: true,
							choices: COMMADN_CHOICES
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'remove',
					description: 'Remove an admin command',
					options: [
						{
							type: 'STRING',
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
			type: 'SUB_COMMAND',
			name: 'channel',
			description: 'Set up different channels',
			options: [
				{
					type: 'CHANNEL',
					name: 'birthday',
					description: 'Choose a text channel for birthday notification.',
					channelTypes: ['GUILD_TEXT']
				},
				{
					type: 'CHANNEL',
					name: 'forward_garden',
					description:
						'Choose a text channel, where people receive the latest news from Garden.',
					channelTypes: ['GUILD_TEXT']
				}
			]
		},
		{
			type: 'SUB_COMMAND',
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
					new MessageEmbed()
						.setTitle(`${interaction.guild.name} Dashboard`)
						.addFields(readGuildInform(guildInform, guildId))
				],
				ephemeral: true
			});
		}

		if (subCommandName === 'channel') {
			// todo follow discord-partner-bot implementation and remove duplication
			const birthdayChannel = args.getChannel('birthday') as GuildTextBasedChannel;
			const forwardCahnnel = args.getChannel('forward_garden') as GuildTextBasedChannel;

			if (!birthdayChannel && !forwardCahnnel) {
				return interaction.reply({
					content: 'You have to choose at least one channel option.',
					ephemeral: true
				});
			}

			const db = getFirestore(getApp());

			if (birthdayChannel) {
				const birthdayChannelPermissionCheck = checkTextChannelPermission(
					birthdayChannel,
					interaction.guild.me.id
				);
				if (birthdayChannelPermissionCheck) {
					return interaction.reply({
						content: sprintf(CONTENT.CHANNEL_SETTING_FAIL_REPLY, {
							targetChannelId: birthdayChannel.id,
							setChannelName: 'birthday',
							reason: birthdayChannelPermissionCheck
						}),
						ephemeral: true
					});
				}

				if (
					myCache.myGet('GuildSettings')?.[guildId]?.birthdayChannelId ===
					birthdayChannel.id
				) {
					return interaction.reply({
						content: sprintf(CONTENT.CHANNEL_SETTING_SUCCESS_REPLY, {
							targetChannelId: birthdayChannel.id,
							setChannelName: 'birthday'
						}),
						ephemeral: true
					});
				}

				await interaction.deferReply({ ephemeral: true });
				await setDoc(
					doc(db, 'Guilds', guildId),
					{
						birthdayChannelId: birthdayChannel.id
					},
					{
						merge: true
					}
				);

				myCache.mySet('GuildSettings', {
					...myCache.myGet('GuildSettings'),
					[guildId]: {
						birthdayChannelId: birthdayChannel.id,
						forwardChannelId:
							myCache.myGet('GuildSettings')?.[guildId]?.forwardChannelId
					}
				});

				return interaction.followUp({
					content: sprintf(CONTENT.CHANNEL_SETTING_SUCCESS_REPLY, {
						targetChannelId: birthdayChannel.id,
						setChannelName: 'birthday'
					})
				});
			}

			if (forwardCahnnel) {
				const forwardChannelPermissionCheck = checkTextChannelPermission(
					forwardCahnnel,
					interaction.guild.me.id
				);

				if (forwardChannelPermissionCheck) {
					return interaction.reply({
						content: sprintf(CONTENT.CHANNEL_SETTING_FAIL_REPLY, {
							targetChannelId: forwardCahnnel.id,
							setChannelName: 'forward_garden',
							reason: forwardChannelPermissionCheck
						}),
						ephemeral: true
					});
				}

				if (
					myCache.myGet('GuildSettings')?.[guildId]?.forwardChannelId ===
					forwardCahnnel.id
				) {
					return interaction.reply({
						content: sprintf(CONTENT.CHANNEL_SETTING_SUCCESS_REPLY, {
							targetChannelId: forwardCahnnel.id,
							setChannelName: 'forward_garden'
						}),
						ephemeral: true
					});
				}

				await interaction.deferReply({ ephemeral: true });
				await setDoc(
					doc(db, 'Guilds', guildId),
					{
						forwardChannelId: forwardCahnnel.id
					},
					{
						merge: true
					}
				);

				myCache.mySet('GuildSettings', {
					...myCache.myGet('GuildSettings'),
					[guildId]: {
						forwardChannelId: forwardCahnnel.id,
						birthdayChannelId:
							myCache.myGet('GuildSettings')?.[guildId]?.birthdayChannelId
					}
				});

				return interaction.followUp({
					content: sprintf(CONTENT.CHANNEL_SETTING_SUCCESS_REPLY, {
						targetChannelId: forwardCahnnel.id,
						setChannelName: 'forward_garden'
					})
				});
			}
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

		const [result, error] = await updateServer({
			fields: {
				...toBeCached,
				_id: guildId,
				name: interaction.guild.name
			}
		});

		if (error)
			return interaction.followUp({
				content: getErrorReply({
					commandName: interaction.commandName,
					subCommandName: subCommandName,
					errorMessage: error
				})
			});

		myCache.mySet('Servers', {
			...myCache.myGet('Servers'),
			[guildId]: toBeCached
		});

		return interaction.followUp({
			content: successReply
		});
	}
});
