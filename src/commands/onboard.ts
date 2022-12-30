import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	VoiceChannel
} from 'discord.js';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import { GraphQL_AddNewMemberMutation } from '../graph/gql/result';
import { GraphReturn } from '../graph/graph';
import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { createRoom } from '../graph/mutation/createRoom.mutation';
import { myCache } from '../structures/Cache';
import { Command } from '../structures/Command';
import { VoiceContext } from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import { CONTENT, LINK } from '../utils/const';
import { checkOnboardPermission, getErrorReply, updateMembersCache } from '../utils/util';

export default new Command({
	type: ApplicationCommandType.ChatInput,
	name: CommandNameEmun.Onboard,
	description: 'Find & be found for opportunity',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Onboard multiple new frens into Eden 🌳',
			name: 'member',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: "Member you'd like to onboard",
					required: true,
					name: 'frens'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Automatically onboard members in a voice call',
			name: 'auto',
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					description: 'Onboarding voice channel',
					required: true,
					name: 'channel',
					channelTypes: [ChannelType.GuildVoice]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Set up a channel to self-onboard.',
			name: 'room',
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					description: 'Choose a channel',
					required: true,
					name: 'channel',
					channelTypes: [ChannelType.GuildText]
				}
			]
		}
	],
	execute: async ({ interaction, args }) => {
		const subCommandName = args.getSubcommand();
		const guild = interaction.guild;
		const guildId: string = guild.id;

		if (subCommandName === 'member') {
			const membersString = args.getString('frens').match(/<@!?[0-9]*?>/g);

			if (!membersString)
				return interaction.reply({
					content: 'Please input at least one member in this guild',
					ephemeral: true
				});

			let prefix = '';
			const memberIds = [];
			const updatePromise: Array<Promise<GraphReturn<GraphQL_AddNewMemberMutation>>> = [];
			const toBecached: Array<{
				userId: string;
				name: string;
			}> = [];

			membersString.forEach((value) => {
				let duplicateValue = value;

				if (duplicateValue.startsWith('<@') && duplicateValue.endsWith('>')) {
					duplicateValue = duplicateValue.slice(2, -1);

					if (duplicateValue.startsWith('!')) {
						duplicateValue = duplicateValue.slice(1);
					}

					if (memberIds.includes(duplicateValue)) return;

					const member = guild.members.cache.get(duplicateValue);

					if (member) {
						if (member.user.bot) return;
					} else return;

					memberIds.push(duplicateValue);

					toBecached.push({
						userId: duplicateValue,
						name: member.user.username
					});

					updatePromise.push(
						addNewMember({
							fields: {
								_id: member.id,
								discordName: member.user.username,
								discriminator: member.user.discriminator,
								discordAvatar: member.user.avatarURL(),
								invitedBy: interaction.user.id,
								serverID: guildId
							}
						})
					);
				}
			});

			if (memberIds.length === 0)
				return interaction.reply({
					content: 'You need to input at least one member in this guid.',
					ephemeral: true
				});

			memberIds.forEach((value, index) => {
				if (index === 0) {
					prefix += `?id=${value}`;
				} else {
					prefix += `&id=${value}`;
				}
			});
			await interaction.deferReply({ ephemeral: true });

			const results = await Promise.all(updatePromise);

			if (results.filter((value) => value[1]).length !== 0) {
				const [sampleResult] = results;

				return interaction.followUp({
					content: getErrorReply({
						commandName: interaction.commandName,
						subCommandName: subCommandName,
						errorMessage: sampleResult[1]
					})
				});
			}

			updateMembersCache(toBecached, guildId);
			let embedTitle: string;
			let embedDescription: string;

			if (memberIds.length === 1 && memberIds[0] === interaction.user.id) {
				embedTitle = "Hooray! You're about to join Eden 🌳";
				embedDescription = sprintf(CONTENT.ONBOARD_SELF, {
					onboardLink: LINK.SIGNUP
				});
			} else {
				embedTitle = "You're about to onboard new members 🌳";
				embedDescription = sprintf(CONTENT.GROUP_ONBORAD, {
					onboardLink: sprintf(LINK.STAGING_ONBOARD, prefix)
				});
			}

			return interaction.followUp({
				embeds: [new EmbedBuilder().setTitle(embedTitle).setDescription(embedDescription)]
			});
		}

		if (subCommandName === 'auto') {
			if (!myCache.myGet('VoiceContexts'))
				return interaction.reply({
					content: 'Please try again, auto onboard is initing.',
					ephemeral: true
				});

			const hostId = interaction.user.id;
			const voiceChannel = args.getChannel('channel') as VoiceChannel;
			const selectedMemberIds = Array.from(
				voiceChannel.members.filter((member) => !member.user.bot).keys()
			);

			const contexts = myCache.myGet('VoiceContexts');
			const guildVoiceContext = contexts[guildId] as VoiceContext;
			// Onboarding is going on

			if (guildVoiceContext?.channelId) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('Onboarding Call is going on')
							.setDescription(
								`Sorry, an onboarding call has started in <#${guildVoiceContext.channelId}>, hosted by <@${guildVoiceContext.hostId}>, at <t:${guildVoiceContext.timestamp}:f>.\nPlease wait for its end or cancel it through its dashboard.`
							)
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setLabel('Jump to the Dashboard')
								.setStyle(ButtonStyle.Link)
								.setURL(guildVoiceContext.messageLink)
						])
					],
					ephemeral: true
				});
			}
			const permissionCheck = checkOnboardPermission(voiceChannel, guild.members.me.id);

			if (permissionCheck) {
				return interaction.reply({
					content: `Permission denied: ${permissionCheck}`,
					ephemeral: true
				});
			}

			await interaction.deferReply({ ephemeral: true });
			const { result, error } = await createRoom({
				fields: {
					avatar: guild.iconURL(),
					description: sprintf(CONTENT.ONBOARDING_ROOM_DESCRIPTION, {
						guildName: guild.name,
						hostName: interaction.member.displayName
					}),
					hostID: [hostId],
					name: sprintf(CONTENT.ONBOARDING_ROOM_NAME, {
						guildName: guild.name
					}),
					serverID: guildId
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

			let attendeesDescription = `\`00:00:00\` <@${hostId}> started this onboarding call.\n`;

			for (const memberId of selectedMemberIds) {
				if (memberId !== hostId) {
					attendeesDescription += `\`00:00:00\` <@${memberId}> joined this onboarding call.\n`;
				}
			}

			const timestampSec = Math.floor(new Date().getTime() / 1000);
			const message = await voiceChannel.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: `Onboarding Call Host - ${interaction.user.username}`,
							iconURL: interaction.user.avatarURL()
						})
						.setDescription(
							`**Started**: <t:${timestampSec}:f>(<t:${timestampSec}:R>)\n\n**Attendees**\n${attendeesDescription}`
						)
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('Get Party Ticket')
							.setURL(
								sprintf(LINK.ROOM, {
									roomId: result.createRoom._id
								})
							)
							.setEmoji('🎟️'),
						new ButtonBuilder()
							.setCustomId('end')
							.setStyle(ButtonStyle.Secondary)
							.setLabel('End Party')
					])
				]
			});

			const msgLink = sprintf(LINK.DISCORD_MSG, {
				guildId: guildId,
				channelId: voiceChannel.id,
				messageId: message.id
			});

			myCache.mySet('VoiceContexts', {
				...myCache.myGet('VoiceContexts'),
				[guildId]: {
					messageId: message.id,
					messageLink: msgLink,
					channelId: voiceChannel.id,
					timestamp: timestampSec,
					hostId: hostId,
					attendees: _.uniq([...selectedMemberIds, hostId]),
					roomId: result.createRoom._id,
					isNotified: false
				}
			});

			return interaction.followUp({
				content: `Auto onboarding has started in <#${voiceChannel.id}>`,
				ephemeral: true,
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('Jump to the dashboard')
							.setEmoji('🔗')
							.setURL(msgLink)
					])
				]
			});
		}

		if (subCommandName === 'room') {
			return interaction.reply({
				content: 'WIP',
				ephemeral: true
			});
		}
	}
});
