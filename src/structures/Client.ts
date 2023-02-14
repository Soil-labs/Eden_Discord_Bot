import AsciiTable from 'ascii-table';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputApplicationCommandData,
	Client,
	ClientEvents,
	Collection,
	EmbedBuilder,
	ForumChannel,
	GatewayIntentBits,
	MessageApplicationCommandData,
	TextChannel,
	ThreadAutoArchiveDuration,
	ThreadChannel,
	UserApplicationCommandData,
	VoiceChannel
} from 'discord.js';
import { getApp, initializeApp } from 'firebase/app';
import {
	collection,
	doc,
	DocumentReference,
	getDocs,
	getFirestore,
	Query,
	query,
	writeBatch
} from 'firebase/firestore';
import glob from 'glob';
import { platform } from 'os';
import { sprintf } from 'sprintf-js';
import { promisify } from 'util';

import { GraphQL_UpdateServerMutation } from '../graph/gql/result';
import { GraphReturn } from '../graph/graph';
import { updateServer } from '../graph/mutation/updateServer.mutation';
import { findProjectUpdates } from '../graph/query/findGardens.query';
import { findMembers } from '../graph/query/findMembers.query';
import { findProjects } from '../graph/query/findProjects.query';
import { findServers } from '../graph/query/findServers.query';
import { findSkills } from '../graph/query/findSkills.query';
import { AutoType } from '../types/Auto';
import { ButtonCustomIdEnum, ButtonType } from '../types/Button';
import {
	BirthdayInform,
	CacheType,
	ChatThreadCache,
	GuildSettingCache,
	GuildSettingInform,
	templateGuildInform,
	templateGuildSettingInform,
	VoiceContextCache
} from '../types/Cache';
import { CommandType } from '../types/Command';
import { RegisterCommandsOptions } from '../types/CommandRegister';
import { MessageContextMenuType, UserContextMenuType } from '../types/ContextMenu';
import { ModalType } from '../types/Modal';
import { defaultGuildVoiceContext, FORUM_TAG, LINK, NUMBER } from '../utils/const';
import { logger } from '../utils/logger';
import {
	awaitWrap,
	checkOnboardPermission,
	convertMsToTime,
	getNextBirthday,
	getTagId
} from '../utils/util';
import { myCache } from './Cache';
import { Event } from './Event';

const globPromise = promisify(glob);

export class MyClient extends Client {
	public commands: Collection<
		string,
		CommandType | MessageContextMenuType | UserContextMenuType
	> = new Collection();
	public buttons: Collection<string, ButtonType> = new Collection();
	public modals: Collection<string, ModalType> = new Collection();
	public autos: Collection<string, AutoType> = new Collection();

	private table: any;

