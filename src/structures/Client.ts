import AsciiTable from 'ascii-table';
import {
	ChatInputApplicationCommandData,
	Client,
	ClientEvents,
	Collection,
	Intents,
	MessageActionRow,
	MessageApplicationCommandData,
	MessageButton,
	MessageEmbed,
	TextChannel,
	ThreadChannel,
	UserApplicationCommandData,
	VoiceChannel
} from 'discord.js';
import { getApp, initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, query, writeBatch } from 'firebase/firestore';
import glob from 'glob';
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
import { ButtonType } from '../types/Button';
import {
	BirthdayInform,
	CacheType,
	GuildSettingCache,
	GuildSettingInform,
	MemberId,
	templateGuildInform,
	templateGuildSettingInform,
	VoiceContextCache
} from '../types/Cache';
import { CommandType } from '../types/Command';
import { RegisterCommandsOptions } from '../types/CommandRegister';
import { MessageContextMenuType, UserContextMenuType } from '../types/ContextMenu';
import { ModalType } from '../types/Modal';
import { defaultGuildVoiceContext, NUMBER } from '../utils/const';
import { logger } from '../utils/logger';
import { awaitWrap, checkOnboardPermission, convertMsToTime, getNextBirthday } from '../utils/util';
import { myCache } from './Cache';
import { Event } from './Event';

const globPromise = promisify(glob);

export class MyClient extends Client {
	public commands: Collection<string, CommandType> = new Collection();
	public buttons: Collection<string, ButtonType> = new Collection();
	public modals: Collection<string, ModalType> = new Collection();
	public autos: Collection<string, AutoType> = new Collection();
	public menus: Collection<string, MessageContextMenuType | UserContextMenuType> =
		new Collection();

	private table: any;

	public constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_PRESENCES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES
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
		const commandFiles = await globPromise(`${__dirname}/../commands/*{.ts,.js}`);

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this._importFiles(filePath);

