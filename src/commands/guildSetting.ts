import {
	EmbedFieldData,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	TextChannel
} from 'discord.js';
import { getApp } from 'firebase/app';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { sprintf } from 'sprintf-js';
import { Command } from '../structures/Command';
import { GuildInform, GuildInformCache, PermissionName, readGuildInform } from '../types/Cache';
import { myCache } from '../utils/cache';
import { COMMAND_CONTENTS } from '../utils/const';
import { checkChannelPermission, isValidWalletAddr } from '../utils/util';

export default new Command({
	name: 'guild',
	description: 'Guild Configuration',
	options: [
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'set',
			description: 'Set in the Discord',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'channel',
					description: 'Set channels in the Discord Server',
					options: [
						{
							type: 'CHANNEL',
							name: 'txcheck',
							description:
								'Set a TxCheck Channel, where members can check transaction status',
							channelTypes: ['GUILD_TEXT']
						},
						{
							type: 'CHANNEL',
							name: 'support',
							description:
								'Set a Support Channel, where members can get support from your team',
							channelTypes: ['GUILD_TEXT']
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'read',
					description: 'Read current configuration'
				}
			]
		},
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'add',
			description: 'Admin setting in the Discord Server',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'admin_role',
					description: 'Admin role setting',
					options: [
						{
							type: 'ROLE',
							name: 'role',
							description: 'choose an role',
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'admin_member',
					description: 'Admin member setting',
					options: [
						{
							type: 'USER',
							name: 'member',
							description: 'choose a user',
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'admin_command',
					description: 'Admin command setting',
					options: [
						{
							type: 'STRING',
							name: 'command',
							description: 'choose a command',
							required: true,
							choices: [
								{
									name: 'guild',
									value: 'guild'
								},
								{
									name: 'ping',
									value: 'ping'
								}
							]
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'proxy_contract',
					description: 'Proxy contract setting',
					options: [
						{
							type: 'STRING',
							name: 'address',
							description: 'Your contract address',
							required: true
						}
					]
				}
			]
		},
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'remove',
			description: 'Remove setting in the Discord Server',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'admin_role',
					description: 'Remove admin role setting',
					options: [
						{
							type: 'STRING',
							name: 'role',
							description: 'choose an role',
							autocomplete: true,
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'admin_member',
					description: 'Remove admin member setting',
					options: [
						{
							type: 'STRING',
							name: 'member',
							description: 'choose a user',
							autocomplete: true,
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'admin_command',
					description: 'Admin command setting',
					options: [
						{
							type: 'STRING',
							name: 'command',
							description: 'choose a command',
							autocomplete: true,
							required: true
						}
					]
				},
				{
					type: 'SUB_COMMAND',
					name: 'proxy_contract',
					description: 'Remove current proxy contract',
					options: [
						{
							type: 'STRING',
							name: 'address',
							description: "Choose the address you'd like to remove",
							autocomplete: true,
							required: true
						}
					]
				}
			]
		}
	],

	execute: async ({ interaction, args }) => {
		const subCommandGroupName = args.getSubcommandGroup();
		const subCommandName = args.getSubcommand();
		const { id: guildId, name: guildName } = interaction.guild;
		if (subCommandGroupName === 'set') {
			if (subCommandName === 'read') {
				const fields: EmbedFieldData[] = readGuildInform(myCache.get('Guilds')[guildId]);
				const profileEmbed = new MessageEmbed()
					.setTitle(`${guildName} Setting`)
					.addFields(fields);
				return interaction.reply({
					embeds: [profileEmbed],
					ephemeral: true
				});
			}

			if (subCommandName === 'channel') {
				const channelOptions = args.data[0].options[0].options;
				if (channelOptions.length === 0)
					return interaction.reply({
						content: 'Sorry, you have to choose at least one options.',
						ephemeral: true
					});
				await interaction.deferReply({ ephemeral: true });
				let cachedGuildInform: GuildInform = myCache.get('Guilds')[guildId];
				const successReplyArray: Array<string> = [];
				const failReplyArray: Array<string> = [];
				const botId = interaction.guild.me.id;
				for (const option of channelOptions) {
					const { name: channelOptionName, value: channelId } = option;
					const targetChannel = option.channel as TextChannel;
					if (!checkChannelPermission(targetChannel, botId)) {
						failReplyArray.push(
							sprintf(COMMAND_CONTENTS.CHANNEL_SETTING_FAIL_REPLY, {
								setChannelName: channelOptionName,
								targetChannelId: channelId,
								reason: 'missing view channel and/or send message permission'
							})
						);
						continue;
					}
					if (channelOptionName === 'txcheck') {
						targetChannel.send({
							content:
								'**Click the button to check your transaction status.** Transaction results from the bot are **only VIEWABLE by you** (and no one else).',
							components: [
								new MessageActionRow().addComponents([
									new MessageButton()
										.setCustomId('txstatus')
										.setLabel('Check your transaction status')
										.setEmoji('💰')
										.setStyle('PRIMARY'),
									new MessageButton()
										.setCustomId('txstatushelp')
										.setLabel('How to use')
										.setEmoji('❓')
										.setStyle('SECONDARY')
								])
							]
						});
					}
					successReplyArray.push(
						sprintf(COMMAND_CONTENTS.CHANNEL_SETTING_SUCCESS_REPLY, {
							setChannelName: channelOptionName,
							targetChannelId: channelId
						})
					);
					if (channelId !== cachedGuildInform.channel[channelOptionName])
						cachedGuildInform.channel[channelOptionName] = channelId;
				}
				if (successReplyArray.length !== 0) {
					await updateDoc(doc(getFirestore(getApp()), 'Guilds', guildId), {
						...cachedGuildInform.channel
					});

					myCache.set('Guilds', {
						...(myCache.get('Guilds') as GuildInformCache),
						[guildId]: cachedGuildInform
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
		}

		if (subCommandGroupName === 'add') {
			let guildCache: GuildInform = myCache.get('Guilds')[guildId];
			const { adminRole, adminCommand, adminMember }: Record<PermissionName, string[]> =
				guildCache['permission'];
			const guildRef = doc(getFirestore(getApp()), 'Guilds', guildId);
			if (subCommandName === 'admin_role') {
				const { id: roleId, name: roleName } = args.getRole('role');
				if (adminRole.includes(roleId)) {
					return interaction.reply({
						content: `\`${roleName}\` has been set an admin role.`,
						ephemeral: true
					});
				}
				await interaction.deferReply({ ephemeral: true });
				guildCache.permission.adminRole = [...adminRole, roleId];
				await updateDoc(guildRef, {
					adminRole: [...adminRole, roleId]
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});
				return interaction.followUp({
					content: `\`${roleName}\` has been set an admin role.`,
					ephemeral: true
				});
			}

			if (subCommandName === 'admin_member') {
				const { id: userId, username } = args.getUser('member');
				if (adminMember.includes(userId)) {
					return interaction.reply({
						content: `\`${username}\` has been set an admin member.`,
						ephemeral: true
					});
				}
				guildCache.permission.adminMember = [...adminMember, userId];
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					adminMember: [...adminMember, userId]
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});
				return interaction.followUp({
					content: `\`${username}\` has been set an admin member.`,
					ephemeral: true
				});
			}
			if (subCommandName === 'admin_command') {
				const commandName = args.getString('command');
				if (adminCommand.includes(commandName)) {
					return interaction.reply({
						content: `\`${commandName}\` has been set an admin command.`,
						ephemeral: true
					});
				}
				guildCache.permission.adminCommand = [...adminCommand, commandName];
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					adminCommand: [...adminCommand, commandName]
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});
				return interaction.followUp({
					content: `\`${commandName}\` has been set an admin command.`,
					ephemeral: true
				});
			}

			if (subCommandName === 'proxy_contract') {
				const contractAddr = args.getString('address');
				if (!isValidWalletAddr(contractAddr))
					return interaction.reply({
						content: 'Contract you input is invalid.',
						ephemeral: true
					});
				if (guildCache.proxyContract.includes(contractAddr))
					return interaction.reply({
						content: `\`${contractAddr}\` has successfully been added into the API.`,
						ephemeral: true
					});
				await interaction.deferReply({ ephemeral: true });
				guildCache.proxyContract.push(contractAddr);
				await updateDoc(guildRef, {
					proxyContract: guildCache.proxyContract
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});

				return interaction.followUp({
					content: `\`${contractAddr}\` has successfully been added into the API.`,
					ephemeral: true
				});
			}
		}

		if (subCommandGroupName === 'remove') {
			let guildCache: GuildInform = myCache.get('Guilds')[guildId];
			const guildRef = doc(getFirestore(getApp()), 'Guilds', guildId);
			const { adminRole, adminCommand, adminMember }: Record<PermissionName, string[]> =
				guildCache['permission'];
			if (subCommandName === 'admin_role') {
				const removeRoleId = args.getString('role');
				const filteredAdminRoleId = adminRole.filter((value) => value !== removeRoleId);
				if (filteredAdminRoleId.length === adminRole.length)
					return interaction.reply({
						content: 'Role input is invalid.',
						ephemeral: true
					});
				const targetRole = interaction.guild.roles.cache.get(removeRoleId);
				let roleName: string;
				if (targetRole) roleName = targetRole.name;
				else roleName = 'Unknown Role';
				guildCache.permission.adminRole = filteredAdminRoleId;
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					adminRole: filteredAdminRoleId
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});

				return interaction.followUp({
					content: `${roleName} has been removed.`,
					ephemeral: true
				});
			}

			if (subCommandName === 'admin_member') {
				const removeMemberId = args.getString('member');
				const filteredAdminMemberId = adminMember.filter(
					(value) => value !== removeMemberId
				);
				if (filteredAdminMemberId.length === adminMember.length)
					return interaction.reply({
						content: 'Member you input is invalid.',
						ephemeral: true
					});
				const member = interaction.guild.members.cache.get(removeMemberId);
				let memberName: string;
				if (member) memberName = member.displayName;
				else memberName = 'Unknown Member';
				guildCache.permission.adminMember = filteredAdminMemberId;
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					adminMember: filteredAdminMemberId
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});

				return interaction.followUp({
					content: `\`${memberName}\` has been removed.`,
					ephemeral: true
				});
			}
			if (subCommandName === 'admin_command') {
				const removeCommand = args.getString('command');
				const filteredAdminCommandName = adminCommand.filter(
					(value) => value !== removeCommand
				);
				if (filteredAdminCommandName.length === adminCommand.length)
					return interaction.reply({
						content: 'Command you input is invalid.',
						ephemeral: true
					});
				guildCache.permission.adminCommand = filteredAdminCommandName;
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					adminCommand: filteredAdminCommandName
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});

				return interaction.followUp({
					content: `\`${removeCommand}\` has been removed.`,
					ephemeral: true
				});
			}

			if (subCommandName === 'proxy_contract') {
				const removedContractAddr = args.getString('address');
				const filteredContractAddr = guildCache.proxyContract.filter(
					(value) => value !== removedContractAddr
				);
				if (filteredContractAddr.length === guildCache.proxyContract.length)
					return interaction.reply({
						content: 'Contract address you input is invalid.',
						ephemeral: true
					});

				guildCache.proxyContract = filteredContractAddr;
				await interaction.deferReply({ ephemeral: true });
				await updateDoc(guildRef, {
					proxyContract: filteredContractAddr
				});
				myCache.set('Guilds', {
					...(myCache.get('Guilds') as GuildInformCache),
					[guildId]: guildCache
				});

				return interaction.followUp({
					content: `\`${removedContractAddr}\` has been removed.`,
					ephemeral: true
				});
			}
		}
	}
});
