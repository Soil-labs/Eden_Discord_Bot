import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { updateServer } from '../graph/mutation/updateServer.mutation';
import { Command } from '../structures/Command';
import { GuildInform, MemberId, readGuildInform } from '../types/Cache';
import { myCache } from '../structures/Cache';
import { COMMADN_CHOICES } from '../utils/const';
import { checkTextChannelPermission, getErrorReply } from '../utils/util';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

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
					required: true,
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
						.setTitle(`${interaction.guild.name} Permission Dashboard`)
						.addFields(readGuildInform(guildInform, guildId))
				],
				ephemeral: true
			});
		}

		if (subCommandName === 'channel') {
			const targetChannel = args.getChannel('birthday') as GuildTextBasedChannel;

			const permissionCheck = checkTextChannelPermission(
				targetChannel,
				interaction.guild.me.id
			);
			if (permissionCheck)
				return interaction.reply({
					content: permissionCheck,
					ephemeral: true
				});

			if (!myCache.myHas('GuildSettings')) {
				return interaction.reply({
					content: 'Command is initing, please try again later.',
					ephemeral: true
				});
			}
			if (
				myCache.myGet('GuildSettings')?.[guildId]?.['birthdayChannelId'] ===
				targetChannel.id
			) {
				return interaction.reply({
					content: `<#${targetChannel.id}> has been set as birthday channel successfully.`,
					ephemeral: true
				});
			}
			await interaction.deferReply({ ephemeral: true });
			const db = getFirestore(getApp());
			await setDoc(doc(db, 'Guilds', guildId), {
				birthdayChannelId: targetChannel.id
			});

			myCache.mySet('GuildSettings', {
				...myCache.myGet('GuildSettings'),
				[guildId]: {
					birthdayChannelId: targetChannel.id
				}
			});

			return interaction.followUp({
				content: `<#${targetChannel.id}> has been set as birthday channel successfully.`
			});
		}

		const commandGroupName = args.getSubcommandGroup();
		const { adminID, adminCommands, adminRoles } = guildInform;
		let toBeCached: GuildInform;
		let successReply: string;

		if (commandGroupName === 'memeber') {
			let toBeCachedAdminMember: Array<MemberId>;
			if (subCommandName === 'add') {
				const member = args.getUser('member');
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
				if (adminID.length ===0 && adminRoles.length ===0){
					return interaction.reply({
						content: "Sorry, you cannot add this command to admin command group without setting \`admin member\` or \`admin role\`",
						ephemeral: true
					})
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
