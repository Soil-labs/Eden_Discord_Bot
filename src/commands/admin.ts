import { MessageEmbed } from 'discord.js';
import { updateServer } from '../graph/mutation/updateServer.mutation';
import { Command } from '../structures/Command';
import { GuildInform, MemberId, readGuildInform } from '../types/Cache';
import { myCache } from '../structures/Cache';
import { COMMADN_CHOICES } from '../utils/const';
import { getErrorReply } from '../utils/util';

export default new Command({
	name: 'admin',
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
			type: 'SUB_COMMAND_GROUP',
			name: 'set',
			description: 'Set a serie of channels',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'birthday',
					description: 'Set up a birthday channel to send celebration',
					options: [
						{
							type: 'CHANNEL',
							name: 'channel',
							description: 'Choose a channel',
							required: true,
							channelTypes: ['GUILD_TEXT']
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'garden',
					description: 'Set up a garden channel to sync project progress',
					options: [
						{
							type: 'CHANNEL',
							name: 'channel',
							description: 'Choose a channel',
							required: true,
							channelTypes: ['GUILD_TEXT']
						}
					]
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
						.addFields(readGuildInform(guildInform))
				],
				ephemeral: true
			});
		}

		const commandGroupName = args.getSubcommandGroup();
		const { adminRole, adminCommand, adminMember } = guildInform;
		let toBeCached: GuildInform;
		let successReply: string;

		if (commandGroupName === 'memeber') {
			let toBeCachedAdminMember: Array<MemberId>;
			if (subCommandName === 'add') {
				const member = args.getUser('member');
				if (adminMember.includes(member.id))
					return interaction.reply({
						content: `\`${member.username}\` has been added to the admin group`,
						ephemeral: true
					});
				toBeCachedAdminMember = [...adminMember, member.id];
				successReply = `\`${member.username}\` has been added to the admin group`;
			} else {
				const memberId = args.getString('member');
				if (!adminMember.includes(memberId))
					return interaction.reply({
						content: 'Please check your input, the member you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminMember = adminMember.filter((value) => value !== memberId);
				const memberObj = interaction.guild.members.cache.get(memberId);
				successReply = `\`${memberObj?.displayName}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminMember: toBeCachedAdminMember
			};
		}

		if (commandGroupName === 'role') {
			let toBeCachedAdminRole: Array<string>;
			if (subCommandName === 'add') {
				const role = args.getRole('role');
				if (adminRole.includes(role.id))
					return interaction.reply({
						content: `\`${role.name}\` has been added to the admin group`,
						ephemeral: true
					});
				toBeCachedAdminRole = [...adminRole, role.id];
				successReply = `\`${role.name}\` has been added to the admin group`;
			} else {
				const roleId = args.getString('role');
				if (!adminRole.includes(roleId))
					return interaction.reply({
						content: 'Please check your input, the role you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminRole = adminRole.filter((value) => value !== roleId);
				const roleObj = interaction.guild.roles.cache.get(roleId);
				successReply = `\`${roleObj?.name}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminRole: toBeCachedAdminRole
			};
		}

		if (commandGroupName === 'command') {
			const commandName = args.getString('command');
			let toBeCachedAdminCommands;
			if (subCommandName === 'add') {
				if (adminCommand.includes(commandName))
					return interaction.reply({
						content: `\`${commandName}\` has been added to the admin group`,
						ephemeral: true
					});
				toBeCachedAdminCommands = [...adminCommand, commandName];
				successReply = `\`${commandName}\` has been added to the admin group`;
			} else {
				if (!adminCommand.includes(commandName))
					return interaction.reply({
						content:
							'Please check your input, the command you chose is not in the list',
						ephemeral: true
					});
				toBeCachedAdminCommands = adminCommand.filter((value) => value !== commandName);
				successReply = `\`${commandName}\` has been removed from the admin group`;
			}
			toBeCached = {
				...guildInform,
				adminCommand: toBeCachedAdminCommands
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
