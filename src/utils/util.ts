import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
	ChannelType,
	EmbedField,
	ForumChannel,
	GuildTextBasedChannel,
	PermissionFlagsBits,
	VoiceBasedChannel
} from 'discord.js';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import { myCache } from '../structures/Cache';
import {
	GardenInform,
	GuildId,
	GuildInform,
	GuildInformCache,
	MemberId,
	MemberInform,
	ProjectId,
	RoleId,
	SkillId,
	SkillInform,
	TeamId,
	templateGuildInform
} from '../types/Cache';
import { CommandNameEmun } from '../types/Command';
import { ContextMenuNameEnum } from '../types/ContextMenu';
import { ERROR_REPLY, NUMBER } from './const';
import { TimeOutError } from './error';

export interface awaitWrapType<T> {
	result: T | null;
	error: any | null;
}

export async function awaitWrap<T>(promise: Promise<T>): Promise<awaitWrapType<T>> {
	return promise
		.then((data) => {
			return {
				result: data,
				error: null
			};
		})
		.catch((error) => {
			return {
				result: null,
				error: error?.message
			};
		});
}

export async function awaitWrapWithTimeout<T>(
	promise: Promise<T>,
	ms = NUMBER.AWAIT_TIMEOUT
): Promise<awaitWrapType<T>> {
	const timeout = new Promise<never>((_, reject) => {
		setTimeout(() => {
			reject(new TimeOutError());
		}, ms);
	});

	return Promise.race([promise, timeout])
		.then((data) => {
			return {
				result: data,
				error: null
			};
		})
		.catch((error) => {
			return {
				result: null,
				error: error
			};
		});
}

export function checkTextChannelPermission(channel: GuildTextBasedChannel, userId: string) {
	if (channel.type === ChannelType.GuildVoice) {
		if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.Connect])) {
			return 'Missing **CONNECT** access.';
		}
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ViewChannel])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.SendMessages])) {
		return 'Missing **SEND MESSAGES** access.';
	}
	return false;
}

export function checkOnboardPermission(channel: VoiceBasedChannel, userId: string) {
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.Connect])) {
		return 'Missing **CONNECT** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ViewChannel])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.SendMessages])) {
		return 'Missing **SEND MESSAGES** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ReadMessageHistory])) {
		return 'Missing **READ MESSAGE HISTORY** access.';
	}
	return false;
}

export function checkForumPermission(channel: ForumChannel, userId: string) {
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ViewChannel])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ManageChannels])) {
		return 'Missing **MANAGE CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.SendMessages])) {
		return 'Missing **CREATE POSTS** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.SendMessagesInThreads])) {
		return 'Missing **SEND MESSAGES IN POSTS** access.';
	}
	if (!channel.permissionsFor(userId, true).has([PermissionFlagsBits.ManageThreads])) {
		return 'Missing **MANAGE POSTS** access.';
	}
	return false;
}

export function validMember(userId: MemberId, guildId: GuildId): MemberInform | null {
	const result = myCache.myGet('Members')[userId];

	if (!result) return null;
	return result.serverId.includes(guildId) ? result : null;
}

export function validSkill(skillId: SkillId): SkillInform | null {
	return myCache.myGet('Skills')[skillId] ?? null;
}

export function validProject(projectId: ProjectId, guildId: GuildId) {
	const result = myCache.myGet('Projects')[guildId];

	if (!result) return null;
	return result[projectId] ?? null;
}

export function validTeam(teamId: TeamId, guidId: GuildId) {
	const result = myCache.myGet('Teams')[guidId];

	if (!result) return null;
	return result[teamId] ?? null;
}

export function validRole(roleId: RoleId, guidId: GuildId) {
	const result = myCache.myGet('Roles')[guidId];

	if (!result) return null;
	return result[roleId] ?? null;
}

export function validGarden(
	guildId: GuildId,
	projectId: ProjectId,
	teamId: TeamId,
	roleId: RoleId
):
	| string
	| Pick<
			GardenInform,
			'projectTitle' | 'teamName' | 'categoryChannelId' | 'forumChannelId' | 'roleName'
	  > {
	const result = myCache.myGet('ProjectTeamRole')[guildId];
	const project = result[projectId];

	if (!project) return 'Please choose a valid project.';
	const team = project['teams'][teamId];

	if (!team) return 'Please choose a valid team.';
	const role = team['roles'][roleId];

	if (!role) return 'Please choose a valid role.';
	return {
		projectTitle: project.projectTitle,
		teamName: team.teamName,
		categoryChannelId: team.categoryChannelId,
		forumChannelId: team.forumChannelId,
		roleName: role.roleName
	};
}

export function dateIsValid(month: number, day: number) {
	const thisYear = dayjs().year();

	return dayjs(`${thisYear}-${month}-${day}`, 'YYYY-MM-DD').isValid();
}

