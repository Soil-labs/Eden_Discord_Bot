declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			GUILDID: string;
			MODE: 'dev' | 'prod';
			VERSION: "Test" | "Develop" | "Productio"
			ALLOWCOMMANDS: Array<string>;
			PROJECTID: string;
			DMALLOWED: boolean;
		}
	}
}

export {};
