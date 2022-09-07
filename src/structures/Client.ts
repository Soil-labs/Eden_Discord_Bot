import {
	ApplicationCommandStringOption,
	ChatInputApplicationCommandData,
	Client,
	ClientEvents,
	Collection,
	CommandInteractionOption,
	Intents
} from 'discord.js';
import { initializeApp } from 'firebase/app';
import { CommandType } from '../types/Command';

import glob from 'glob';
import { promisify } from 'util';
import { RegisterCommandsOptions } from '../types/CommandRegister';
import { logger } from '../utils/logger';
import { Event } from './Event';
import { myCache } from '../utils/cache';
import { ButtonType } from '../types/Button';
import { ModalType } from '../types/Modal';
import { AutoType } from '../types/Auto';

const globPromise = promisify(glob);

export class MyClient extends Client {
	public commands: Collection<string, CommandType> = new Collection();
	public buttons: Collection<string, ButtonType> = new Collection();
	public modals: Collection<string, ModalType> = new Collection();
	public autos: Collection<string, AutoType> = new Collection();

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
	}

	public start() {
		this._loadFiles();
		this.login(process.env.botSecretToken);
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
		const slashCommands: ChatInputApplicationCommandData[] = [];
		const commandFiles = await globPromise(`${__dirname}/../commands/*.ts`);
		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this._importFiles(filePath);
			if (!command.name) return;
			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		const buttonFiles = await globPromise(`${__dirname}/../buttons/*.ts`);
		buttonFiles.forEach(async (filePath) => {
			const button: ButtonType = await this._importFiles(filePath);
			button.customIds.forEach((customId) => {
				this.buttons.set(customId, button);
			});
		});

		const modalFiles = await globPromise(`${__dirname}/../modals/*.ts`);
		modalFiles.forEach(async (filePath) => {
			const modal: ModalType = await this._importFiles(filePath);
			this.modals.set(modal.customId, modal);
		});

		const autoFiles = await globPromise(`${__dirname}/../autocompletes/*.ts`);
		autoFiles.forEach(async (filePath) => {
			const auto: AutoType = await this._importFiles(filePath);
			this.autos.set(auto.CorrespondingCommandName, auto);
		});

		this.once('ready', async () => {
			await this._firestoneInit();
			logger.info('Bot is online');
			if (process.env.mode === 'dev') {
				this._registerCommands({
					guildId: process.env.guildId,
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
		// const app = initializeApp({
		// 	projectId: process.env.firestoreId
		// });
		// const db = getFirestore(app);
		// const guildQuery = query(collection(db, 'Guilds'));
	}
}