export function getErrorReply(errorInform: {
	commandName: CommandNameEmun | ContextMenuNameEnum;
	subCommandName?: string;
	errorMessage: string;
}) {
	const { commandName, subCommandName, errorMessage } = errorInform;

	if (subCommandName) {
		return sprintf(ERROR_REPLY.GRAPHQL, {
			action: `${commandName} ${subCommandName}`,
			errorMessage: `\`${errorMessage}\``
		});
	} else {
		return sprintf(ERROR_REPLY.GRAPHQL, {
			action: `${commandName}`,
			errorMessage: `\`${errorMessage}\``
		});
	}
}

export function updateMemberCache(memberInform: { userId: string; name: string; guildId: string }) {
	const { userId, name, guildId } = memberInform;
	const cached = myCache.myGet('Members');
	const currentServers = cached[userId]?.serverId ?? [];

	myCache.mySet('Members', {
		...cached,
		[userId]: {
			discordName: name,
			serverId: _.uniq([...currentServers, guildId])
		}
	});
}

export function updateMembersCache(
	membersInform: Array<{ userId: string; name: string }>,
	guildId: string
) {
	let toBecached = {};
	const cached = myCache.myGet('Members');

	membersInform.forEach((memberInform) => {
		const { userId, name } = memberInform;
		const currenServers = cached[userId]?.serverId ?? [];

		toBecached = {
			...toBecached,
			[userId]: {
				discordName: name,
				serverId: _.uniq([...currenServers, guildId])
			}
		};
	});
	myCache.mySet('Members', {
		...cached,
		...toBecached
	});
}

function _padTo2Digits(num: number) {
	return num.toString().padStart(2, '0');
}

export function convertMsToTime(milliseconds: number) {
	let seconds = Math.floor(milliseconds / 1000);
	let minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	seconds = seconds % 60;
	minutes = minutes % 60;

	return `${_padTo2Digits(hours)}:${_padTo2Digits(minutes)}:${_padTo2Digits(seconds)}`;
}

export function getNextBirthday(month: number, day: number, offset: string) {
	dayjs.extend(utc);
	dayjs.extend(timezone);

	const thisYear = dayjs().year();
	let birthday = dayjs.tz(`${thisYear}-${month}-${day}`, 'YYYY-MM-DD', offset).unix();

	const current = dayjs().tz(offset).valueOf();

	if (current > birthday) {
		const nextYear = thisYear + 1;

		birthday = dayjs.tz(`${nextYear}-${month}-${day}`, 'YYYY-MM-DD', offset).unix();
	}

	return birthday;
}

export function readGuildInform(guildInform: GuildInform, guildId: GuildId): EmbedField[] {
	const adminInform = {
		adminRole: '> -',
		adminMember: '> -',
		adminCommand: '> -'
	};

	const { adminCommands, adminID, adminRoles, channelChatID } = guildInform;

	if (adminCommands.length !== 0) {
		adminInform.adminCommand = adminCommands.reduce((pre, cur) => {
			return pre + `> ${cur}\n`;
		}, '');
	}
	if (adminID.length !== 0) {
		adminInform.adminMember = adminID.reduce((pre, cur) => {
			return pre + `> <@${cur}>\n`;
		}, '');
	}
	if (adminRoles.length !== 0) {
		adminInform.adminRole = adminRoles.reduce((pre, cur) => {
			return pre + `> <@&${cur}>\n`;
		}, '');
	}

	let channelInform: {
		name: string;
		value: string;
	} = {
		name: '',
		value: ''
	};

	const GuildSettingInform = myCache.myGet('GuildSettings')[guildId];

	channelInform = Object.keys(GuildSettingInform).reduce((pre, channelName) => {
		pre.name += `> ${channelName.toUpperCase()}\n`;
		const channelId = GuildSettingInform[channelName];

		if (channelId) {
			pre.value += `> <#${channelId}>\n`;
		} else {
			pre.value += `> -\n`;
		}
		return pre;
	}, channelInform);

	if (channelChatID) {
		channelInform.name += `> ${'channelChatID'.toUpperCase()}\n`;
		channelInform.value += `> <#${channelChatID}>\n`;
	}

	return [
		{
			name: 'Admin Role',
			value: adminInform.adminRole,
			inline: true
		},
		{
			name: 'Admin Member',
			value: adminInform.adminMember,
			inline: true
		},
		{
			name: 'Admin Command',
			value: adminInform.adminCommand,
			inline: true
		},
		{
			name: 'Channel Configuration',
			value: channelInform.name,
			inline: true
		},
		{
			name: 'Target Channel',
			value: channelInform.value,
			inline: true
		}
	];
}

export function initGuildInform(guildIds: GuildId[]) {
	return guildIds.reduce((pre: GuildInformCache, cur) => {
		return {
			...pre,
			[cur]: templateGuildInform
		};
	}, {});
}

export function validForumTag(channel: ForumChannel, tagName: string) {
	const tags = channel.availableTags.filter((tag) => tag.name === tagName);

	return tags.length === 0 ? null : tags[0].id;
}
