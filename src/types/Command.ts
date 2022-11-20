import {
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable
} from 'discord.js';

import { MyClient } from '../structures/Client';

export interface ExtendedCommandInteration extends CommandInteraction {
	member: GuildMember;
	commandName: CommandNameEmun;
}

interface CommandRunOptions {
	client: MyClient;
	interaction: ExtendedCommandInteration;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: CommandRunOptions) => any;
export type CommandNameEmun =
	| `set`
	| 'champion'
	| 'count'
	| 'find'
	| 'invite'
	| 'onboard'
	| 'project'
	| 'signup'
	| 'garden'
	| 'birthday'
	| 'help'
	| 'endorse'
	| 'collab';
export type CommandType = {
	name: CommandNameEmun;
	userPermissions?: PermissionResolvable[];
	type: ApplicationCommandType.ChatInput;
	execute: RunFunction;
} & ChatInputApplicationCommandData;
