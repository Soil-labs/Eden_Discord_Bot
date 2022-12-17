/* eslint-disable no-unused-vars */
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
export enum CommandNameEmun {
	Set = 'set',
	Champion = 'champion',
	Count ='count',
	Find = 'find',
	Invite = 'invite',
	Onboard = 'onboard',
	Project = 'project',
	Signup = 'signup',
	Garden = 'garden',
	Birthday = 'birthday',
	Help = 'help',
	Endorse = 'endorse',
	Collab = 'collab',
}

export type CommandType = {
	name: CommandNameEmun;
	userPermissions?: PermissionResolvable[];
	type: ApplicationCommandType.ChatInput;
	execute: RunFunction;
} & ChatInputApplicationCommandData;
