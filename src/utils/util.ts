import { Permissions, TextChannel } from 'discord.js';
import { myCache } from './cache';
import { NUMBER } from './const';
import { TimeOutError } from './error';

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

export function checkChannelPermission(channel: TextChannel, userId: string) {
	return channel
		.permissionsFor(userId)
		.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]);
}

export function validMember(userId: string, guildId: string) {
	const result = myCache.myGet('Members')[userId];
	if (!result) return null;
	return result.serverId.includes(guildId) ? result : null;
}

export function validSkill(skillId: string) {
	return myCache.myGet('Skills')[skillId] ?? null;
}

export function validProject(projectId: string, guildId: string) {
	const result = myCache.myGet('Projects')[guildId];
	if (!result) return null;
	return result[projectId] ?? null;
}
