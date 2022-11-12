import {
	ApplicationCommandType,
	GuildMember,
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
	PermissionResolvable,
	UserApplicationCommandData,
	UserContextMenuCommandInteraction
} from 'discord.js';

import { MyClient } from '../structures/Client';

export interface ExtendedUserContextMenuInteraction extends UserContextMenuCommandInteraction {
	targetMember: GuildMember;
	member: GuildMember;
}

export interface ExtendedMessageContextMenuInteraction
	extends MessageContextMenuCommandInteraction {
	targetMember: GuildMember;
	member: GuildMember;
}

interface MessageContextMenuCommandRunOption {
	client: MyClient;
	interaction: ExtendedMessageContextMenuInteraction;
}

interface UserContextMenuCommandRunOption {
	client: MyClient;
	interaction: ExtendedUserContextMenuInteraction;
}

type MessageContextMenuRunFunction = (options: MessageContextMenuCommandRunOption) => any;
type UserContextMenuRunFunction = (options: UserContextMenuCommandRunOption) => any;

type ContextMenuNameEnum = 'Read my profile';
export type UserContextMenuType = {
	userPermissions?: PermissionResolvable[];
	execute: UserContextMenuRunFunction;
	name: ContextMenuNameEnum;
	type: ApplicationCommandType.User;
} & UserApplicationCommandData;

export type MessageContextMenuType = {
	userPermissions?: PermissionResolvable[];
	execute: MessageContextMenuRunFunction;
	name: ContextMenuNameEnum;
	type: ApplicationCommandType.Message;
} & MessageApplicationCommandData;
