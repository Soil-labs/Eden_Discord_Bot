import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	VoiceChannel,
	VoiceState
} from 'discord.js';
import { sprintf } from 'sprintf-js';
import { addNewMember } from '../graph/mutation/addNewMember.mutation';
import { findRoom } from '../graph/query/findRoom.query';
import { Event } from '../structures/Event';
import { myCache } from '../structures/Cache';
import { LINK, NUMBER } from '../utils/const';
import { logger } from '../utils/logger';
import {
	awaitWrap,
	convertMsToTime,
	updateMemberCache,
	validMember
} from '../utils/util';

export default new Event('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
	if (newState.member.user.bot) return;
	if (!myCache.myHas('VoiceContexts')) return;
	try {
		const guildId = oldState.guild.id;
		const contexts = myCache.myGet('VoiceContexts');
		const guildVoiceContext = contexts[guildId];
		if (!guildVoiceContext || !guildVoiceContext.channelId) return;

		const onboardingChannelId = guildVoiceContext.channelId;

		if (
			oldState?.channel?.id !== onboardingChannelId &&
			newState?.channel?.id === onboardingChannelId
		) {
			const { messageId, timestamp, attendees, hostId, roomId } = guildVoiceContext;
			const newMemberId = newState.member.id;
			if (attendees.includes(newMemberId)) return;

			if (!validMember(newMemberId, guildId)) {
				const [result, graphQLError] = await addNewMember({
					fields: {
						_id: newMemberId,
						discordName: newState.member.displayName,
						discriminator: newState.member.user.discriminator,
						discordAvatar: newState.member.user.avatarURL(),
						invitedBy: hostId,
						serverID: guildId
					}
				});
				// todo handle the case that the user fail to be onboarded
				if (result) {
					updateMemberCache({
						userId: newMemberId,
						name: newState.member.user.username,
						guildId: guildId
					});
				}
			}

			const voiceChannel = newState.channel as VoiceChannel;
			// todo find a way to resume or some method to handle deleted message, fetch from audio log? maybe

            // todo possibility of that someone changed the permission when onboard is going on
			// if (!checkOnboardPermission(voiceChannel, newState.guild.me.id))
			// 	return logger.warn(
			// 		`Cannot fectch message in ${voiceChannel.name} when voiceStateUpdate`
			// 	);

			const dashboardMsg = await voiceChannel.messages.fetch(messageId);

			let embeds = dashboardMsg.embeds;

			const difference = new Date().getTime() - timestamp * 1000;
			// description limit: 4096
			embeds[0].description += sprintf(
				'\n`%s` <@%s> joined this onboarding call.',
				convertMsToTime(difference),
				newState.member.id
			);

			myCache.mySet('VoiceContexts', {
				...contexts,
				[guildId]: {
					...guildVoiceContext,
					attendees: [...attendees, newMemberId]
				}
			});
			dashboardMsg.edit({
				embeds: embeds,
				components: dashboardMsg.components
			});

			if (Math.floor(difference / 1000) >= NUMBER.ONBOARD_REPEAT_CONTEXT) {
				const roomLink = sprintf(LINK.ROOM, {
					roomId: roomId
				});
				const deleteInMin =
					Math.floor(new Date().getTime() / 1000) + Number(NUMBER.ONBOARD_AUTO_DELETE);
				const msg = await voiceChannel.send({
					content: `Welcome, <@${newMemberId}>`,
					embeds: [
						new MessageEmbed()
							.setTitle('Join the Party🎊')
							.setDescription(
								sprintf(
									"Hey! I'm an Eden 🌳 bot helping <@%s> with this onboarding call! Click [here](<%s>) to claim a ticket and join the onboarding Party Page! Please note that this meesage will be deleted <t:%s:R>",
									hostId,
									roomLink,
									deleteInMin
								)
							)
					],
					components: [
						new MessageActionRow().addComponents([
							new MessageButton()
								.setStyle('LINK')
								.setURL(roomLink)
								.setLabel('Get Party Ticket')
								.setEmoji('🎟️')
						])
					]
				});
				setTimeout(async () => {
					if (msg.deletable) {
						msg.delete();
					}
					const [result, error] = await findRoom({
						fields: {
							_id: roomId
						}
					});
					if (error) return;
					const filtered = result.findRoom.members.filter(
						(value) => value._id === newMemberId
					);
					if (filtered.length === 0) {
						const dmChannel = await newState.member.createDM();
						return awaitWrap(
							dmChannel.send({
								embeds: [
									new MessageEmbed()
										.setTitle('Join the Party🎊')
										.setDescription(
											sprintf(
												"Hey! I'm an Eden 🌳 bot helping <@%s> with this onboarding call! Click [here](<%s>) to claim a ticket and join the onboarding Party Page!",
												hostId,
												roomLink
											)
										)
								],
								components: [
									new MessageActionRow().addComponents([
										new MessageButton()
											.setStyle('LINK')
											.setURL(roomLink)
											.setLabel('Get Party Ticket')
											.setEmoji('🎟️')
									])
								]
							})
						);
					}
				}, Number(NUMBER.ONBOARD_AUTO_DELETE) * 1000);
			}
			return;
		} else return;
	} catch (error) {
		logger.error(
			`User: ${newState?.member?.displayName} Guild: ${newState?.guild?.name} Error: ${error?.name} occurs when voiceStateUpdate. Msg: ${error?.message} Stack: ${error?.stack}`
		);
	}
});