			if (!command.name) return;
			if (typeof allowCommands === 'undefined') {
				this.commands.set(command.name, command);
				slashCommands.push(command);
				return;
			}
			if (allowCommands.includes(command.name)) {
				this.commands.set(command.name, command);
				slashCommands.push(command);
			}
		});

		const buttonFiles = await globPromise(`${__dirname}/../buttons/*{.ts,.js}`);

		buttonFiles.forEach(async (filePath) => {
			const button: ButtonType = await this._importFiles(filePath);

			button.customIds.forEach((customId) => {
				this.buttons.set(customId, button);
			});
		});

		const modalFiles = await globPromise(`${__dirname}/../modals/*{.ts,.js}`);

		modalFiles.forEach(async (filePath) => {
			const modal: ModalType = await this._importFiles(filePath);

			this.modals.set(modal.customId, modal);
		});

		const autoFiles = await globPromise(`${__dirname}/../autocompletes/*{.ts,.js}`);

		autoFiles.forEach(async (filePath) => {
			const auto: AutoType = await this._importFiles(filePath);

			this.autos.set(auto.correspondingCommandName, auto);
		});

		const menuFiles = await globPromise(`${__dirname}/../contextmenus/*{.ts,.js}`);

		menuFiles.forEach(async (filePath) => {
			const menu: MessageContextMenuType | UserContextMenuType = await this._importFiles(
				filePath
			);

			this.menus.set(menu.name, menu);
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
							forwardChannelId: guildQuery.forwardChannelId ?? null
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
		const cachedGuildInform = myCache.myGet('Servers');
		const serverToBeUpdated: Array<Promise<GraphReturn<GraphQL_UpdateServerMutation>>> = [];
		// if (guilds.size === 0) {
		// 	logger.error('The bot is not running in any guild!');
		// 	process.exit(1);
		// }
		const voiceContexts: VoiceContextCache = {};

		this.guilds.cache.forEach((guild, guildId) => {
			if (!(guildId in cachedGuildInform)) {
				cachedGuildInform[guildId] = {
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
			voiceContexts[guildId] = defaultGuildVoiceContext;
		});
		(await Promise.all(serverToBeUpdated)).forEach((result) => {
			if (!result[1]) {
				logger.error(`\nUpdate Server Information Error\n${this.table.toString()}`);
				process.exit(1);
			}
		});
		myCache.mySet('Servers', cachedGuildInform);
		myCache.mySet('VoiceContexts', voiceContexts);

		if (exitFlag) {
			// todo change colors to red
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
				case 'Skills':
					await findSkills();
					break;
			}
		});
	}

	private async _threadScan(client: Client) {
		const { result: gardens, error: gardenError } = await findProjectUpdates();

		if (gardenError) return;
		// todo why _id could be null and serverID is []
		const filteredGardens = gardens.findProjectUpdates
			.filter(
				(garden) => garden.threadDiscordID && garden.author?._id && garden.serverID.length
			)
			.map((garden) => ({
				serverId: garden.serverID[0],
				authorId: garden.author._id,
				threadId: garden.threadDiscordID.match(/\d+$/)[0]
			}));

		for (const { serverId, authorId, threadId } of filteredGardens) {
			const guild = client.guilds.cache.get(serverId);

			if (!guild) continue;
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
			const firstMsg = (await messages.fetch({ limit: 1 }))?.first();

			if (!firstMsg) continue;
			const autoArchiveDay = autoArchiveDuration / (24 * 60);

			if (autoArchiveDay === 3 || autoArchiveDay === 7) {
				// todo remember to change it to the normal value
				const oneDayInMil = 24 * 60 * 60 * 1000;

				if (
					firstMsg.createdTimestamp + autoArchiveDuration * 60 * 1000 - current <=
					oneDayInMil
				) {
					thread.setAutoArchiveDuration(1440);
					thread.send({
						content: `Hi, <@${authorId}>, this thread will be closed in 1 day. Time to make a decision.`,
						components: [
							new MessageActionRow().addComponents([
								new MessageButton()
									.setCustomId('expired')
									.setLabel('Archive this thread Now')
									.setStyle('DANGER')
									.setEmoji('🗃️'),
								new MessageButton()
									.setLabel(
										`Archive this thread in ${
											autoArchiveDuration / (24 * 60)
										} days`
									)
									.setCustomId('putoffexpire')
									.setStyle('SUCCESS')
									.setEmoji('💡')
							])
						]
					});
				}
			}
		}
	}

	private async _birthdayScan(client: Client) {
		const db = getFirestore(getApp());
		const batch = writeBatch(db);

		const birthdayQuery = query(collection(db, 'Birthday'));
		const birthdaysSnapshot = await getDocs(birthdayQuery);
		const birthdayInReadyMembers: Array<{
			memberId: MemberId;
			nextBirthday: Number;
		}> = [];

		birthdaysSnapshot.forEach((birthday) => {
			const { id: memberId } = birthday;
			const birthdayData = birthday.data() as BirthdayInform;
			const current = Math.floor(new Date().getTime() / 1000);

			if (current > birthdayData.date) {
				const nextBirthday = getNextBirthday(
					Number(birthdayData.month),
					Number(birthdayData.day),
					birthdayData.offset
				);

				birthdayInReadyMembers.push({
					memberId: memberId,
					nextBirthday: nextBirthday
				});
				const toBeUpdated: BirthdayInform = {
					...birthdayData,
					date: nextBirthday
				};

				batch.update(doc(db, 'Birthday', memberId), toBeUpdated);
			}
		});

		const guildSettingCache = myCache.myGet('GuildSettings');

		for (const guildId of Object.keys(guildSettingCache)) {
			const birthdayChannelId = guildSettingCache[guildId].birthdayChannelId;

			if (!birthdayChannelId) continue;
			const guild = client.guilds.cache.get(guildId);

			if (!guild) continue;
			const channel = guild.channels.cache.get(birthdayChannelId) as TextChannel;

			if (!channel) continue;
			for (const { memberId, nextBirthday } of birthdayInReadyMembers) {
				let member = guild.members.cache.get(memberId);

				if (!member) {
					const { result, error } = await awaitWrap(guild.members.fetch(memberId));

					if (error) continue;
					member = result;
				}
				channel.send({
					content: `<@${memberId}>`,
					embeds: [
						new MessageEmbed()
							.setAuthor({
								name: `@${member.displayName}`,
								iconURL: member.user.avatarURL()
							})
							.setTitle('Happy Birthday!🥳')
							.setDescription(`Next Birthday: <t:${nextBirthday}>`)
					]
				});
			}
		}
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
			if (checkOnboardPermission(voiceChannel, guild.me.id)) continue;
			if (voiceChannel.members.size === 0) {
				if (guildVoiceContext.isNotified) {
					const { hostId, timestamp, messageId } = guildVoiceContext;
					const targetMsg = await voiceChannel.messages.fetch(messageId);

					const button = targetMsg.components;

					button[0].components[0].disabled = true;
					button[0].components[1].disabled = true;

					const embeds = targetMsg.embeds;
					const title = `${guild.name} Onboarding Call Ended`;

					const difference = new Date().getTime() - timestamp * 1000;

					embeds[0].description += sprintf(
						'\n`%s` This onboarding call was auto ended.',
						convertMsToTime(difference),
						hostId
					);

					embeds[0].title = title;
					await targetMsg.edit({
						embeds: embeds,
						components: button
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
							new MessageActionRow().addComponents([
								new MessageButton()
									.setLabel('Jump to the Dashboard')
									.setStyle('LINK')
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
