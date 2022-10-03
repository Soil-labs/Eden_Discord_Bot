import { GuildTextBasedChannel, Permissions, VoiceBasedChannel } from 'discord.js';
import { sprintf } from 'sprintf-js';
import {
	GuildId,
	MemberId,
	MemberInform,
	ProjectId,
	RoleId,
	SkillId,
	SkillInform,
	TeamId
} from '../types/Cache';
import { myCache } from '../structures/Cache';
import { ERROR_REPLY, NUMBER } from './const';
import { TimeOutError } from './error';
import _ from 'lodash';
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
	if (channel.type === 'GUILD_VOICE') {
		if (!channel.permissionsFor(userId).has([Permissions.FLAGS.CONNECT])) {
			return 'Missing **CONNECT** access.';
		}
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.VIEW_CHANNEL])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.SEND_MESSAGES])) {
		return 'Missing **SEND MESSAGES** access.';
	}
	return false;
}

export function checkOnboardPermission(channel: VoiceBasedChannel, userId: string) {
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.CONNECT])) {
		return 'Missing **CONNECT** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.VIEW_CHANNEL])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.SEND_MESSAGES])) {
		return 'Missing **SEND MESSAGES** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.READ_MESSAGE_HISTORY])) {
		return 'Missing **READ MESSAGE HISTORY** access.';
	}
	return false;
}

export function checkGardenChannelPermission(
	channel: GuildTextBasedChannel | VoiceBasedChannel,
	userId: string
) {
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.VIEW_CHANNEL])) {
		return 'Missing **VIEW CHANNEL** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.SEND_MESSAGES])) {
		return 'Missing **SEND MESSAGES** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.CREATE_PUBLIC_THREADS])) {
		return 'Missing **CREATE PUBLIC THREADS** access.';
	}
	if (!channel.permissionsFor(userId).has([Permissions.FLAGS.MANAGE_THREADS])) {
		return 'Missing **MANAGE THREADS** access.';
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
) {
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
		generalChannelId: team.generalChannelId,
		roleName: role.roleName
	};
}

export function getErrorReply(errorInform: {
	commandName: string;
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
	let hours = Math.floor(minutes / 60);

	seconds = seconds % 60;
	minutes = minutes % 60;

	return `${_padTo2Digits(hours)}:${_padTo2Digits(minutes)}:${_padTo2Digits(seconds)}`;
}

export function getNextBirthday(month: number, day: number, offset: number) {
	const date = new Date();
	const thisYear = new Date().getUTCFullYear();
	const machineTimezonBirthday = new Date(`${thisYear}-${month}-${day}`).getTime();
	let utcBirthday = machineTimezonBirthday + date.getTimezoneOffset() * 60000;
	let offsetBirthday = utcBirthday - 3600000 * offset;
	if (date.getTime() > machineTimezonBirthday) {
		utcBirthday =
			new Date(`${thisYear + 1}-${month}-${day}`).getTime() +
			date.getTimezoneOffset() * 60000;
		offsetBirthday = utcBirthday - 3600000 * offset;
	}
	return Math.floor(offsetBirthday / 1000);
}