	public constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildVoiceStates
			]
		});

		this.table = new AsciiTable('Cache Loading ...');
		this.table.setHeading('Data', 'Status');
	}

	public start() {
		try {
			this._loadFiles();
			this.login(process.env.TOKEN);
		} catch (error) {
			logger.error(error?.message);
		}
	}

	private async _registerCommands({ guildId, commands }: RegisterCommandsOptions) {
		if (guildId) {
			// Register the commands in this guild
			this.guilds.cache.get(guildId)?.commands.set(commands);
			logger.info('Commands are set locally.');
		} else {
			// Register the commands in this application, covering all guilds
			// this.application.commands?.set([]);
			this.application.commands?.set(commands);
			logger.info('Commands are set globally.');
		}
	}

	private async _importFiles(filePath: string) {
		return (await import(filePath))?.default;
	}

	private async _loadFiles() {
		// Load Commands
		const slashCommands: Array<
			| ChatInputApplicationCommandData
			| MessageApplicationCommandData
			| UserApplicationCommandData
		> = [];
		const allowCommands = process.env.PM2_ALLOWCOMMANDS;
		const commandFiles = await globPromise(
			platform() === 'win32'
				? `${__dirname}\\..\\commands\\*{.ts,.js}`
				: `${__dirname}/../commands/*{.ts,.js}`
		);

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this._importFiles(filePath);

			if (!command.name) return;
			if (typeof allowCommands === 'undefined' || !allowCommands) {
				this.commands.set(command.name, command);
				slashCommands.push(command);
				return;
			}
			if (allowCommands.includes(command.name)) {
				this.commands.set(command.name, command);
				slashCommands.push(command);
			}
		});

		const buttonFiles = await globPromise(
			platform() === 'win32'
				? `${__dirname}\\..\\buttons\\*{.ts,.js}`
				: `${__dirname}/../buttons/*{.ts,.js}`
		);

		buttonFiles.forEach(async (filePath) => {
			const button: ButtonType = await this._importFiles(filePath);

			button.customIds.forEach((customId) => {
				this.buttons.set(customId, button);
			});
		});

		const modalFiles = await globPromise(
			platform() === 'win32'
				? `${__dirname}\\..\\modals\\*{.ts,.js}`
				: `${__dirname}/../modals/*{.ts,.js}`
		);

		modalFiles.forEach(async (filePath) => {
			const modal: ModalType = await this._importFiles(filePath);

			this.modals.set(modal.customId, modal);
		});

		const autoFiles = await globPromise(
			platform() === 'win32'
				? `${__dirname}\\..\\autocompletes\\*{.ts,.js}`
				: `${__dirname}/../autocompletes/*{.ts,.js}`
		);

		autoFiles.forEach(async (filePath) => {
			const auto: AutoType = await this._importFiles(filePath);

			this.autos.set(auto.correspondingCommandName, auto);
		});

		const menuFiles = await globPromise(
			platform() === 'win32'
				? `${__dirname}\\..\\contextmenus\\*{.ts,.js}`
				: `${__dirname}/../contextmenus/*{.ts,.js}`
		);

		menuFiles.forEach(async (filePath) => {
			const menu: MessageContextMenuType | UserContextMenuType = await this._importFiles(
				filePath
			);

			this.commands.set(menu.name, menu);
			slashCommands.push(menu);
		});

		this.once('ready', async () => {
			logger.info('Bot is online');
			await this.guilds.fetch();
			await this._loadCache();
			await this._firestoneInit();
			setInterval(this._threadScan, NUMBER.THREAD_SCAN, this);
			setInterval(this._birthdayScan, NUMBER.BIRTHDAY_SCAN, this);
			setInterval(this._idleOnboardCallScan, NUMBER.ONBOARD_CALL_SCAN, this);
			if (process.env.PM2_MODE === 'dev' || process.env.MODE === 'dev') {
				await this._registerCommands({
					guildId: process.env.GUILDID,
					commands: slashCommands
				});
			} else {
				this._registerCommands({
					commands: slashCommands
				});
			}
		});

		// Load Events
		const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);

		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this._importFiles(filePath);

			this.on(event.eventName, event.run);
		});
	}

	private async _firestoneInit() {
		const app = initializeApp({
			projectId: process.env.PROJECTID
		});
		const db = getFirestore(app);
		const guildQuery = query(collection(db, 'Guilds'));
		const guildsSnapshot = await getDocs(guildQuery);

		const batch = writeBatch(db);

		let guildsCache: GuildSettingCache;

		if (!guildsSnapshot.empty) {
			const queries: GuildSettingCache = {};

			guildsSnapshot.forEach((query) => {
				queries[query.id] = query.data() as GuildSettingInform;
			});
			for (const guildId of this.guilds.cache.keys()) {
				if (guildId in queries) {
					const guildQuery = queries[guildId];

					guildsCache = {
						...guildsCache,
						[guildId]: {
							birthdayChannelId: guildQuery.birthdayChannelId ?? null,
							forwardForumChannelId: guildQuery.forwardForumChannelId ?? null
						}
					};
				} else {
					guildsCache = {
						...guildsCache,
						[guildId]: templateGuildSettingInform
					};
					batch.set(doc(db, 'Guilds', guildId), {
						...templateGuildSettingInform
					});
				}
			}
		} else {
			logger.info('Init Database...');
			for (const guildId of this.guilds.cache.keys()) {
				guildsCache = {
					...guildsCache,
					[guildId]: templateGuildSettingInform
				};
				batch.set(doc(db, 'Guilds', guildId), {
					...templateGuildSettingInform
				});
			}
		}
		await batch.commit();
		myCache.mySet('GuildSettings', guildsCache);
	}

	private async _loadCache() {
		let exitFlag = false;
		const cacheResults = await Promise.all([
			findProjects(),
			findSkills(),
			findMembers(),
			findServers()
		]);

		const rowNames: Array<keyof CacheType> = ['Projects', 'Skills', 'Members', 'Servers'];

		cacheResults.forEach((result, index) => {
			if (typeof result === 'boolean') {
				this.table.addRow(rowNames[index], '✅ Fetched and cached');
			} else {
				// todo show the error details
				this.table.addRow(rowNames[index], `❌ Error: ${result}`);
				exitFlag = true;
			}
		});
		const cachedGuildsInform = myCache.myGet('Servers');
		const serverToBeUpdated: Array<Promise<GraphReturn<GraphQL_UpdateServerMutation>>> = [];
		// if (guilds.size === 0) {
		// 	logger.error('The bot is not running in any guild!');
		// 	process.exit(1);
		// }
		const voiceContextsCache: VoiceContextCache = {};
		const chatThreadsCache: ChatThreadCache = {};

		for (const [guildId, guild] of this.guilds.cache) {
			if (!(guildId in cachedGuildsInform)) {
				cachedGuildsInform[guildId] = {
					...templateGuildInform
				};
				serverToBeUpdated.push(
					updateServer({
						fields: {
							_id: guildId,
							name: guild.name,
							...templateGuildInform
						}
					})
				);
			}
			voiceContextsCache[guildId] = defaultGuildVoiceContext;
			chatThreadsCache[guildId] = [];
			if (!myCache.myGet('Teams')?.[guildId]) continue;
			for (const team of Object.values(myCache.myGet('Teams')[guildId])) {
				const { forumChannelId } = team;

				if (forumChannelId) {
					const forumChannel = guild.channels.cache.get(forumChannelId) as ForumChannel;
					const threads: Array<ThreadChannel> = [];

					if (!forumChannel) continue;
					const tagId = getTagId(forumChannel, FORUM_TAG.Chat);

					if (!tagId) continue;
					while (true) {
						const { result, error } = await awaitWrap(forumChannel.threads.fetch());

						if (error) break;
						threads.push(...result.threads.values());
						if (!result.hasMore) break;
					}
					chatThreadsCache[guildId].push(
						...threads
							.filter(
								(thread) =>
									thread?.appliedTags?.filter((tag) => tag === tagId)?.length !==
									0
							)
							.map((thread) => thread.id)
					);
				}
			}
		}
		(await Promise.all(serverToBeUpdated)).forEach((result) => {
			if (!result[1]) {
				logger.error(`\nUpdate Server Information Error\n${this.table.toString()}`);
				process.exit(1);
			}
		});
		myCache.mySet('Servers', cachedGuildsInform);
		myCache.mySet('VoiceContexts', voiceContextsCache);
		myCache.mySet('GardenContext', {});
		myCache.mySet('ChatThreads', chatThreadsCache);
		if (exitFlag) {
			logger.error(`\nFetching Data Error!\n${this.table.toString()}`);
			process.exit(1);
		} else {
			logger.info(`\n${this.table.toString()}`);
		}
		myCache.on('expired', async (key: keyof CacheType, value) => {
			// todo any better way to update the cache?
			switch (key) {
				case 'Members':
					await findMembers();
					break;
				case 'Projects':
					await findProjects();
					break;
			}
		});
	}

	private async _threadScan(client: Client) {
		const { result: gardens, error: gardenError } = await findProjectUpdates();

		if (gardenError) return;
		const guildIds = [...(await client.guilds.fetch()).keys()];
		// todo why _id could be null and serverID is []
		const filteredGardens: {
			[guildId: string]: {
				gardens: Array<{
					authorId: string;
					threadId: string;
				}>;
			};
		} = gardens.findProjectUpdates
			.filter(
				(garden) =>
					garden.threadDiscordID &&
					garden.author?._id &&
					garden.serverID.length &&
					guildIds.includes(garden.serverID[0])
			)
			.map((garden) => ({
				serverId: garden.serverID[0],
				authorId: garden.author._id,
				threadId: garden.threadDiscordID.match(/\d+$/)[0]
			}))
			.reduce((pre, cur) => {
				if (cur.serverId in pre) {
					pre[cur.serverId].gardens.push({
						authorId: cur.authorId,
						threadId: cur.threadId
					});
				} else {
					pre[cur.serverId] = {
						gardens: [
							{
								authorId: cur.authorId,
								threadId: cur.threadId
							}
						]
					};
				}
				return pre;
			}, {});

		const oneDayInMil = 24 * 60 * 60 * 1000;

		for (const [guildId, guild] of client.guilds.cache) {
			if (!filteredGardens[guildId]) continue;
			for (const { authorId, threadId } of filteredGardens[guildId].gardens) {
				if (!guild.available) continue;
				let thread = guild.channels.cache.get(threadId) as ThreadChannel;

				if (!thread) {
					const { result: tmpThread, error: tmpError } = await awaitWrap(
						guild.channels.fetch(threadId)
					);

					if (tmpError) continue;
					if (tmpThread.isThread()) {
						thread = tmpThread;
					} else continue;
				}
				if (thread.archived || thread.locked) continue;
				const current = new Date().getTime();
				const { messages, autoArchiveDuration } = thread;
				let { lastMessage } = thread;

				if (!lastMessage) {
					const lastMsg = (await messages.fetch({ limit: 1 }))?.first();

					if (!lastMsg) continue;
					lastMessage = lastMsg;
				}

				if (
					autoArchiveDuration === ThreadAutoArchiveDuration.ThreeDays ||
					autoArchiveDuration === ThreadAutoArchiveDuration.OneWeek
				) {
					if (
						lastMessage.createdTimestamp + autoArchiveDuration * 60 * 1000 - current <=
						oneDayInMil
					) {
						await thread.send({
							content: `Hi, <@${authorId}>, this thread will be closed in 1 day. Time to make a decision.`,
							components: [
								new ActionRowBuilder<ButtonBuilder>().addComponents([
									new ButtonBuilder()
										.setCustomId(ButtonCustomIdEnum.ArchivePost)
										.setLabel('Archive this thread')
										.setStyle(ButtonStyle.Danger)
										.setEmoji('🗃️'),
									new ButtonBuilder()
										.setLabel(
											`Archive this thread in ${
												autoArchiveDuration / (24 * 60)
											} days`
										)
										.setCustomId(ButtonCustomIdEnum.PostponeArchive)
										.setStyle(ButtonStyle.Success)
										.setEmoji('💡')
								])
							]
						});
						await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneDay);
					}
				}
			}
		}
	}

	private async _birthdayScan(client: Client) {
		if (!myCache.myHas('GuildSettings')) return;
		const soilGuildId = process.env.GUILDID;
		const soilGuild = client.guilds.cache.get(soilGuildId);

		if (!soilGuild) return;
		const soilGuildBirthdayChannelId =
			myCache.myGet('GuildSettings')[soilGuildId]?.birthdayChannelId;
		const soilGuildBirthdayChannel = soilGuild.channels.cache.get(
			soilGuildBirthdayChannelId
		) as TextChannel;

		if (!soilGuildBirthdayChannel) return;

		const db = getFirestore(getApp());
		const batch = writeBatch(db);

		const birthdayQuery = query(collection(db, 'Birthday'));
		const current = Math.floor(new Date().getTime() / 1000);
		const nonBirthdayArray = [];
		const birthdayArray: Array<{ id: string } & BirthdayInform> = (
			await getDocs<BirthdayInform>(birthdayQuery as Query<BirthdayInform>)
		).docs
			.map((doc) => ({
				id: doc.id,
				...doc.data()
			}))
			.sort((a, b) => a.date - b.date)
			.reduce((pre, cur) => {
				const { date, month, offset, day, id: userId } = cur;

				if (current > date) {
					pre.push(cur);
					const result = getNextBirthday(Number(month), Number(day), offset);

					batch.update<BirthdayInform>(
						doc(db, 'Birthday', userId) as DocumentReference<BirthdayInform>,
						{
							date: result.birthday
						}
					);
				} else {
					nonBirthdayArray.push(cur.id);
				}
				return pre;
			}, []);

		if (birthdayArray.length === 0) return;

		let birthdayContent = birthdayArray.reduce((pre, cur) => {
			const tmp = pre + `<@${cur.id}>`;

			return tmp;
		}, '');

		birthdayContent += ', today is your birthday! Enjoy your day!';

		const embed = new EmbedBuilder().setTitle('Happy Birthday!🥳').setImage(LINK.BIRTHDAY_PIC);

		if (nonBirthdayArray.length !== 0) {
			embed.setDescription(`Next superstar is <@${nonBirthdayArray[0]}>!`);
		} else {
			embed.setDescription(`Next superstar is <@${birthdayArray[0].id}>!`);
		}

		await soilGuildBirthdayChannel.send({
			content: birthdayContent,
			embeds: [embed]
		});
		await batch.commit();
	}

	private async _idleOnboardCallScan(client: Client) {
		for (const [guildId, guild] of client.guilds.cache) {
			const voiceContexts = myCache.myGet('VoiceContexts');
			const guildVoiceContext = voiceContexts[guildId];

			if (!guildVoiceContext.channelId) continue;
			const voiceChannel = guild.channels.cache.get(
				guildVoiceContext.channelId
			) as VoiceChannel;

			if (!voiceChannel) continue;
			if (checkOnboardPermission(voiceChannel, guild.members.me.id)) continue;
			if (voiceChannel.members.size === 0) {
				if (guildVoiceContext.isNotified) {
					const { hostId, timestamp, messageId } = guildVoiceContext;
					const targetMsg = await voiceChannel.messages.fetch(messageId);

					const buttonJson = targetMsg.components[0].toJSON();
					const embedJson = targetMsg.embeds[0].toJSON();

					buttonJson.components[0].disabled = true;
					buttonJson.components[1].disabled = true;

					const title = `${guild.name} Onboarding Call Ended`;

					const difference = new Date().getTime() - timestamp * 1000;

					embedJson.description += sprintf(
						'\n`%s` This onboarding call was auto ended.',
						convertMsToTime(difference),
						hostId
					);
					embedJson.title = title;

					await targetMsg.edit({
						embeds: [embedJson],
						components: [buttonJson]
					});

					voiceChannel.send({
						content: `<@${hostId}>, onboarding call has been closed now.`
					});
					myCache.mySet('VoiceContexts', {
						...voiceContexts,
						[guildId]: defaultGuildVoiceContext
					});
				} else {
					voiceChannel.send({
						content: `<@${guildVoiceContext.hostId}>, no member is in this channel now. Do you want to cloes this onboarding call?`,
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents([
								new ButtonBuilder()
									.setLabel('Jump to the Dashboard')
									.setStyle(ButtonStyle.Link)
									.setURL(guildVoiceContext.messageLink)
							])
						]
					});
					myCache.mySet('VoiceContexts', {
						...voiceContexts,
						[guildId]: {
							...guildVoiceContext,
							isNotified: true
						}
					});
				}
			}
		}
	}
}
