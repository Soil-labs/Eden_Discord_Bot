import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable
} from 'discord.js';
import { MyClient } from '../structures/Client';

export interface ExtendedCommandInteration extends CommandInteraction{
    member: GuildMember
}

interface CommandRunOptions {
	client: MyClient;
	interaction: ExtendedCommandInteration;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: CommandRunOptions) => any;

export type CommandType = {
	userPermissions?: PermissionResolvable[];
	execute: RunFunction;
} & ChatInputApplicationCommandData;
