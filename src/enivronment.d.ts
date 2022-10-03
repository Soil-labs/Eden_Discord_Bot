import { CommandNameEmun } from './types/Command';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			GUILDID: string;
			PROJECTID: string;
			PM2_MODE: 'dev' | 'prod';
			PM2_ENDPOINT: string;
			PM2_FRONTEND: string;
			PM2_DMDISABLED: boolean;
			PM2_ALLOWCOMMANDS: Array<CommandNameEmun>;
		}
	}
}

export {};
