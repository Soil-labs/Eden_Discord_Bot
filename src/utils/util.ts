import { Permissions, TextBasedChannel, TextChannel } from 'discord.js';

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

// export async function awaitWrapWithTimeout<T>(
// 	promise: Promise<T>,
// 	ms = NUMBER.AWAIT_TIMEOUT
// ): Promise<awaitWrapType<T>> {
// 	const timeout = new Promise<never>((_, reject) => {
// 		setTimeout(() => {
// 			reject(new Error('Time Out'));
// 		}, ms);
// 	});
// 	return Promise.race([promise, timeout])
// 		.then((data) => {
// 			return {
// 				result: data,
// 				error: null
// 			};
// 		})
// 		.catch((error) => {
// 			return {
// 				result: null,
// 				error: error
// 			};
// 		});
// }

export function checkChannelPermission(channel: TextChannel, userId: string){
	return channel.permissionsFor(userId).has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES])
}