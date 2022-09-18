import { GuildTextBasedChannel, Permissions, TextChannel, VoiceBasedChannel } from 'discord.js';
import { sprintf } from 'sprintf-js';
import { MemberInform, SkillInform } from '../types/Cache';
import { myCache } from './cache';
import { ERROR_REPLY, NUMBER } from './const';
import { TimeOutError } from './error';
import _ from 'lodash';
interface awaitWrapType<T> {
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

export function checkChannelPermission(
	channel: GuildTextBasedChannel | VoiceBasedChannel,
	userId: string
) {
	return channel
		.permissionsFor(userId)
		.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]);
}

export function validMember(userId: string, guildId: string): MemberInform | null {
	const result = myCache.myGet('Members')[userId];
	if (!result) return null;
	return result.serverId.includes(guildId) ? result : null;
}

export function validSkill(skillId: string): SkillInform | null {
	return myCache.myGet('Skills')[skillId] ?? null;
}

export function validProject(projectId: string, guildId: string) {
	const result = myCache.myGet('Projects')[guildId];
	if (!result) return null;
	return result[projectId] ? true : false;
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
